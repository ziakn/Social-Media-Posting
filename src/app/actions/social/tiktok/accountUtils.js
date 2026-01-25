// src/app/actions/social/tiktok/accountUtils.js
"use server";

import { db } from "@/lib/firebase";
import { collection, doc, getDoc, updateDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

/**
 * Get authenticated user
 */
export async function getAuthenticatedUser() {
    const user = await verifyToken();
    if (!user) throw new Error("Invalid or expired token. Please log in again.");
    return user;
}

/**
 * Refresh TikTok Access Token
 */
export async function refreshTiktokAccessToken(accountId, refreshToken) {
    try {
        const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_key: process.env.TIKTOK_CLIENT_KEY,
                client_secret: process.env.TIKTOK_CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
        });

        const data = await res.json();
        if (data.error) {
            console.error("TikTok Token Refresh Failed:", data);
            return null;
        }

        // Update in Firestore
        const accountRef = doc(db, "socialAccounts", accountId);
        await updateDoc(accountRef, {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
            updatedAt: serverTimestamp()
        });

        return data.access_token;
    } catch (error) {
        console.error("TikTok Refresh Token Error:", error);
        return null;
    }
}

/**
 * Get TikTok account info (with auto-refresh)
 */
export async function getTiktokAccount(userId, platformUserId) {
    const q = query(
        collection(db, "socialAccounts"),
        where("userId", "==", userId),
        where("accountId", "==", platformUserId),
        where("platform", "==", "tiktok"),
        where("status", "==", "active")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("TikTok account not found or inactive");

    const docId = snapshot.docs[0].id;
    const account = snapshot.docs[0].data();

    let accessToken = account.accessToken;
    const expiresAt = account.tokenExpiresAt?.toDate?.() || new Date(account.tokenExpiresAt);

    // Refresh if expiring in less than 5 minutes
    if (expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
        console.log("TikTok Access Token expiring, refreshing...");
        const newAccessToken = await refreshTiktokAccessToken(docId, account.refreshToken);
        if (newAccessToken) accessToken = newAccessToken;
    }

    return { accountId: docId, platformUserId: account.accountId, accessToken };
}
