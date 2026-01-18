"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Heart,
    Eye,
    MousePointer2,
    TrendingUp,
    Calendar,
    Share2,
    Info,
    RotateCw,
    MoreHorizontal,
    Pin,
    ExternalLink
} from "lucide-react";
import { getPinterestPostAnalytics } from "@/app/actions/social/pinterest/getAnalytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import PinterestLogo from "@/components/icons/PinterestLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PinterestAnalyticsModal({
    open,
    onOpenChange,
    post
}) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    useEffect(() => {
        if (open && post?.id) {
            loadAnalytics();
        } else if (open) {
            setLoading(false);
            setData({
                metrics: post?.metrics || {
                    impressions: 0,
                    saves: 0,
                    clicks: 0,
                    views: 0
                }
            });
        }
    }, [open, post]);

    const loadAnalytics = async (forceRefresh = false) => {
        try {
            if (forceRefresh) setRefreshing(true);
            else setLoading(true);

            const res = await getPinterestPostAnalytics(post.accountId, post.id, forceRefresh);

            if (res.success) {
                setData(res.data);
                setLastRefreshed(res.lastRefreshed);
                if (forceRefresh) toast.success("Analytics refreshed");
            } else {
                toast.error(res.message || "Failed to load analytics");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while loading analytics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatNumber = (num) => {
        if (!num) return 0;
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
    };

    const metrics = [
        {
            label: "Impressions",
            value: data?.metrics?.impressions || data?.metrics?.views || 0,
            icon: Eye,
            desc: "Total views"
        },
        {
            label: "Saves",
            value: data?.metrics?.saves || 0,
            icon: Pin,
            desc: "Total saves (Pin clicks)"
        },
        {
            label: "Outbound Clicks",
            value: data?.metrics?.clicks || 0,
            icon: MousePointer2,
            desc: "Clicks to destination"
        },
        {
            label: "Engagement",
            value: (data?.metrics?.saves || 0) + (data?.metrics?.clicks || 0),
            icon: TrendingUp,
            desc: "Total interactions"
        }
    ];

    const getMediaUrl = () => {
        if (!post) return null;
        if (post.content?.media?.[0]?.url) return post.content.media[0].url;
        if (post.imageUrl) return post.imageUrl;
        return null;
    };

    const isVideo = () => {
        if (!post) return false;
        const type = post.postType || post.content?.media?.[0]?.type || "";
        return type.toLowerCase().includes("video");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] md:w-[85vw] md:max-w-[1200px] h-[90vh] p-0 overflow-hidden rounded-[24px]">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#E60023] rounded-lg">
                            <PinterestLogo className="h-5 w-5 fill-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight">Pinterest Analytics</DialogTitle>
                    </div>
                    <div className="flex items-center gap-4">
                        {lastRefreshed && (
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[10px] uppercase font-bold text-gray-400 leading-tight">Last Updated</span>
                                <span className="text-xs font-semibold text-gray-600">
                                    {formatDistanceToNow(new Date(lastRefreshed), { addSuffix: true })}
                                </span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2 rounded-full font-bold px-4"
                            onClick={() => loadAnalytics(true)}
                            disabled={loading || refreshing}
                        >
                            <RotateCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                            {refreshing ? "Updating..." : "Refresh"}
                        </Button>
                    </div>
                </div>

                <div className="flex h-[calc(90vh-73px)] overflow-hidden">
                    {/* Left Column - Metrics */}
                    <ScrollArea className="flex-1 border-r">
                        <div className="p-6 space-y-8">
                            {loading ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[...Array(4)].map((_, i) => (
                                            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                                        ))}
                                    </div>
                                    <Skeleton className="h-40 w-full rounded-2xl" />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Performance Summary</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {metrics.map((metric, i) => (
                                                <div
                                                    key={i}
                                                    className="flex flex-col gap-1 p-5 bg-gray-50/50 border border-gray-100 rounded-2xl transition-all hover:bg-white hover:shadow-sm"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-50">
                                                            <metric.icon className="h-4 w-4 text-[#E60023]" />
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <div className="text-2xl font-black tracking-tight">{formatNumber(metric.value)}</div>
                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{metric.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator className="bg-gray-100" />

                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Post Context</h3>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-[13px] font-bold text-gray-600">Published On</span>
                                                </div>
                                                <span className="text-[13px] font-bold text-black">
                                                    {post?.publishedAt ? format(new Date(post.publishedAt), "MMM dd, yyyy HH:mm") : "N/A"}
                                                </span>
                                            </div>

                                            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Info className="h-4 w-4 text-gray-400" />
                                                    <span className="text-[13px] font-bold text-gray-600">Pin Title & Description</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-[14px] font-bold text-gray-900 leading-snug">
                                                        {post?.title || "No Title"}
                                                    </div>
                                                    <div className="text-[13px] leading-relaxed text-gray-600 font-medium">
                                                        {post?.message || post?.description || "No description"}
                                                    </div>
                                                </div>
                                            </div>

                                            {data?.permalink && (
                                                <Button variant="outline" className="w-full h-12 rounded-xl border-gray-200 justify-between group" asChild>
                                                    <a href={data.permalink} target="_blank" rel="noopener noreferrer">
                                                        <span className="flex items-center gap-2 text-gray-600 font-bold group-hover:text-[#E60023]">
                                                            <PinterestLogo className="h-4 w-4 fill-current" />
                                                            View on Pinterest
                                                        </span>
                                                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-[#E60023]" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Right Column - Preview */}
                    <div className="w-[440px] bg-gray-50/30 flex items-center justify-center p-8">
                        {loading ? (
                            <Skeleton className="w-[340px] h-[500px] rounded-[32px]" />
                        ) : (
                            <div className="w-[340px] bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
                                <div className="relative">
                                    {getMediaUrl() && (
                                        <div className="w-full aspect-[2/3] bg-gray-100 relative group overflow-hidden">
                                            {isVideo() ? (
                                                <video
                                                    src={getMediaUrl()}
                                                    className="w-full h-full object-cover"
                                                    controls
                                                    playsInline
                                                />
                                            ) : (
                                                <img
                                                    src={getMediaUrl()}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    alt="Pin"
                                                />
                                            )}
                                            <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                                Save
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex flex-col gap-2">
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
                                        {post?.title || "No Title"}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={post?.profilePicture} />
                                            <AvatarFallback>{post?.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {post?.username || "Pinterest User"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
