"use server";

import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    serverTimestamp,
    orderBy,
    documentId
} from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Actions below use verifyToken() directly since it returns the full user payload (id, email, name, role, etc.)

export async function getTickets() {
    try {
        const user = await verifyToken();
        if (!user) throw new Error("Unauthorized");

        let q;
        const ticketsRef = collection(db, "tickets");

        if (user.role === "Administrator") {
            q = query(ticketsRef, orderBy("lastMessageAt", "desc"));
        } else {
            q = query(
                ticketsRef,
                where("userId", "==", user.id),
                orderBy("lastMessageAt", "desc")
            );
        }

        const snapshot = await getDocs(q);
        const tickets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Serialize Firestore timestamps
            createdAt: doc.data().createdAt?.toMillis() || null,
            updatedAt: doc.data().updatedAt?.toMillis() || null,
            lastMessageAt: doc.data().lastMessageAt?.toMillis() || null,
        }));

        return { success: true, tickets };
    } catch (error) {
        console.error("Error fetching tickets action:", error);
        return { success: false, error: error.message };
    }
}

export async function getTicketDetails(id) {
    try {
        const user = await verifyToken();
        if (!user) throw new Error("Unauthorized");

        const ticketRef = doc(db, "tickets", id);
        const ticketSnap = await getDoc(ticketRef);

        if (!ticketSnap.exists()) throw new Error("Ticket not found");

        const ticketData = ticketSnap.data();
        const isAdmin = user.role === "Administrator";

        if (!isAdmin && ticketData.userId !== user.id) {
            throw new Error("Unauthorized");
        }

        const messagesQuery = query(
            collection(db, "ticket_messages"),
            where("ticketId", "==", id),
            orderBy("createdAt", "asc")
        );
        const messagesSnap = await getDocs(messagesQuery);
        const messages = messagesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toMillis() || null,
        }));

        return {
            success: true,
            ticket: {
                id,
                ...ticketData,
                createdAt: ticketData.createdAt?.toMillis() || null,
                updatedAt: ticketData.updatedAt?.toMillis() || null,
                lastMessageAt: ticketData.lastMessageAt?.toMillis() || null,
            },
            messages
        };
    } catch (error) {
        console.error("Error fetching ticket details action:", error);
        return { success: false, error: error.message };
    }
}

export async function createTicket(formData) {
    try {
        const user = await verifyToken();
        if (!user) throw new Error("Unauthorized");

        const { subject, priority, message } = formData;

        if (!subject || !priority || !message) {
            throw new Error("Missing required fields");
        }

        const ticketData = {
            subject,
            priority,
            status: "open",
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessageAt: serverTimestamp(),
        };

        const ticketRef = await addDoc(collection(db, "tickets"), ticketData);

        await addDoc(collection(db, "ticket_messages"), {
            ticketId: ticketRef.id,
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            message,
            createdAt: serverTimestamp(),
        });

        revalidatePath("/admin/help");
        return { success: true, ticketId: ticketRef.id };
    } catch (error) {
        console.error("Error creating ticket action:", error);
        return { success: false, error: error.message };
    }
}

export async function updateTicketStatus(id, status) {
    try {
        const user = await verifyToken();
        if (!user) throw new Error("Unauthorized");

        const ticketRef = doc(db, "tickets", id);
        const ticketSnap = await getDoc(ticketRef);

        if (!ticketSnap.exists()) throw new Error("Ticket not found");

        const ticketData = ticketSnap.data();
        const isAdmin = user.role === "Administrator";

        if (!isAdmin && ticketData.userId !== user.id) {
            throw new Error("Unauthorized");
        }

        await updateDoc(ticketRef, {
            status,
            updatedAt: serverTimestamp()
        });

        // Add System Message for audit trail
        await addDoc(collection(db, "ticket_messages"), {
            ticketId: id,
            userId: "system",
            userName: "System",
            userRole: "system",
            message: `Status changed to ${status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}`,
            createdAt: serverTimestamp(),
            isSystem: true
        });

        revalidatePath("/admin/help");
        return { success: true };
    } catch (error) {
        console.error("Error updating ticket status action:", error);
        return { success: false, error: error.message };
    }
}

export async function sendTicketMessage(ticketId, message) {
    try {
        const user = await verifyToken();
        if (!user) throw new Error("Unauthorized");

        if (!message) throw new Error("Message is required");

        const ticketRef = doc(db, "tickets", ticketId);
        const ticketSnap = await getDoc(ticketRef);

        if (!ticketSnap.exists()) throw new Error("Ticket not found");

        const ticketData = ticketSnap.data();
        const isAdmin = user.role === "Administrator";

        if (!isAdmin && ticketData.userId !== user.id) {
            throw new Error("Unauthorized");
        }

        await addDoc(collection(db, "ticket_messages"), {
            ticketId,
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            message,
            createdAt: serverTimestamp(),
        });

        const updates = {
            lastMessageAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        if (isAdmin && ticketData.status === "open") {
            updates.status = "in-progress";

            // Add System Message for auto-transition
            await addDoc(collection(db, "ticket_messages"), {
                ticketId,
                userId: "system",
                userName: "System",
                userRole: "system",
                message: "Status automatically changed to In Progress",
                createdAt: serverTimestamp(),
                isSystem: true
            });
        }

        await updateDoc(ticketRef, updates);

        revalidatePath("/admin/help");
        return { success: true };
    } catch (error) {
        console.error("Error sending ticket message action:", error);
        return { success: false, error: error.message };
    }
}
