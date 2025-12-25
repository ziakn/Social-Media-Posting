"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function refreshYoutubeToken(accountId, refreshToken) {
    try {
        const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                refresh_token: refreshToken,
                client_id: process.env.YOUTUBE_CLIENT_ID,
                client_secret: process.env.YOUTUBE_CLIENT_SECRET,
                grant_type: "refresh_token",
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("YouTube Token Refresh Error:", data);
            throw new Error(data.error_description || data.error || "Failed to refresh token");
        }

        const { access_token, refresh_token: new_refresh_token, expires_in } = data;

        // Update in Firestore
        const accountRef = doc(db, "socialAccounts", accountId);
        await updateDoc(accountRef, {
            accessToken: access_token,
            refreshToken: new_refresh_token || refreshToken,
            tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            updatedAt: serverTimestamp()
        });

        return { access_token, refresh_token: new_refresh_token || refreshToken };
    } catch (error) {
        console.error("Error in refreshYoutubeToken:", error);
        throw error;
    }
}

