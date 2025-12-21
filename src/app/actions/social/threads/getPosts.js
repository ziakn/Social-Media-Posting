// app/actions/social/threads/getPosts.js
"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Fetch Threads posts for the current user
 */
export async function fetchThreadsPosts(status = "published") {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const q = query(
            collection(db, "threads_posts"),
            where("userId", "==", user.id),
            where("status", "==", status),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString(),
            updatedAt: doc.data().updatedAt?.toDate().toISOString(),
            scheduledAt: doc.data().scheduledAt?.toDate().toISOString(),
        }));

        return { success: true, posts };

    } catch (error) {
        console.error("Error fetching Threads posts:", error);
        return { success: false, message: error.message };
    }
}
