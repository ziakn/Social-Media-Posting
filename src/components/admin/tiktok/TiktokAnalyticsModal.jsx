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
    MessageCircle,
    Eye,
    Share2,
    TrendingUp,
    Calendar,
    RotateCw,
    MoreHorizontal,
    Play
} from "lucide-react";
import { getTiktokPostAnalytics } from "@/app/actions/social/tiktok/getAnalytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TiktokAnalyticsModal({
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
                likes: post?.metrics?.likes || 0,
                comments: post?.metrics?.comments || 0,
                shares: post?.metrics?.shares || 0,
                views: post?.metrics?.views || 0,
            });
        }
    }, [open, post]);

    const loadAnalytics = async (forceRefresh = false) => {
        try {
            if (forceRefresh) setRefreshing(true);
            else setLoading(true);

            const res = await getTiktokPostAnalytics(post.accountId, post.id, forceRefresh);

            if (res.success) {
                setData(res.data);
                setLastRefreshed(res.lastRefreshed);

                if (forceRefresh) {
                    toast.success("Analytics refreshed");
                }
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
            label: "Views",
            value: data?.views || 0,
            icon: Eye,
            desc: "Total views"
        },
        {
            label: "Likes",
            value: data?.likes || 0,
            icon: Heart,
            desc: "Total likes"
        },
        {
            label: "Comments",
            value: data?.comments || 0,
            icon: MessageCircle,
            desc: "Total comments"
        },
        {
            label: "Shares",
            value: data?.shares || 0,
            icon: Share2,
            desc: "Total shares"
        },
        {
            label: "Engagement",
            value: (data?.likes || 0) + (data?.comments || 0) + (data?.shares || 0),
            icon: TrendingUp,
            desc: "Total interactions"
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="w-[95vw] md:w-[85vw] md:max-w-[1200px] h-[90vh] p-0 overflow-hidden rounded-[24px]">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black rounded-lg">
                            <TiktokLogo className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight">TikTok Analytics</DialogTitle>
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
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
                                        {[...Array(6)].map((_, i) => (
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
                                                            <metric.icon className="h-4 w-4 text-black" />
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
                                                    {post?.publishedAt || post?.createdAt ? format(new Date(post.publishedAt || post.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
                                                </span>
                                            </div>

                                            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <MessageCircle className="h-4 w-4 text-gray-400" />
                                                    <span className="text-[13px] font-bold text-gray-600">Video Description</span>
                                                </div>
                                                <div className="text-[14px] leading-relaxed text-gray-900 bg-white p-4 rounded-xl border border-gray-50 max-h-[150px] overflow-y-auto font-medium">
                                                    {post?.content?.text || post?.message || "No description"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Right Column - Preview */}
                    <div className="w-[440px] bg-gray-50/30 flex items-center justify-center p-8">
                        {loading ? (
                            <Skeleton className="w-[300px] h-[533px] rounded-[32px]" />
                        ) : (
                            <div className="w-[300px] aspect-[9/16] bg-black rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden relative group">
                                {data?.media_url ? (
                                    <video src={data.media_url} className="w-full h-full object-cover" muted autoPlay loop />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                        <TiktokLogo className="h-16 w-16 text-gray-800" />
                                    </div>
                                )}

                                {/* TikTok UI Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none p-4 flex flex-col justify-end">
                                    <div className="flex items-end justify-between">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-sm font-bold">@{post?.username || "tiktokuser"}</span>
                                            </div>
                                            <p className="text-white text-xs line-clamp-2">{post?.content?.text}</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-4 pb-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                    <Heart className="h-5 w-5 text-white fill-white" />
                                                </div>
                                                <span className="text-white text-[10px] font-bold">{formatNumber(data?.likes)}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                    <MessageCircle className="h-5 w-5 text-white fill-white" />
                                                </div>
                                                <span className="text-white text-[10px] font-bold">{formatNumber(data?.comments)}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                    <Share2 className="h-5 w-5 text-white fill-white" />
                                                </div>
                                                <span className="text-white text-[10px] font-bold">{formatNumber(data?.shares)}</span>
                                            </div>
                                        </div>
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
