"use server";

import { db } from "@/lib/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { format } from "date-fns";
import { createFacebookPostBase } from "../facebook/createPost";
import { createInstagramImagePost, createInstagramVideoPost, createInstagramCarouselPost } from "../instagram/createPost";
import { createTwitterPost } from "../twitter/createPost";
import { createLinkedinPost } from "../linkedin/createPost";
import { createThreadsPost } from "../threads/createPost";
import { createTiktokPost } from "../tiktok/createPost";
import { createPinterestPost } from "../pinterest/createPost";
import { createBlueSkyPost } from "../bluesky/createPost";

/**
 * AI Centralized Posting Action
 * Distributes a post to multiple selected accounts across different platforms.
 * 
 * @param {Object} params
 * @param {string[]} params.accountIds - Array of parent Connection IDs
 * @param {string[]} params.targetIds - Array of specific Page/Profile IDs to post to
 * @param {Object} params.content - Post content { text, mediaUrls }
 * @param {Object} [params.scheduling] - Optional scheduling data { schedule, date, time }
 * @param {Object} [params.pinterestBoards] - Optional Pinterest board selection { accountId: boardId }
 */
export async function createAiPost({ accountIds, targetIds, content, mediaUrls, scheduling, pinterestBoards }) {
    try {
        const user = await verifyToken();
        if (!user) return { success: false, message: "Unauthorized" };

        if (!accountIds || accountIds.length === 0) {
            return { success: false, message: "No accounts selected" };
        }

        // 1. Fetch all active accounts for the user to get secure tokens
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        const allUserAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Filter to only the requested connections
        const selectedConnections = allUserAccounts.filter(acc => accountIds.includes(acc.id));

        // Helper to detect if a URL is a video
        const detectMediaType = (url) => {
            if (!url) return "image";
            const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.m4v', '.3gp', '.mkv', '.qt'];
            return videoExtensions.some(ext => url.toLowerCase().endsWith(ext)) ? "video" : "image";
        };

        const results = [];
        const text = content || "";

        // 3. Process each connection
        for (const account of selectedConnections) {
            // Determine meaningful targets for this connection
            let targetsToPost = [];

            if (account.platform?.toLowerCase() === 'facebook' || (account.platform?.toLowerCase() === 'linkedin' && Array.isArray(account.pages) && account.pages.length > 0)) {
                // For platforms with pages, check which pages are in targetIds
                if (Array.isArray(account.pages)) {
                    targetsToPost = account.pages.filter(page => targetIds.includes(page.id || page.pageId));
                }
            } else {
                // For profile-based platforms (Twitter, IG, BlueSky, etc.)
                // Match either by Firestore Document ID or any of the platform user IDs
                const isTargetSelected = targetIds.includes(account.id) ||
                    (account.accountId && targetIds.includes(String(account.accountId))) ||
                    (account.igUserId && targetIds.includes(String(account.igUserId))) ||
                    (account.platformUserId && targetIds.includes(String(account.platformUserId)));

                if (isTargetSelected) {
                    targetsToPost = [{
                        id: account.accountId || account.igUserId || account.platformUserId || account.id,
                        name: account.displayName
                    }];
                }
            }

            for (const target of targetsToPost) {
                let result;
                const scheduledTime = scheduling?.schedule
                    ? new Date(`${format(new Date(scheduling.date), "yyyy-MM-dd")}T${scheduling.time}`)
                    : null;

                try {
                    switch (account.platform.toLowerCase()) {
                        case "facebook":
                            result = await createFacebookPostBase({
                                pageId: target.id || target.pageId,
                                message: text,
                                mediaUrls: mediaUrls && mediaUrls.length ? mediaUrls.map(url => ({
                                    url,
                                    type: detectMediaType(url)
                                })) : [],
                                postType: mediaUrls && mediaUrls.length ? (detectMediaType(mediaUrls[0]) === 'video' ? 'video' : 'images') : "text",
                                scheduledTime: scheduledTime
                            });
                            break;

                        case "instagram":
                            if (mediaUrls && mediaUrls.length) {
                                const firstUrl = mediaUrls[0];
                                const type = detectMediaType(firstUrl);

                                // Construct normalized scheduling for IG actions
                                const igScheduling = scheduling?.schedule ? {
                                    schedule: true,
                                    date: new Date(scheduling.date),
                                    time: scheduling.time
                                } : null;

                                if (mediaUrls.length > 1) {
                                    result = await createInstagramCarouselPost({
                                        pageId: target.id || target.pageId || account.pageId,
                                        media: mediaUrls.map(url => ({ url, type: detectMediaType(url) })),
                                        caption: text,
                                        scheduling: igScheduling
                                    });
                                } else if (type === 'video') {
                                    result = await createInstagramVideoPost({
                                        pageId: target.id || target.pageId || account.pageId,
                                        video: { url: firstUrl },
                                        caption: text,
                                        scheduling: igScheduling
                                    });
                                } else {
                                    result = await createInstagramImagePost({
                                        pageId: target.id || target.pageId || account.pageId,
                                        image: { url: firstUrl },
                                        caption: text,
                                        scheduling: igScheduling
                                    });
                                }
                            } else {
                                result = { success: false, message: "Instagram requires an image or video" };
                            }
                            break;

                        case "twitter":
                            result = await createTwitterPost({
                                message: text,
                                mediaUrls: mediaUrls ? mediaUrls.map(url => ({ url, type: detectMediaType(url) === 'video' ? "video/mp4" : "image/jpeg" })) : [],
                                postType: mediaUrls && mediaUrls.length ? (detectMediaType(mediaUrls[0]) === 'video' ? 'video' : 'image') : "text",
                                scheduledTime: scheduledTime
                            });
                            break;

                        case "linkedin":
                            result = await createLinkedinPost({
                                text: text,
                                imageUrl: mediaUrls && mediaUrls.length && detectMediaType(mediaUrls[0]) !== 'video' ? mediaUrls[0] : null,
                                videoUrl: mediaUrls && mediaUrls.length && detectMediaType(mediaUrls[0]) === 'video' ? mediaUrls[0] : null,
                                accountId: account.id,
                                scheduledTime: scheduledTime
                            });
                            break;

                        case "tiktok":
                            result = await createTiktokPost({
                                pageId: target.id || target.pageId,
                                text: text,
                                media: mediaUrls && mediaUrls.length ? mediaUrls.map(url => ({ url, type: detectMediaType(url) })) : [],
                                scheduling: scheduledTime ? scheduledTime : null
                            });
                            break;

                        case "pinterest":
                            result = await createPinterestPost({
                                pageId: target.id || target.pageId || account.accountId,
                                message: text,
                                media: mediaUrls && mediaUrls.length ? mediaUrls.map(url => ({ url, type: detectMediaType(url) })) : [],
                                postType: mediaUrls && mediaUrls.length && detectMediaType(mediaUrls[0]) === 'video' ? "video" : "image",
                                boardId: pinterestBoards ? pinterestBoards[account.accountId] : null,
                                scheduling: scheduledTime ? scheduledTime.toISOString() : null
                            });
                            break;

                        case "threads":
                            result = await createThreadsPost({
                                pageId: target.id || target.pageId,
                                text: text,
                                media: mediaUrls && mediaUrls.length ? mediaUrls.map(url => ({ url, type: detectMediaType(url) })) : [],
                                scheduling: scheduledTime ? scheduledTime.toISOString() : null
                            });
                            break;

                        case "bluesky":
                            result = await createBlueSkyPost({
                                pageId: target.id,
                                text: text,
                                media: mediaUrls && mediaUrls.length ? mediaUrls.map(url => ({ url, type: detectMediaType(url) })) : [],
                                scheduling: scheduledTime ? scheduledTime : null
                            });
                            break;

                        default:
                            result = { success: false, message: `Platform ${account.platform} implementation pending` };
                    }
                } catch (err) {
                    console.error(`Error posting to ${account.platform} (${target.name}):`, err);
                    result = { success: false, message: err.message };
                }

                results.push({
                    platform: account.platform,
                    targetName: target.name || target.pageName || account.displayName,
                    ...result
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;

        return {
            success: successCount > 0,
            summary: `Successfully posted to ${successCount} destinations. ${failureCount} failed.`,
            results
        };

    } catch (error) {
        console.error("AI Post error:", error);
        return { success: false, message: error.message };
    }
}

