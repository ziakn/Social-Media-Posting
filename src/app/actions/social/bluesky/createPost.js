"use server";

import { BskyAgent, RichText } from "@atproto/api";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { checkUsageLimitAction } from "../../usage/usageActions";
import { incrementUsage } from "../../usage/incrementUsage";
import { syncPostJob } from "@/lib/queue/queues";

/**
 * Get authenticated user (Helper)
 */
async function getAuthenticatedUser() {
    const user = await verifyToken();

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
export async function uploadMedia(agent, media) {
    const { readFile } = await import('fs/promises');
    const path = await import('path');
    const { checkVideoMetadata, validatePlatformCompliance, convertVideoForPlatform } = await import("@/lib/media/videoProcessor");

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

        let finalPath = filePath;

        // --- Video Validation ---
        // Simple check if it seems to be video based on extension or passed type
        const isLikelyVideo = media.type?.startsWith('video') || filePath.endsWith('.mp4') || filePath.endsWith('.mov');

        if (isLikelyVideo) {
            try {
                console.log(`Checking BlueSky video compliance: ${filePath}`);
                const metadata = await checkVideoMetadata(filePath);
                const compliance = validatePlatformCompliance('bluesky', metadata);

                if (!compliance.compliant) {
                    console.log("BlueSky video not compliant:", compliance.reasons);
                    const dir = path.dirname(filePath);
                    const ext = path.extname(filePath);
                    const basename = path.basename(filePath, ext);
                    const outputPath = path.join(dir, `${basename}_bsky.mp4`);

                    await convertVideoForPlatform(filePath, outputPath);
                    finalPath = outputPath;
                }
            } catch (err) {
                console.warn("BlueSky validation skipped:", err);
            }
        }

        fileBuffer = await readFile(finalPath);

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
    const blobData = Buffer.from(fileBuffer);
    const blobSize = blobData.length;

    try {
        // Attempt 1: Using the SDK's uploadBlob with Buffer (Server-side standardized)
        console.log(`BlueSky Upload Attempt 1 (SDK): type=${mimeType}, size=${blobSize}, isVideo=${isVideo}`);
        const { data } = await agent.uploadBlob(blobData, { encoding: mimeType });

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

        // Attempt 2: Direct fetch to XRPC endpoint (bypass SDK validation if necessary)
        const xrpcUrl = `${agent.service.href}xrpc/com.atproto.repo.uploadBlob`;

        const response = await fetch(xrpcUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${agent.session.accessJwt}`,
                'Content-Type': mimeType
            },
            body: blobData
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
 * Get metadata for a URL (Helper for link cards)
 */
export async function getLinkMetadata(agent, url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || url;
        const description = html.match(/<meta name="description" content="(.*?)"/i)?.[1] ||
            html.match(/<meta property="og:description" content="(.*?)"/i)?.[1] || "";
        const ogImage = html.match(/<meta property="og:image" content="(.*?)"/i)?.[1];

        let thumbBlob = null;
        if (ogImage) {
            try {
                const imgRes = await fetch(ogImage);
                if (imgRes.ok) {
                    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
                    const imgBuffer = await imgRes.arrayBuffer();

                    // BlueSky thumb limit is technically the same 1MB, let's play safe
                    if (imgBuffer.byteLength < 900 * 1024) {
                        const uploadRes = await agent.uploadBlob(Buffer.from(imgBuffer), { encoding: contentType });
                        thumbBlob = uploadRes.data.blob;
                    } else {
                        console.warn("Link thumbnail too large, skipping:", imgBuffer.byteLength);
                    }
                }
            } catch (e) {
                console.warn("Failed to upload link thumbnail:", e.message);
            }
        }

        const external = {
            uri: url,
            title: title,
            description: description,
        };

        if (thumbBlob) {
            external.thumb = thumbBlob;
        }

        return {
            $type: "app.bsky.embed.external",
            external: external
        };
    } catch (error) {
        console.error("Metadata extraction failed:", error);
        return {
            $type: "app.bsky.embed.external",
            external: { uri: url, title: url, description: "" }
        };
    }
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
                disconnectedAt: data.disconnectedAt?.toDate?.().toISOString() || data.disconnectedAt || null,
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
    link = null,
    scheduling = null
}) {
    try {
        const user = await getAuthenticatedUser();

        // Check Usage Limit
        const usageCheck = await checkUsageLimitAction('post');
        if (!usageCheck.success) {
            return { success: false, message: usageCheck.error };
        }

        // Just verify account ownership/existence
        await getBlueSkyAccount(user.id, pageId);

        // Calculate schedule time
        const scheduledAt = scheduling ? new Date(scheduling) : null;
        const status = scheduledAt ? "scheduled" : "queued";

        // Create initial Firestore record
        const postData = {
            userId: user.id,
            accountId: pageId,
            platform: "bluesky",
            content: { text, media, link },
            status: status,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0
        };

        if (scheduledAt) {
            postData.scheduledAt = scheduledAt;
        }

        const postRef = await addDoc(collection(db, "bluesky_posts"), postData);

        // Add to Queue
        const delay = scheduledAt ? Math.max(0, scheduledAt.getTime() - Date.now()) : 0;

        await syncPostJob("bluesky", postRef.id, {
            postId: postRef.id,
            userId: user.id,
            userEmail: user.email,
            pageId: pageId
        }, { delay });

        if (status === "scheduled") {
            await incrementUsage(user.id);
        }

        return {
            success: true,
            message: scheduledAt ? "Post scheduled successfully" : "Post queued for publishing",
            firestoreId: postRef.id
        };

    } catch (error) {
        console.error("Create BlueSky Post Error:", error);
        return { success: false, message: error.message };
    }
}
