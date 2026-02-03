"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Heart, MessageCircle, Eye, Share2, TrendingUp, Calendar, RotateCw, MoreHorizontal, Play, X, Info
} from "lucide-react";
import { getTiktokPostAnalytics } from "@/app/actions/social/tiktok/getAnalytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

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
        if (!num && num !== 0) return "0";
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
    };

    const metrics = [
        {
            label: "Views",
            value: data?.views || 0,
            icon: Eye,
            desc: "Total views",
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Likes",
            value: data?.likes || 0,
            icon: Heart,
            desc: "Total likes",
            color: "text-red-600",
            bg: "bg-red-50"
        },
        {
            label: "Comments",
            value: data?.comments || 0,
            icon: MessageCircle,
            desc: "Total comments",
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            label: "Shares",
            value: data?.shares || 0,
            icon: Share2,
            desc: "Total shares",
            color: "text-orange-600",
            bg: "bg-orange-50"
        },
        {
            label: "Interactions",
            value: (data?.likes || 0) + (data?.comments || 0) + (data?.shares || 0),
            icon: TrendingUp,
            desc: "Total engagement",
            color: "text-purple-600",
            bg: "bg-purple-50"
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="w-[95vw] md:w-[85vw] md:max-w-[1200px] h-[90vh] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-black rounded-xl shadow-lg transform rotate-3">
                            <TiktokLogo className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black tracking-tight text-gray-900">TikTok Insights</DialogTitle>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">Real-time Performance Data</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        {lastRefreshed && (
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[9px] uppercase font-black text-gray-300 tracking-widest leading-tight">Data Sync</span>
                                <span className="text-xs font-bold text-gray-500">
                                    {formatDistanceToNow(new Date(lastRefreshed), { addSuffix: true })}
                                </span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 gap-2 rounded-xl font-black uppercase pr-5 tracking-widest text-[10px] border-gray-100 shadow-sm hover:bg-black hover:text-white transition-all active:scale-95"
                            onClick={() => loadAnalytics(true)}
                            disabled={loading || refreshing}
                        >
                            <RotateCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                            {refreshing ? "Syncing..." : "Refresh Stats"}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full hover:bg-gray-50"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex h-[calc(90vh-81px)] overflow-hidden bg-white">
                    {/* Left Column - Metrics */}
                    <ScrollArea className="flex-1 border-r border-gray-100">
                        <div className="p-8 space-y-10">
                            {loading ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-5">
                                        {[...Array(6)].map((_, i) => (
                                            <Skeleton key={i} className="h-28 w-full rounded-[24px]" />
                                        ))}
                                    </div>
                                    <Skeleton className="h-48 w-full rounded-[24px]" />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Video Performance</h3>
                                            <Badge variant="secondary" className="bg-green-50 text-green-600 border-none font-black text-[9px] px-2.5 py-1 tracking-widest uppercase">Live Metrics</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            {metrics.map((metric, i) => (
                                                <div
                                                    key={i}
                                                    className="flex flex-col gap-1 p-6 bg-gray-50/30 border border-gray-100 rounded-[24px] transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5 group cursor-default"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className={cn("p-2.5 rounded-xl shadow-sm border border-white transition-transform group-hover:scale-110", metric.bg)}>
                                                            <metric.icon className={cn("h-4 w-4", metric.color)} />
                                                        </div>
                                                        <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                                                    </div>
                                                    <div className="mt-4">
                                                        <div className="text-3xl font-black tracking-tighter text-gray-900">{formatNumber(metric.value)}</div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mt-1">{metric.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 p-1 rounded-3xl border border-gray-100">
                                        <div className="bg-white p-6 rounded-[22px] shadow-sm">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-8 w-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                                                    <Info className="h-4 w-4 text-zinc-500" />
                                                </div>
                                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Post Meta</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="text-[13px] font-bold text-gray-600">Published On</span>
                                                    </div>
                                                    <span className="text-[13px] font-black text-gray-900">
                                                        {post?.publishedAt || post?.createdAt ? format(new Date(post.publishedAt || post.createdAt), "MMMM dd, yyyy @ HH:mm") : "N/A"}
                                                    </span>
                                                </div>

                                                <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-50">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <MessageCircle className="h-4 w-4 text-gray-400" />
                                                        <span className="text-[13px] font-bold text-gray-600">Video Description</span>
                                                    </div>
                                                    <div className="text-[14px] leading-relaxed text-gray-800 bg-white p-5 rounded-xl border border-gray-50 max-h-[150px] overflow-y-auto font-medium shadow-sm">
                                                        {post?.content?.text || post?.message || "This video has no description."}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Right Column - Preview */}
                    <div className="w-[480px] bg-zinc-50/50 flex items-center justify-center p-12 lg:p-16">
                        {loading ? (
                            <Skeleton className="w-[320px] h-[568px] rounded-[48px]" />
                        ) : (
                            <div className="w-[320px] aspect-[9/16] bg-black rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.3)] border-[8px] border-zinc-900 overflow-hidden relative group scale-110">
                                {data?.media_url || post?.content?.media?.[0]?.url || post?.mediaUrl ? (
                                    <video
                                        src={data?.media_url || post?.content?.media?.[0]?.url || post?.mediaUrl}
                                        className="w-full h-full object-cover"
                                        muted
                                        autoPlay
                                        loop
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                        <TiktokLogo className="h-20 w-20 text-zinc-800" />
                                    </div>
                                )}

                                {/* TikTok UI Overlays - Realistic */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none p-6 flex flex-col justify-end">
                                    <div className="flex items-end justify-between gap-4">
                                        <div className="flex-1 space-y-3 mb-4">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-7 w-7 border border-white/40">
                                                    <AvatarImage src={post?.profilePicture} />
                                                    <AvatarFallback className="bg-white/20 text-white text-[8px] font-black uppercase">{post?.username?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-white text-[14px] font-black drop-shadow-md">@{post?.username || "tiktokuser"}</span>
                                            </div>
                                            <p className="text-white text-[12px] line-clamp-2 leading-snug drop-shadow-md font-medium">{post?.content?.text || post?.message}</p>
                                        </div>

                                        <div className="flex flex-col items-center gap-5 pb-6">
                                            <div className="flex flex-col items-center">
                                                <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                                                    <Heart className="h-6 w-6 text-white fill-white" />
                                                </div>
                                                <span className="text-white text-[11px] font-black mt-1.5 drop-shadow-md">{formatNumber(data?.likes)}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                                                    <MessageCircle className="h-6 w-6 text-white fill-white" />
                                                </div>
                                                <span className="text-white text-[11px] font-black mt-1.5 drop-shadow-md">{formatNumber(data?.comments)}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                                                    <Share2 className="h-6 w-6 text-white fill-white" />
                                                </div>
                                                <span className="text-white text-[11px] font-black mt-1.5 drop-shadow-md">{formatNumber(data?.shares)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Home Indicator */}
                                    <div className="w-20 h-1 bg-white/30 rounded-full mx-auto mt-4" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
