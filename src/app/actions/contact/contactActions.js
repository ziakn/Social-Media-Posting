"use server";

import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

const COLLECTION_NAME = "contacts";

/**
 * Public action to submit a contact inquiry
 */
export async function submitContactAction(data) {
    try {
        const validatedData = contactSchema.parse(data);

        await addDoc(collection(db, COLLECTION_NAME), {
            ...validatedData,
            status: "pending",
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        });

        return {
            success: true,
            message: "Your inquiry has been submitted successfully.",
        };
    } catch (error) {
        console.error("submitContactAction error:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: "Something went wrong. Please try again later." };
    }
}

/**
 * Admin action to fetch all contact inquiries
 */
export async function getContactsAction() {
    try {
        const contactsRef = collection(db, COLLECTION_NAME);
        const q = query(contactsRef, orderBy("created_at", "desc"));
        const querySnapshot = await getDocs(q);

        const contacts = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            created_at: docSnap.data().created_at?.toDate().toISOString() || null,
            updated_at: docSnap.data().updated_at?.toDate().toISOString() || null,
        }));

        return {
            success: true,
            contacts,
        };
    } catch (error) {
        console.error("getContactsAction error:", error);
        return { success: false, error: "Failed to fetch inquiries." };
    }
}

/**
 * Admin action to update the status of an inquiry
 */
export async function updateContactStatusAction(id, status) {
    try {
        const contactRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(contactRef, {
            status,
            updated_at: serverTimestamp(),
        });

        revalidatePath("/admin/contact");
        return {
            success: true,
            message: "Inquiry status updated successfully.",
        };
    } catch (error) {
        console.error("updateContactStatusAction error:", error);
        return { success: false, error: "Failed to update inquiry status." };
    }
}

/**
 * Admin action to delete an inquiry
 */
export async function deleteContactAction(id) {
    try {
        const contactRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(contactRef);

        revalidatePath("/admin/contact");
        return {
            success: true,
            message: "Inquiry deleted successfully.",
        };
    } catch (error) {
        console.error("deleteContactAction error:", error);
        return { success: false, error: "Failed to delete inquiry." };
    }
}
