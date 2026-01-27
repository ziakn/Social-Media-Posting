"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, doc, getDoc, limit, startAfter } from "firebase/firestore";
import { unstable_cache } from "next/cache";

/**
 * Helper to safely serialize Firestore Timestamps, Dates, or Strings to ISO string
 */
const serializeDate = (dateVal) => {
    if (!dateVal) return null;
    if (typeof dateVal?.toDate === 'function') {
        return dateVal.toDate().toISOString();
    }
    if (dateVal instanceof Date) {
        return dateVal.toISOString();
    }
    if (typeof dateVal === 'string') {
        return dateVal;
    }
    return null;
};

/**
 * Public action to get published blog posts with pagination
 */
export async function getPaginatedPosts({ category = "All", lastDate = null, pageSize = 6 } = {}) {
    try {
        let constraints = [
            where("status", "==", "published"),
            orderBy("date", "desc")
        ];

        if (category && category !== "All") {
            constraints.push(where("category", "==", category));
        }

        if (lastDate) {
            constraints.push(startAfter(lastDate));
        }

        constraints.push(limit(pageSize));

        const q = query(collection(db, "blogs"), ...constraints);
        const snapshot = await getDocs(q);

        const posts = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: serializeDate(data.createdAt),
                updatedAt: serializeDate(data.updatedAt),
            };
        });

        console.log(`Fetch: Cat=${category}, From=${lastDate || 'start'}, Got=${posts.length}`);

        return { success: true, posts };
    } catch (error) {
        console.error("Error fetching paginated posts:", error);
        return { success: false, error: error.message, posts: [] };
    }
}

/**
 * Public action to get a single blog post by slug
 */
export async function getBlogPostBySlug(slug) {
    try {
        const q = query(
            collection(db, "blogs"),
            where("slug", "==", slug),
            where("status", "==", "published")
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return { success: false, error: "Post not found" };
        }

        const postDoc = snapshot.docs[0];
        const data = postDoc.data();
        const post = {
            id: postDoc.id,
            ...data,
            createdAt: serializeDate(data.createdAt),
            updatedAt: serializeDate(data.updatedAt),
        };

        return { success: true, post };
    } catch (error) {
        console.error("Error fetching blog post by slug:", error);
        return { success: false, error: error.message };
    }
}
