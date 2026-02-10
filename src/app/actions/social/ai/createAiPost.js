"use server";

import { db } from "@/lib/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { createFacebookPostBase } from "../facebook/createPost";
import { createInstagramImagePost } from "../instagram/createPost";
import { createTwitterPost } from "../twitter/createPost";
import { createLinkedinPost } from "../linkedin/createPost";
import { createThreadsPost } from "../threads/createPost";
import { createTiktokPost } from "../tiktok/createPost";
import { createPinterestPost } from "../pinterest/createPost";

/**
 * AI Centralized Posting Action
 * Distributes a post to multiple selected accounts across different platforms.
 * 
 * @param {Object} params
 * @param {string[]} params.accountIds - Array of parent Connection IDs
 * @param {string[]} params.targetIds - Array of specific Page/Profile IDs to post to
 * @param {Object} params.content - Post content { text, mediaUrls }
 */
export async function createAiPost({ accountIds, targetIds, content, mediaUrls }) {
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

        const results = [];
        const text = content || ""; // AIComposerModal sends 'content' prop as text, or we can unify

        // 3. Process each connection
        for (const account of selectedConnections) {
            // Determine meaningful targets for this connection
            let targetsToPost = [];

            if (['facebook', 'linkedin', 'youtube'].includes(account.platform?.toLowerCase())) {
                // For platforms with pages, check which pages are in targetIds
                if (Array.isArray(account.pages)) {
                    targetsToPost = account.pages.filter(page => targetIds.includes(page.id || page.pageId));
                }
            } else {
                // For profile-based platforms (Twitter, IG, etc.), check if the account ID is in targetIds
                // OR if backward compatibility is needed, just post if connection is selected?
                // The Smart Selector uses account.id as targetId for profiles.
                if (targetIds.includes(account.id)) {
                    targetsToPost = [{ id: account.id, name: account.displayName }];
                }
            }

            // If no specific targets matched but the connection was selected, 
            // it might mean "post to default" or "post to all"? 
            // But SmartSelector enforces picking targets. If targetsToPost is empty, we skip.

            for (const target of targetsToPost) {
                let result;
                try {
                    switch (account.platform.toLowerCase()) {
                        case "facebook":
                            result = await createFacebookPostBase({
                                accessToken: account.accessToken, // Use secure token from DB
                                pageId: target.id || target.pageId,
                                message: text,
                                mediaUrls: mediaUrls && mediaUrls.length ? mediaUrls : [],
                                postType: mediaUrls && mediaUrls.length ? "images" : "text"
                            });
                            break;

                        case "instagram":
                            if (mediaUrls && mediaUrls.length) {
                                result = await createInstagramImagePost({
                                    accessToken: account.accessToken,
                                    pageId: target.id || target.pageId || account.pageId, // IG specific logic might vary
                                    image: { url: mediaUrls[0] },
                                    caption: text
                                });
                            } else {
                                result = { success: false, message: "Instagram requires an image" };
                            }
                            break;

                        case "twitter":
                            result = await createTwitterPost({
                                accessToken: account.accessToken,
                                accessSecret: account.accessSecret,
                                message: text,
                                mediaUrls: mediaUrls ? mediaUrls.map(url => ({ url, type: "image/jpeg" })) : [],
                                postType: mediaUrls && mediaUrls.length ? "image" : "text"
                            });
                            break;

                        case "linkedin":
                            result = await createLinkedinPost({
                                accessToken: account.accessToken,
                                text: text,
                                imageUrl: mediaUrls && mediaUrls.length ? mediaUrls[0] : null,
                                accountId: target.id // user urn or org urn
                            });
                            break;

                        // ... Add other cases similarly (Threads, TikTok, Pinterest) ...
                        // For brevity, mostly adapting the logic to use 'account' credentials and 'target' identifiers

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

