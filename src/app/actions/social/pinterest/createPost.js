"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getAbsoluteUrl, getTestUrl, needsTestUrl } from "./mediaUtils";
import { getValidPinterestAccessToken } from "./connectAccount";
import { uploadPinterestVideo } from "./videoUtils";
import path from "path";
import { checkVideoMetadata, validatePlatformCompliance, convertVideoForPlatform } from "@/lib/media/videoProcessor";

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
 * Get Pinterest account info
 */
// function removed

/**
 * Make Pinterest API Request
 */
async function makePinterestRequest(endpoint, body, accessToken, method = "POST") {
    const PINTEREST_API_URL = process.env.PINTEREST_API_URL || "https://api.pinterest.com/v5";
    console.log("Using Pinterest API URL:", PINTEREST_API_URL);

    // Ensure endpoint starts with slash if not present (defensive)
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${PINTEREST_API_URL}${path}`;
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
    };
    const options = { method, headers };

    if (body && (method === "POST" || method === "PATCH")) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        console.error("Pinterest API error:", data);

        // Handle Trial Access Error specifically
        if (data.code === 29) {
            throw new Error("Pinterest Trial Mode Restriction: You cannot post Pins in Production until you add your account as a 'Tester' in your Pinterest Developer App settings.");
        }

        throw new Error(data.message || "Pinterest API error");
    }
    return data;
}

/**
 * Create Pinterest Post
 */
export async function createPinterestPost({
    pageId,
    title,
    message,
    link,
    boardId,
    media = [],
    postType = "image", // Default to image
    scheduling = null
}) {
    try {
        const user = await getAuthenticatedUser();
        const { accountId, accessToken } = await getValidPinterestAccessToken(user.id, pageId);

        // If scheduling, save to Firestore and exit
        if (scheduling) {
            const postRef = await addDoc(collection(db, "pinterest_posts"), {
                userId: user.id,
                accountId: accountId,
                platform: "pinterest",
                title,
                message,
                description: message,
                link,
                boardId,
                content: { media },
                postType,
                status: "scheduled",
                scheduledAt: scheduling,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                delete: 0
            });
            return { success: true, message: "Pin scheduled successfully", firestoreId: postRef.id };
        }

        // Immediate Publishing
        let mediaSource = {};

        if (postType === "carousel") {
            const items = await Promise.all(media.map(async (item, index) => ({
                title: title || "",
                description: message || "",
                link: link || "",
                url: needsTestUrl(item.url) ? getTestUrl("image", index) : await getAbsoluteUrl(item.url)
            })));

            mediaSource = {
                source_type: "multiple_image_urls",
                items: items
            };
        } else if (postType === "video") {
            const item = media[0] || { url: "", type: "video" };

            // --- Video Validation ---
            if (!needsTestUrl(item.url) && item.url.startsWith('/')) {
                try {
                    const relativePath = item.url.substring(1);
                    const absolutePath = path.join(process.cwd(), 'public', relativePath);
                    console.log(`Checking Pinterest video compliance: ${absolutePath}`);
                    const metadata = await checkVideoMetadata(absolutePath);
                    const compliance = validatePlatformCompliance('pinterest', metadata);

                    if (!compliance.compliant) {
                        console.log("Pinterest video not compliant:", compliance.reasons);
                        const dir = path.dirname(absolutePath);
                        const ext = path.extname(absolutePath);
                        const basename = path.basename(absolutePath, ext);
                        const outputPath = path.join(dir, `${basename}_pin.mp4`);

                        await convertVideoForPlatform(absolutePath, outputPath);

                        // Update URL to point to converted file
                        const newRelativePath = '/' + path.relative(path.join(process.cwd(), 'public'), outputPath);
                        item.url = getAbsoluteUrl(newRelativePath);
                        console.log("Converted Pinterest video URL:", item.url);
                    }
                } catch (err) {
                    console.warn("Pinterest video validation skipped:", err);
                }
            }
            // ------------------------

            // Upload Video to Pinterest
            // This process registers, uploads, and waits for processing
            const mediaId = await uploadPinterestVideo(accessToken, item.url);

            // Get Cover Image URL if available (optional but recommended)
            let coverImageUrl = item.coverUrl || null;
            if (coverImageUrl) {
                coverImageUrl = needsTestUrl(coverImageUrl) ? getTestUrl("image") : await getAbsoluteUrl(coverImageUrl);
            }

            mediaSource = {
                source_type: "video_id",
                media_id: mediaId,
                ...(coverImageUrl
                    ? { cover_image_url: coverImageUrl }
                    : { cover_image_key_frame_time: 0 } // Fallback to first frame if no cover image
                )
            };
        } else {
            // Default: Image
            const item = media[0] || { url: "", type: "image" };
            const mediaUrl = needsTestUrl(item.url) ? getTestUrl(item.type) : await getAbsoluteUrl(item.url);

            mediaSource = {
                source_type: "image_url",
                url: mediaUrl
            };
        }

        // Sanitize Link
        let finalLink = link;
        if (finalLink && (finalLink.includes("localhost") || finalLink.includes("127.0.0.1"))) {
            console.warn("Removing localhost link for Pinterest API compatibility");
            finalLink = "";
        }

        const pinData = {
            board_id: boardId,
            title: title || "",
            description: message || "",
            // Only include link if it's not empty
            ...(finalLink ? { link: finalLink } : {}),
            media_source: mediaSource
        };

        const result = await makePinterestRequest("/pins", pinData, accessToken, "POST");

        // Save to Firestore as published
        const postRef = await addDoc(collection(db, "pinterest_posts"), {
            userId: user.id,
            accountId: accountId,
            platform: "pinterest",
            title,
            message,
            description: message,
            link,
            boardId,
            content: { media },
            postType,
            pinterestPinId: result.id,
            status: "published",
            publishedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0
        });

        return { success: true, message: "Pin published successfully", pinId: result.id, firestoreId: postRef.id };

    } catch (error) {
        console.error("Create Pinterest Post Error:", error);
        return { success: false, message: error.message };
    }
}
