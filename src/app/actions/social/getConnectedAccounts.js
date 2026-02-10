"use server";

// We need these tools to talk to the database and check who is logged in
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { unstable_cache } from "next/cache";

/**
 * 1. THE CACHED HELPER FUNCTION
 * 
 * This function does the heavy lifting. It talks to the database.
 * We wrap it in "unstable_cache" so it remembers the answer for a while.
 * This handles HIGH TRAFFIC because we don't ask the database constantly.
 */
const getCachedUserAccounts = unstable_cache(
    async (userId) => {
        try {
            // Step A: Prepare the question for the database
            // "Hey DB, give me all 'socialAccounts' for this userId that are 'active'"
            const q = query(
                collection(db, "socialAccounts"),
                where("userId", "==", userId),
                where("status", "==", "active")
            );

            // Step B: Ask the question
            const snapshot = await getDocs(q);

            // If the box is empty, return an empty list
            if (snapshot.empty) return [];

            // Step C: Count the accounts
            // We use a simple list to keep track of counts, like { facebook: 3, instagram: 1 }
            const platformCounts = {};

            snapshot.docs.forEach((doc) => {
                const data = doc.data();

                // Only count if there is a platform name (like 'facebook')
                if (data.platform) {
                    const key = data.platform.toLowerCase(); // make it lowercase ('Facebook' -> 'facebook')

                    // Check: Does this connection represent multiple pages?
                    // If yes, count the number of pages. If no, just count it as 1.
                    const count = (Array.isArray(data.pages) && data.pages.length > 0)
                        ? data.pages.length
                        : 1;

                    // Add to the total for this platform
                    platformCounts[key] = (platformCounts[key] || 0) + count;
                }
            });

            // Step D: Convert our list to a format the website likes
            // From { facebook: 3 } to [{ key: 'facebook', count: 3 }]
            return Object.entries(platformCounts).map(([key, count]) => ({
                key,
                count
            }));

        } catch (error) {
            console.error("Oops, something went wrong in the cache:", error);
            return []; // Return empty if we crash, so the site doesn't break
        }
    },
    ['user-connected-accounts'], // This name helps the computer file this information
    {
        revalidate: 3600, // Remember this answer for 1 hour (3600 seconds)
        tags: ['social-connections'] // A tag so we can force-refresh it later if we want
    }
);

/**
 * 2. THE MAIN ACTION
 * 
 * This is the function the website actually calls.
 * It's very simple because the helper function above does the work.
 */
export async function getConnectedAccounts() {
    try {
        // Step 1: Check who is knocking (verify user)
        const user = await verifyToken();

        // If we don't know who they are, stop here.
        if (!user) {
            return { success: false, data: [] };
        }

        // Step 2: Use our fast, cached helper to get the data
        const data = await getCachedUserAccounts(user.id);

        // Step 3: Send the data back to the website
        return { success: true, data };

    } catch (error) {
        // If anything blows up, log it and tell the website we failed
        console.error("Error fetching connected accounts:", error);
        return { success: false, error: error.message };
    }
}
/**
 * 3. GET DETAILED ACCOUNTS
 * 
 * Returns all active social accounts with full details for UI selection.
 */
export async function getDetailedConnectedAccounts() {
    try {
        const user = await verifyToken();
        if (!user) return { success: false, data: [] };

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...JSON.parse(JSON.stringify(doc.data()))
        }));

        // Filter accounts to ensure they have usable posting targets AND are unique
        const uniqueAccountsMap = new Map();

        accounts.forEach(acc => {
            // Robust unique key generation
            let uniqueId = acc.platformUserId;

            // Instagram specific fallback: platformUserId might be missing or generic
            if (acc.platform?.toLowerCase() === 'instagram') {
                uniqueId = acc.pageId || acc.platformUserId || acc.username;
            }

            // General fallback
            if (!uniqueId) {
                uniqueId = acc.email || acc.username || acc.id;
            }

            // Create a unique key based on platform and the best available ID
            const uniqueKey = `${acc.platform?.toLowerCase()}-${uniqueId}`;

            if (!uniqueAccountsMap.has(uniqueKey)) {
                if (['facebook', 'youtube'].includes(acc.platform?.toLowerCase())) {
                    // Start with basic check
                    if (Array.isArray(acc.pages) && acc.pages.length > 0) {
                        uniqueAccountsMap.set(uniqueKey, acc);
                    }
                } else {
                    // For others (LinkedIn, Twitter, IG, etc.), just include them
                    uniqueAccountsMap.set(uniqueKey, acc);
                }
            }
        });

        const filteredAccounts = Array.from(uniqueAccountsMap.values());

        // Clean sensitive data before sending to client
        const safeAccounts = filteredAccounts.map(({ accessToken, refreshToken, ...rest }) => rest);

        return JSON.parse(JSON.stringify({ success: true, data: safeAccounts }));
    } catch (error) {
        console.error("Error fetching detailed accounts:", error);
        return { success: false, error: error.message };
    }
}
