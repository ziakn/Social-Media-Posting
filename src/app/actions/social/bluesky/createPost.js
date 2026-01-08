"use server";

import { BskyAgent, RichText } from "@atproto/api";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Get authenticated user (Helper)
 */
async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
        throw new Error("Invalid or expired token. Please log in again.");
    }

    return user;
}

/**
 * Get BlueSky account info (Helper)
 */
async function getBlueSkyAccount(userId, accountId) {
    const q = query(
        collection(db, "socialAccounts"),
        where("userId", "==", userId),
        where("platform", "==", "bluesky"),
        where("accountId", "==", accountId),
        where("status", "==", "active")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("BlueSky account not found or inactive");

    return snapshot.docs[0].data();
}

/**
 * Upload image to BlueSky (Helper)
 */
async function uploadImage(agent, url) {
    const res = await fetch(url);
    const blob = await res.blob();
    const buffer = await blob.arrayBuffer();

    const { data } = await agent.uploadBlob(new Uint8Array(buffer), {
        encoding: blob.type
    });

    return {
        $type: "app.bsky.embed.images#image",
        alt: "", // accessibility text could be added here
        image: data.blob
    };
}

/**
 * Get all connected BlueSky accounts for the current user
 */
export async function getUserBlueSkyAccounts() {
    try {
        const user = await getAuthenticatedUser();
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "bluesky"),
            where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                tokenExpiresAt: data.tokenExpiresAt?.toDate?.().toISOString() || data.tokenExpiresAt || null,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
            };
        });
        return { success: true, accounts };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Create BlueSky Post
 */
export async function createBlueSkyPost({
    pageId, // accountId
    text = "",
    media = [],
    scheduling = null
}) {
    try {
        const user = await getAuthenticatedUser();
        const account = await getBlueSkyAccount(user.id, pageId);

        // If scheduling, save to Firestore and exit
        if (scheduling) {
            const postRef = await addDoc(collection(db, "bluesky_posts"), {
                userId: user.id,
                accountId: pageId,
                platform: "bluesky",
                content: { text, media },
                status: "scheduled",
                scheduledAt: scheduling,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                delete: 0
            });
            return { success: true, message: "Post scheduled successfully", firestoreId: postRef.id };
        }

        // Initialize Agent
        const agent = new BskyAgent({ service: "https://bsky.social" });
        await agent.login({ identifier: account.identifier, password: account.password });

        // Process Rich Text (Facets for mentions/links)
        const rt = new RichText({ text });
        await rt.detectFacets(agent);

        const postRecord = {
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString()
        };

        // Handle Media
        if (media.length > 0) {
            const images = [];
            for (const item of media) {
                if (item.type === 'image' || !item.type) {
                    const image = await uploadImage(agent, item.url);
                    images.push(image);
                }
            }

            if (images.length > 0) {
                postRecord.embed = {
                    $type: "app.bsky.embed.images",
                    images: images
                };
            }
        }

        const res = await agent.post(postRecord);

        // Save to Firestore
        const postRef = await addDoc(collection(db, "bluesky_posts"), {
            userId: user.id,
            accountId: pageId,
            platform: "bluesky",
            content: { text, media },
            blueskyUri: res.uri,
            blueskyCid: res.cid,
            status: "published",
            publishedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0
        });

        return { success: true, message: "Post published successfully", firestoreId: postRef.id };

    } catch (error) {
        console.error("Create BlueSky Post Error:", error);
        return { success: false, message: error.message };
    }
}
