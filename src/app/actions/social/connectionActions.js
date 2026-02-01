"use server";

import { db } from "@/lib/firebase";
import {
    doc,
    getDoc,
    deleteDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

/**
 * Fetch pending connection details for the selection UI
 */
export async function getPendingConnection(pendingId) {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const docRef = doc(db, "pending_connections", pendingId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: "Pending connection not found or expired" };
        }

        const data = docSnap.data();

        // Security check: ensure the pending connection belongs to the requestor
        if (data.userId !== user.id) {
            return { success: false, error: "Unauthorized access to this connection" };
        }

        // Return necessary data for the UI (hide tokens)
        return {
            success: true,
            data: {
                id: docSnap.id,
                platform: data.platform,
                displayName: data.displayName,
                pages: data.pages || [], // List of available pages
            },
        };
    } catch (error) {
        console.error("Error fetching pending connection:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Confirm and finalize the Facebook connection with selected pages
 */
export async function confirmFacebookConnection(pendingId, selectedPageIds) {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // 1. Fetch Request
        const pendingRef = doc(db, "pending_connections", pendingId);
        const pendingSnap = await getDoc(pendingRef);

        if (!pendingSnap.exists()) {
            return { success: false, error: "Pending connection not found" };
        }

        const pendingData = pendingSnap.data();

        if (pendingData.userId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // 2. Filter Pages
        // Only keep pages that were in the original fetch AND are in the selection list
        const finalPages = (pendingData.pages || []).filter((p) =>
            selectedPageIds.includes(p.pageId)
        );

        if (finalPages.length === 0 && selectedPageIds.length > 0) {
            // Edge case: User sent IDs that don't match anything?
            return { success: false, error: "Invalid page selection" };
        }

        // If no pages selected, we might still want to connect the user profile? 
        // Usually for FB, we want at least one page or just the user if it supports user-posting (which we don't right now).
        // Assuming at least one page is required if pages are available.

        // 3. Deactivate old connections for this user/platform
        const socialAccountsRef = collection(db, "socialAccounts");
        const q = query(
            socialAccountsRef,
            where("userId", "==", user.id),
            where("platform", "==", "facebook"),
            where("status", "==", "active")
        );
        const existingAccountsSnap = await getDocs(q);
        for (const docSnap of existingAccountsSnap.docs) {
            await updateDoc(docSnap.ref, {
                status: "inactive",
                updatedAt: serverTimestamp(),
            });
        }

        // 4. Save Final Connection
        await addDoc(collection(db, "socialAccounts"), {
            userId: user.id,
            platform: "facebook",
            platformUserId: pendingData.platformUserId,
            displayName: pendingData.displayName,
            accessToken: pendingData.accessToken,
            refreshToken: pendingData.refreshToken || "",
            tokenExpiresAt: pendingData.tokenExpiresAt, // already a timestamp/date
            pages: finalPages, // ONLY the selected ones
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // 5. Cleanup
        await deleteDoc(pendingRef);

        return { success: true };
    } catch (error) {
        console.error("Error checking confirmation:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Confirm and finalize the LinkedIn connection with selected profiles
 */
export async function confirmLinkedinConnection(pendingId, selectedProfileIds) {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // 1. Fetch Request
        const pendingRef = doc(db, "pending_connections", pendingId);
        const pendingSnap = await getDoc(pendingRef);

        if (!pendingSnap.exists()) {
            return { success: false, error: "Pending connection not found" };
        }

        const pendingData = pendingSnap.data();
        if (pendingData.userId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // 2. Filter Profiles
        const finalProfiles = (pendingData.pages || []).filter((p) =>
            selectedProfileIds.includes(p.pageId) // using pageId as generic id field
        );

        if (finalProfiles.length === 0 && selectedProfileIds.length > 0) {
            return { success: false, error: "Invalid profile selection" };
        }

        // 3. Deactivate old connections
        const socialAccountsRef = collection(db, "socialAccounts");
        const q = query(
            socialAccountsRef,
            where("userId", "==", user.id),
            where("platform", "==", "linkedin"),
            where("status", "==", "active")
        );
        const existingAccountsSnap = await getDocs(q);
        for (const docSnap of existingAccountsSnap.docs) {
            await updateDoc(docSnap.ref, {
                status: "inactive",
                updatedAt: serverTimestamp(),
            });
        }

        // 4. Save Final Connections (Multiple Docs for LinkedIn)
        for (const profile of finalProfiles) {
            await addDoc(collection(db, "socialAccounts"), {
                userId: user.id,
                platform: "linkedin",
                accountType: profile.type || "unknown", // 'person' or 'organization'
                platformUserId: profile.platformUserId, // The actual ID
                platformUrn: profile.platformUrn,
                displayName: profile.pageName,
                username: profile.username || profile.pageName,
                profilePicture: profile.profilePicture,
                accessToken: pendingData.accessToken, // Shared token
                refreshToken: pendingData.refreshToken || null,
                tokenExpiresAt: pendingData.tokenExpiresAt,
                status: "active",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }

        // 5. Cleanup
        await deleteDoc(pendingRef);

        return { success: true };
    } catch (error) {
        console.error("Error checking confirmation:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Confirm and finalize the YouTube connection with selected channels
 */
export async function confirmYoutubeConnection(pendingId, selectedChannelIds) {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // 1. Fetch Request
        const pendingRef = doc(db, "pending_connections", pendingId);
        const pendingSnap = await getDoc(pendingRef);

        if (!pendingSnap.exists()) {
            return { success: false, error: "Pending connection not found" };
        }

        const pendingData = pendingSnap.data();
        if (pendingData.userId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // 2. Filter Channels
        const finalChannels = (pendingData.pages || []).filter((p) =>
            selectedChannelIds.includes(p.pageId)
        );

        if (finalChannels.length === 0 && selectedChannelIds.length > 0) {
            return { success: false, error: "Invalid channel selection" };
        }

        // 3. Deactivate old connections
        const socialAccountsRef = collection(db, "socialAccounts");
        const q = query(
            socialAccountsRef,
            where("userId", "==", user.id),
            where("platform", "==", "youtube"),
            where("status", "==", "active")
        );
        const existingAccountsSnap = await getDocs(q);
        for (const docSnap of existingAccountsSnap.docs) {
            await updateDoc(docSnap.ref, {
                status: "inactive",
                updatedAt: serverTimestamp(),
            });
        }

        // 4. Save Final Connections (Multiple Docs)
        for (const channel of finalChannels) {
            await addDoc(collection(db, "socialAccounts"), {
                userId: user.id,
                platform: "youtube",
                platformUserId: channel.platformUserId,
                displayName: channel.pageName,
                username: channel.username,
                profilePicture: channel.profilePicture,
                accessToken: pendingData.accessToken, // Shared token
                refreshToken: pendingData.refreshToken || null,
                tokenExpiresAt: pendingData.tokenExpiresAt,
                status: "active",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }

        // 5. Cleanup
        await deleteDoc(pendingRef);

        return { success: true };
    } catch (error) {
        console.error("Error checking confirmation:", error);
        return { success: false, error: error.message };
    }
}
