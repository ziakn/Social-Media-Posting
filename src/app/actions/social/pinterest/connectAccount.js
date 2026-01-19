"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function checkPinterestConnection() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { connected: false };
        }

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "pinterest"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { connected: false };
        }

        const accounts = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();

            // Ensure token is fresh by calling our management function
            // We ignore the return value, just want the side-effect of refreshing if needed
            try {
                await getValidPinterestAccessToken(user.id, data.accountId);
            } catch (e) {
                console.error(`Failed to refresh token for account ${data.accountId}, Proceeding with cached data:`, e);
            }

            // Note: Data here might be slightly stale if a refresh just happened, 
            // but for "Connected" status check, it's acceptable. 
            // If critical, we would re-fetch.

            return {
                id: doc.id,
                ...data,
                tokenExpiresAt: data.tokenExpiresAt?.toDate?.().toISOString() || data.tokenExpiresAt || null,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
            };
        }));

        const mainAccount = accounts[0];

        return {
            connected: true,
            displayName: mainAccount.username || mainAccount.pageName,
            tokenExpiresAt: mainAccount.tokenExpiresAt,
            count: accounts.length,
            accounts: accounts.map(acc => ({
                id: acc.id,
                displayName: acc.username || acc.pageName,
                profilePicture: acc.profilePicture,
                tokenExpiresAt: acc.tokenExpiresAt
            }))
        };

    } catch (error) {
        console.error("Error checking Pinterest connection:", error);
        return { connected: false };
    }
}

/**
 * Get a valid Pinterest Access Token.
 * Checks if the current token is expired or about to expire.
 * If so, uses the refresh token to get a new access token.
 */
export async function getValidPinterestAccessToken(userId, platformUserId, forceRefresh = false) {
    const q = query(
        collection(db, "socialAccounts"),
        where("userId", "==", userId),
        where("accountId", "==", platformUserId),
        where("platform", "==", "pinterest"),
        where("status", "==", "active")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        throw new Error("Pinterest account not found or inactive");
    }

    const docSnapshot = snapshot.docs[0];
    const account = docSnapshot.data();
    const docRef = docSnapshot.ref;

    // Check expiry. Default to 0 if not set (forces refresh if refresh token exists)
    // tokenExpiresAt is a Firestore Timestamp
    const expiryDate = account.tokenExpiresAt?.toDate ? account.tokenExpiresAt.toDate() : new Date(account.tokenExpiresAt || 0);
    const now = new Date();
    // Refresh if expired or expires in less than 5 minutes
    const fiveMinutes = 5 * 60 * 1000;

    let accessToken = account.accessToken;



    if (forceRefresh || (expiryDate.getTime() - now.getTime() < fiveMinutes)) {
        console.log(`Pinterest token ${forceRefresh ? "forced refresh" : "expired/expiring soon"}. Refreshing...`);
        accessToken = await refreshPinterestToken(docRef, account.refreshToken);
    }

    return {
        accessToken,
        accountId: account.accountId,
        platformrUserId: account.accountId // alias for clarity if needed
    };
}

/**
 * Refresh the Pinterest Access Token using the Refresh Token
 */
async function refreshPinterestToken(docRef, refreshToken) {
    if (!refreshToken) {
        throw new Error("No refresh token available. Please reconnect your Pinterest account.");
    }

    const clientId = process.env.PINTEREST_APP_ID;
    const clientSecret = process.env.PINTEREST_APP_SECRET;
    const apiUrl = process.env.PINTEREST_API_URL || "https://api.pinterest.com/v5";

    if (!clientId || !clientSecret) {
        throw new Error("Pinterest App credentials not configured on server.");
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    try {
        const response = await fetch(`${apiUrl}/oauth/token`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Error refreshing Pinterest token:", data);

            // If refresh token is invalid, we might want to mark account as disconnected or needing attention
            if (data.error === "invalid_grant") {
                throw new Error("Pinterest session expired. Please reconnect your account.");
            }

            throw new Error(data.error_description || data.message || "Failed to refresh Pinterest token");
        }

        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token; // Sometimes a new refresh token is returned
        const expiresIn = data.expires_in;
        // const refreshExpiresIn = data.refresh_token_expires_in;

        // Update Firestore
        const updateData = {
            accessToken: newAccessToken,
            tokenExpiresAt: new Date(Date.now() + (expiresIn * 1000)),
            updatedAt: serverTimestamp()
        };

        if (newRefreshToken) {
            updateData.refreshToken = newRefreshToken;
        }

        await updateDoc(docRef, updateData);
        console.log("Pinterest token refreshed successfully.");

        return newAccessToken;

    } catch (error) {
        console.error("refreshPinterestToken exception:", error);
        throw error;
    }
}
