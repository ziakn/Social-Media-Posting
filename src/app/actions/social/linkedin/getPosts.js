// app/actions/social/linkedin/getPosts.js
"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Fetch LinkedIn posts for the current user
 */
export async function fetchLinkedinPosts(status = "published") {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const q = query(
            collection(db, "linkedin_posts"),
            where("userId", "==", user.id),
            where("status", "==", status === "published" ? "posted" : status), // LinkedIn status in existing code is "posted"
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
                scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt || null,
            };
        });

        return { success: true, posts };

    } catch (error) {
        console.error("Error fetching LinkedIn posts:", error);
        return { success: false, message: error.message };
    }
}
