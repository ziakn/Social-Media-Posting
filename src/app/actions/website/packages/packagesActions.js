"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { unstable_cache } from "next/cache";

/**
 * Internal function to fetch packages from database
 */
async function fetchPackagesFromDB() {
    const q = query(
        collection(db, "packages"),
        where("isActive", "==", true),
        orderBy("order", "asc")
    );

    const snapshot = await getDocs(q);
    const packages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Don't expose timestamps to public
        createdAt: null,
        updatedAt: null,
    }));

    return packages;
}

/**
 * Public action to get active packages for the pricing page
 * Uses caching to avoid unnecessary database queries
 * Cache is revalidated when packages are updated in admin
 */
export async function getPublicPackages() {
    try {
        // Cache the packages query for 1 hour (3600 seconds)
        // Tagged with 'public-packages' so admin can revalidate on update
        const getCachedPackages = unstable_cache(
            fetchPackagesFromDB,
            ['public-packages'],
            {
                revalidate: 3600, // Revalidate every hour
                tags: ['public-packages']
            }
        );

        const packages = await getCachedPackages();
        return { success: true, packages };
    } catch (error) {
        console.error("Error fetching public packages:", error);
        return { success: false, error: error.message, packages: [] };
    }
}
