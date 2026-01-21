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
import { revalidatePath } from "next/cache";

const COLLECTION_NAME = "packages";

/**
 * Get all packages
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Result object with packages array
 */
export async function getPackages(filters = {}) {
    try {
        let q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));

        // Apply filters if needed (e.g., active only)
        if (filters.isActive !== undefined) {
            q = query(q, where("isActive", "==", filters.isActive));
        }

        const snapshot = await getDocs(q);
        const packages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate().toISOString() || null,
        }));

        return { success: true, packages };
    } catch (error) {
        console.error("Error fetching packages:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get a single package by ID
 * @param {string} id - Package ID
 * @returns {Promise<Object>} Result object with package data
 */
export async function getPackage(id) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                success: true,
                package: {
                    id: docSnap.id,
                    ...docSnap.data(),
                    createdAt: docSnap.data().createdAt?.toDate().toISOString() || null,
                    updatedAt: docSnap.data().updatedAt?.toDate().toISOString() || null,
                },
            };
        } else {
            return { success: false, error: "Package not found" };
        }
    } catch (error) {
        console.error("Error fetching package:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new package
 * @param {Object} data - Package data
 * @returns {Promise<Object>} Result object
 */
export async function createPackage(data) {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        revalidatePath("/admin/packages");
        return { success: true, id: docRef.id, message: "Package created successfully" };
    } catch (error) {
        console.error("Error creating package:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing package
 * @param {string} id - Package ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Result object
 */
export async function updatePackage(id, data) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });

        revalidatePath("/admin/packages");
        return { success: true, message: "Package updated successfully" };
    } catch (error) {
        console.error("Error updating package:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a package
 * @param {string} id - Package ID
 * @returns {Promise<Object>} Result object
 */
export async function deletePackage(id) {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        revalidatePath("/admin/packages");
        return { success: true, message: "Package deleted successfully" };
    } catch (error) {
        console.error("Error deleting package:", error);
        return { success: false, error: error.message };
    }
}
