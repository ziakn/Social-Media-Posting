"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function refreshTwitterToken(accountId, refreshToken) {
    try {
        const basicAuth = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64');

        const res = await fetch("https://api.twitter.com/2/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${basicAuth}`
            },
            body: new URLSearchParams({
                refresh_token: refreshToken,
                grant_type: "refresh_token",
                client_id: process.env.TWITTER_CLIENT_ID
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Twitter Token Refresh Error:", data);
            throw new Error(data.error_description || data.error || "Failed to refresh token");
        }

        const { access_token, refresh_token: new_refresh_token, expires_in } = data;

        // Update in Firestore
        const accountRef = doc(db, "socialAccounts", accountId);
        await updateDoc(accountRef, {
            accessToken: access_token,
            refreshToken: new_refresh_token || refreshToken, // Twitter might not always return a new refresh token
            tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            updatedAt: serverTimestamp()
        });

        return { access_token, refresh_token: new_refresh_token || refreshToken };
    } catch (error) {
        console.error("Error in refreshTwitterToken:", error);
        throw error;
    }
}
