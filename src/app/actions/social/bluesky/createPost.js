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
 * Upload media (image/video) to BlueSky (Helper)
 */
async function uploadMedia(agent, media) {
    const { readFile } = await import('fs/promises');
    const path = await import('path');

    let fileBuffer;
    let mimeType = media.type;

    // Helper map for normalization
    const mimeMap = {
        'image': 'image/jpeg',
        'video': 'video/mp4',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime',
        '.webm': 'video/webm'
    };

    if (media.url.startsWith('http')) {
        // Handle remote URLs
        const response = await fetch(media.url);
        fileBuffer = await response.arrayBuffer();
        // Try to get MIME type from response if not provided or too generic
        if (!mimeType || mimeType === 'image' || mimeType === 'video') {
            mimeType = response.headers.get('content-type') || (media.url.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');
        }
    } else {
        // Handle local files - read from public directory
        const relativePath = media.url.startsWith('/') ? media.url.slice(1) : media.url;
        const filePath = path.join(process.cwd(), 'public', relativePath);
        fileBuffer = await readFile(filePath);

        // Detect or normalize MIME type
        if (!mimeType || mimeType === 'image' || mimeType === 'video') {
            const ext = path.extname(media.url).toLowerCase();
            mimeType = mimeMap[ext] || (ext === '.mp4' ? 'video/mp4' : 'image/jpeg');
        }
    }

    // Final normalization check
    if (mimeType === 'image') mimeType = 'image/jpeg';
    if (mimeType === 'video') mimeType = 'video/mp4';

    const isVideo = mimeType.startsWith('video/');
    const blob = new Blob([fileBuffer], { type: mimeType });

    try {
        // Attempt 1: Using the SDK's uploadBlob with a Blob object
        console.log(`BlueSky Upload Attempt 1 (SDK): type=${mimeType}, size=${fileBuffer.byteLength}, isVideo=${isVideo}`);
        const { data } = await agent.uploadBlob(blob);

        if (data?.blob) {
            if (isVideo) {
                return {
                    $type: "app.bsky.embed.video",
                    video: data.blob,
                    alt: media.alt || ""
                };
            }
            return {
                $type: "app.bsky.embed.images#image",
                alt: media.alt || "",
                image: data.blob
            };
        }
    } catch (uploadError) {
        console.warn("BlueSky SDK upload failed, attempting direct XRPC fetch:", uploadError.message);

        // Attempt 2: Direct fetch to XRPC endpoint (bypass SDK validation)
        const xrpcUrl = `${agent.service.href}xrpc/com.atproto.repo.uploadBlob`;

        const response = await fetch(xrpcUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${agent.session.accessJwt}`,
                'Content-Type': mimeType
            },
            body: Buffer.from(fileBuffer)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("BlueSky XRPC upload failed:", errorText);
            throw new Error(`BlueSky upload failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        if (data?.blob) {
            if (isVideo) {
                return {
                    $type: "app.bsky.embed.video",
                    video: data.blob,
                    alt: media.alt || ""
                };
            }
            return {
                $type: "app.bsky.embed.images#image",
                alt: media.alt || "",
                image: data.blob
            };
        }
    }

    throw new Error(`Failed to upload media to BlueSky: No blob data returned for ${mimeType}`);
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
            const uploadedMedia = [];
            for (const item of media) {
                const result = await uploadMedia(agent, item);
                uploadedMedia.push(result);
            }

            // BlueSky allows either an array of images OR a single video
            const images = uploadedMedia.filter(m => m.$type === "app.bsky.embed.images#image");
            const video = uploadedMedia.find(m => m.$type === "app.bsky.embed.video");

            if (video) {
                // If there's a video, it takes precedence as BlueSky usually allow 1 video post
                postRecord.embed = video;
            } else if (images.length > 0) {
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
