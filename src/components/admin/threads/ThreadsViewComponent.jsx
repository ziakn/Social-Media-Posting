"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getThreadsPosts, publishThreadsPostNow } from "@/app/actions/social/threads/threadsPostsActions";
import XThreadCard from "./XThreadCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, LayoutGrid, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ThreadsViewComponent({
    accountId,
    initialStatus = "published",
    refreshTrigger,
    onEdit,
    onRefresh
}) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [publishingId, setPublishingId] = useState(null);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getThreadsPosts({ status: initialStatus, accountId });
            if (res.success) {
                setPosts(res.posts);
            } else {
                toast.error(res.message || "Failed to load Threads posts");
            }
        } catch (error) {
            toast.error("An error occurred while loading posts");
        } finally {
            setLoading(false);
        }
    }, [accountId, initialStatus]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts, refreshTrigger]);

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        setPublishingId(post.id);
        try {
            const res = await publishThreadsPostNow(post.id);
            if (res.success) {
                toast.success("Post published successfully!");
                onRefresh?.();
            } else {
                toast.error(res.message || "Failed to publish post");
            }
        } catch (error) {
            toast.error("An error occurred while publishing");
        } finally {
            setPublishingId(null);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-[400px] w-full rounded-[24px]" />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                    <LayoutGrid className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Threads Found</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs text-center font-medium">
                    You haven't posted anything to Threads yet. Start sharing your ideas!
                </p>
                <Button onClick={() => onEdit(null)} className="bg-black hover:bg-gray-800 text-white font-bold rounded-xl px-6">
                    <Plus className="h-4 w-4 mr-2" /> Create First Thread
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {posts.map((post) => (
                <XThreadCard
                    key={post.id}
                    post={post}
                    onEditClick={onEdit}
                    onPublishNow={handlePublishNow}
                    publishingId={publishingId}
                />
            ))}
        </div>
    );
}
