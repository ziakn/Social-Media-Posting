// src/app/actions/social/tiktok/createPost.js
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Get authenticated user
 */
async function getAuthenticatedUser() {
    const user = await verifyToken();

    if (!user) {
        throw new Error("Invalid or expired token. Please log in again.");
    }

    return user;
}

/**
 * Refresh TikTok Access Token
 */
async function refreshTiktokAccessToken(accountId, refreshToken) {
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
async function getTiktokAccount(userId, platformUserId) {
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

/**
 * Create TikTok Post (Direct Publish)
 */
export async function createTiktokPost({
    pageId,
    text = "",
    media = [],
    scheduling = null
}) {
    try {
        const user = await getAuthenticatedUser();
        const { accountId, accessToken } = await getTiktokAccount(user.id, pageId);

        if (media.length === 0) throw new Error("No video provided for TikTok post");

        const postData = {
            userId: user.id,
            accountId: pageId,
            internalAccountId: accountId,
            platform: "tiktok",
            content: { text, media },
            status: scheduling ? "scheduled" : "publishing",
            scheduledAt: scheduling || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0,
            metrics: { likes: 0, comments: 0, shares: 0, views: 0 }
        };

        const postRef = await addDoc(collection(db, "tiktok_posts"), postData);

        // 2. If not scheduled, trigger Direct Post API
        if (!scheduling) {
            try {
                // TikTok Direct Post v2 (Pull from URL)
                const tiktokRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        post_info: {
                            title: text.slice(0, 150), // TikTok title limit
                            privacy_level: "PUBLIC_TO_EVERYONE",
                            disable_comment: false,
                            disable_duet: false,
                            disable_stitch: false
                        },
                        source_info: {
                            source: "PULL_FROM_URL",
                            video_url: media[0].url
                        }
                    })
                });

                const tiktokData = await tiktokRes.json();

                if (tiktokData.error && tiktokData.error.code !== "ok") {
                    throw new Error(tiktokData.error.message || "TikTok API rejection");
                }

                await updateDoc(postRef, {
                    status: "published",
                    publishedAt: serverTimestamp(),
                    tiktok_publish_id: tiktokData.data?.publish_id || null
                });

            } catch (apiError) {
                console.error("TikTok API Posting Failed:", apiError);
                await updateDoc(postRef, { status: "failed", error: apiError.message });
                throw apiError;
            }
        }

        return {
            success: true,
            message: scheduling ? "TikTok video scheduled" : "TikTok video published successfully!",
            firestoreId: postRef.id
        };
    } catch (error) {
        console.error("Create TikTok Post Error:", error);
        return { success: false, message: error.message };
    }
}
