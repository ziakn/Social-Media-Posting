"use server";

import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Fetch published tweets for the current user
 */
export async function getTwitterPublishedPosts() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const q = query(
            collection(db, "twitter_posts"),
            where("userId", "==", user.id),
            where("status", "==", "posted"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || null,
            updatedAt: doc.data().updatedAt?.toDate?.() || null,
        }));

        return { success: true, posts };
    } catch (err) {
        console.error("Error fetching Twitter published posts:", err);
        return { success: false, message: err.message };
    }
}

/**
 * Fetch scheduled tweets for the current user
 */
export async function getTwitterScheduledPosts() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const q = query(
            collection(db, "twitter_posts"),
            where("userId", "==", user.id),
            where("status", "==", "scheduled"),
            orderBy("scheduledAt", "asc")
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || null,
            updatedAt: doc.data().updatedAt?.toDate?.() || null,
            scheduledAt: doc.data().scheduledAt?.toDate?.() || doc.data().scheduledAt,
        }));

        return { success: true, posts };
    } catch (err) {
        console.error("Error fetching Twitter scheduled posts:", err);
        return { success: false, message: err.message };
    }
}

/**
 * Delete a Twitter post from Firestore
 */
export async function deleteTwitterPost(postId) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const postRef = doc(db, "twitter_posts", postId);
        await deleteDoc(postRef);

        return { success: true, message: "Post deleted successfully" };
    } catch (err) {
        console.error("Error deleting Twitter post:", err);
        return { success: false, message: err.message };
    }
}
