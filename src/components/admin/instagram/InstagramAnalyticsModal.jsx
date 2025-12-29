"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Heart,
    MessageCircle,
    Eye,
    BarChart3,
    Share2,
    Bookmark,
    Users,
    Play,
    TrendingUp
} from "lucide-react";
import { getInstagramPostAnalytics } from "@/app/actions/social/instagram/getAnalytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function InstagramAnalyticsModal({
    open,
    onOpenChange,
    post
}) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (open && post?.instagramPostId && post?.pageId) {
            loadAnalytics();
        }
    }, [open, post]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const res = await getInstagramPostAnalytics(post.pageId, post.instagramPostId);

            if (res.success) {
                setData(res.data);
            } else {
                toast.error(res.message || "Failed to load analytics");
                // Fallback to basic metrics from post object if API fails
                setData({
                    like_count: post.metrics?.likes || 0,
                    comments_count: post.metrics?.comments || 0,
                    media_type: post.postType === 'video' ? 'VIDEO' : 'IMAGE',
                    insights: []
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while loading analytics");
        } finally {
            setLoading(false);
        }
    };

    const getMetricValue = (name) => {
        if (!data?.insights) return 0;
        const metric = data.insights.find(m => m.name === name);
        // Insights values are array of {value: ...}
        return metric?.values?.[0]?.value || 0;
    };

    // Helper to format large numbers
    const formatNumber = (num) => {
        if (!num) return 0;
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
    };

    const metrics = [
        {
            label: "Impressions",
            value: getMetricValue("impressions"),
            icon: Eye,
            color: "text-blue-600",
            bg: "bg-blue-50",
            desc: "Total number of times your post was seen"
        },
        {
            label: "Reach",
            value: getMetricValue("reach"),
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50",
            desc: "Unique accounts that saw your post"
        },
        {
            label: "Likes",
            value: data?.like_count || 0,
            icon: Heart,
            color: "text-pink-600",
            bg: "bg-pink-50",
            desc: "Total likes on your post"
        },
        {
            label: "Comments",
            value: data?.comments_count || 0,
            icon: MessageCircle,
            color: "text-green-600",
            bg: "bg-green-50",
            desc: "Total comments on your post"
        },
        {
            label: "Saved",
            value: getMetricValue("saved"), // 'saved' is an insight metric
            icon: Bookmark,
            color: "text-orange-600",
            bg: "bg-orange-50",
            desc: "Number of times your post was saved"
        },
        {
            label: "Engagement",
            value: (data?.like_count || 0) + (data?.comments_count || 0) + (getMetricValue("saved") || 0),
            icon: TrendingUp,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            desc: "Total interactions (Likes + Comments + Saves)"
        }
    ];

    // Add video specific metrics
    if (data?.media_type === "VIDEO" || data?.media_type === "REELS") {
        const views = getMetricValue("video_views") || getMetricValue("plays"); // plays for reels
        metrics.push({
            label: "Video Views",
            value: views,
            icon: Play,
            color: "text-red-600",
            bg: "bg-red-50",
            desc: "Number of times your video was viewed"
        });
    }

    // Note: Shares are tricky. If we have it in insights 'shares', use it.
    const shares = getMetricValue("shares");
    if (shares > 0) {
        metrics.push({
            label: "Shares",
            value: shares,
            icon: Share2,
            color: "text-teal-600",
            bg: "bg-teal-50",
            desc: "Number of times your post was shared"
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-gray-50/50 border-0 shadow-2xl rounded-3xl">
                <div className="bg-white border-b px-8 py-6">
                    <DialogHeader className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg shadow-pink-500/20">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-gray-900">Post Analytics</DialogTitle>
                                <DialogDescription className="text-sm font-medium text-gray-500">
                                    Detailed performance insights for your publication
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <ScrollArea className="max-h-[85vh]">
                    <div className="p-8">
                        {loading ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[...Array(4)].map((_, i) => (
                                        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                                    ))}
                                </div>
                                <Skeleton className="h-64 w-full rounded-2xl" />
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Top Cards Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {metrics.map((metric, i) => (
                                        <div key={i} className="relative group overflow-hidden bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={cn("p-2.5 rounded-xl transition-colors", metric.bg)}>
                                                    <metric.icon className={cn("h-5 w-5", metric.color)} />
                                                </div>
                                                <span className={cn("text-2xl font-black tracking-tight", metric.color)}>
                                                    {formatNumber(metric.value)}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-700 text-sm mb-1">{metric.label}</h3>
                                            <p className="text-xs text-gray-400 font-medium leading-relaxed">{metric.desc}</p>

                                            {/* Decorative gradient */}
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>

                                {/* Post Preview (Optional but nice context) */}
                                <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="w-full md:w-1/3 shrink-0">
                                        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative shadow-inner border border-gray-100">
                                            {post?.mediaUrl ? (
                                                post.postType === 'video' ? (
                                                    <video src={post.mediaUrl} className="w-full h-full object-cover" controls />
                                                ) : <img src={post.mediaUrl} className="w-full h-full object-cover" alt="Post" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-black uppercase tracking-wider">No Media Preview</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Caption</h4>
                                            <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                {post?.caption || "No caption provided"}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                                                <div className="text-xs font-black text-pink-400 uppercase tracking-wider mb-1">Published On</div>
                                                <div className="text-sm font-bold text-pink-900">
                                                    {post?.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "long" }) : "N/A"}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                                <div className="text-xs font-black text-purple-400 uppercase tracking-wider mb-1">Status</div>
                                                <div className="text-sm font-bold text-purple-900 capitalize">
                                                    {post?.status || "Published"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
