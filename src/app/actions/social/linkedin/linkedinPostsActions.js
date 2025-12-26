"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function fetchLinkedinPosts() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        const q = query(
            collection(db, "linkedin_posts"),
            where("userId", "==", user.id),
            where("status", "==", "posted"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));

        return { success: true, posts };
    } catch (error) {
        console.error("Error fetching LinkedIn posts:", error);
        return { success: false, message: error.message };
    }
}

export async function fetchScheduledLinkedinPosts() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        const q = query(
            collection(db, "linkedin_posts"),
            where("userId", "==", user.id),
            where("status", "==", "scheduled"),
            orderBy("scheduledAt", "asc")
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            scheduledAt: doc.data().scheduledAt?.toDate?.() || new Date(),
        }));

        return { success: true, posts };
    } catch (error) {
        console.error("Error fetching scheduled LinkedIn posts:", error);
        return { success: false, message: error.message };
    }
}

export async function getUserLinkedinAccounts() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "linkedin"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => ({
            id: doc.id,
            accountId: doc.id,
            name: doc.data().displayName,
            profilePicture: doc.data().profilePicture,
            platformUserId: doc.data().platformUserId,
        }));

        return { success: true, accounts };
    } catch (error) {
        console.error("Error fetching LinkedIn accounts:", error);
    }
}

export async function updateLinkedinPostSchedule(postId, scheduledAt) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        const postRef = doc(db, "linkedin_posts", postId);
        await updateDoc(postRef, {
            scheduledAt: new Date(scheduledAt),
            updatedAt: serverTimestamp()
        });

        return { success: true, message: "Post rescheduled successfully" };
    } catch (error) {
        console.error("Error rescheduling LinkedIn post:", error);
        return { success: false, message: error.message };
    }
}
