"use server";

import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";
import { revalidatePath, revalidateTag } from "next/cache";

const COLLECTION_NAME = "blogs";

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
 * Get all blogs for admin
 * @returns {Promise<Object>} Result object with blogs array
 */
export async function getBlogs() {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const blogs = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: serializeDate(data.createdAt),
                updatedAt: serializeDate(data.updatedAt),
            };
        });

        return { success: true, blogs };
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get a single blog by ID
 * @param {string} id - Blog ID
 * @returns {Promise<Object>} Result object with blog data
 */
export async function getBlog(id) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                success: true,
                blog: {
                    id: docSnap.id,
                    ...data,
                    createdAt: serializeDate(data.createdAt),
                    updatedAt: serializeDate(data.updatedAt),
                },
            };
        } else {
            return { success: false, error: "Blog post not found" };
        }
    } catch (error) {
        console.error("Error fetching blog:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new blog post
 * @param {Object} data - Blog data
 * @param {string} userId - ID of the admin creating the post
 * @returns {Promise<Object>} Result object
 */
export async function createBlog(data, userId) {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        revalidatePath("/admin/blog");
        revalidatePath("/blog");
        revalidateTag("public-blogs");
        return { success: true, id: docRef.id, message: "Blog post created successfully" };
    } catch (error) {
        console.error("Error creating blog:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing blog post
 * @param {string} id - Blog ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Result object
 */
export async function updateBlog(id, data) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });

        revalidatePath("/admin/blog");
        revalidatePath("/blog");
        revalidatePath(`/blog/${data.slug || ''}`);
        revalidateTag("public-blogs");
        return { success: true, message: "Blog post updated successfully" };
    } catch (error) {
        console.error("Error updating blog:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a blog post
 * @param {string} id - Blog ID
 * @returns {Promise<Object>} Result object
 */
export async function deleteBlog(id) {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        revalidatePath("/admin/blog");
        revalidatePath("/blog");
        revalidateTag("public-blogs");
        return { success: true, message: "Blog post deleted successfully" };
    } catch (error) {
        console.error("Error deleting blog:", error);
        return { success: false, error: error.message };
    }
}
