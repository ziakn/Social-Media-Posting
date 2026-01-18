"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Fetch Pinterest posts for the current user (Simple list)
 */
export async function fetchPinterestPosts(status = "published") {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const q = query(
            collection(db, "pinterest_posts"),
            where("userId", "==", user.id),
            where("status", "==", status),
            where("delete", "==", 0),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.().toISOString() || doc.data().createdAt || null,
            updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || doc.data().updatedAt || null,
            scheduledAt: doc.data().scheduledAt?.toDate?.().toISOString() || doc.data().scheduledAt || null,
            publishedAt: doc.data().publishedAt?.toDate?.().toISOString() || doc.data().publishedAt || null,
        }));

        return { success: true, posts };

    } catch (error) {
        console.error("Error fetching Pinterest posts:", error);
        return { success: false, message: error.message };
    }
}
