"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
    ExternalLink,
    MessageSquare,
    X
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
            label: "Reactions",
            value: data?.metrics?.reactions || 0,
            icon: Heart,
            desc: "Hearts & Likes"
        },
        {
            label: "Comments",
            value: data?.metrics?.comments || 0,
            icon: MessageSquare,
            desc: "Public responses"
        },
        {
            label: "Engagement",
            value: (data?.metrics?.saves || 0) + (data?.metrics?.clicks || 0) + (data?.metrics?.reactions || 0) + (data?.metrics?.comments || 0),
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
            <DialogContent showCloseButton={false} className="w-[95vw] md:w-[85vw] md:max-w-[1200px] h-[90vh] p-0 overflow-hidden rounded-[24px]">
                {/* Header */}

                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[#E60023]">
                        <div className="p-2 bg-[#E60023] rounded-lg shadow-sm">
                            <PinterestLogo className="h-5 w-5 fill-white" />
                        </div>
                        <DialogTitle className="text-xl font-black tracking-tight text-black">Pinterest Insights</DialogTitle>
                    </div>
                    <div className="flex items-center gap-4">
                        {lastRefreshed && (
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[10px] uppercase font-black text-gray-300 leading-tight tracking-widest">Last Synced</span>
                                <span className="text-xs font-bold text-gray-500">
                                    {formatDistanceToNow(new Date(lastRefreshed), { addSuffix: true })}
                                </span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2 rounded-full font-black px-4 text-xs uppercase tracking-wider border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                            onClick={() => loadAnalytics(true)}
                            disabled={loading || refreshing}
                        >
                            <RotateCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
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
                        <div className="max-w-3xl mx-auto space-y-10 p-6">
                            {loading ? (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-2 gap-6">
                                        {[...Array(4)].map((_, i) => (
                                            <Skeleton key={i} className="h-32 w-full rounded-[24px]" />
                                        ))}
                                    </div>
                                    <Skeleton className="h-44 w-full rounded-[24px]" />
                                </div>
                            ) : (
                                <>
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Core Performance</h3>
                                            <Badge variant="secondary" className="bg-green-50 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full border-none">
                                                Active Since {post?.publishedAt ? format(new Date(post.publishedAt), "MMM dd") : "Publish"}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            {metrics.map((metric, i) => (
                                                <div
                                                    key={i}
                                                    className="group flex flex-col gap-2 p-6 bg-gray-50/50 border border-gray-100 rounded-[24px] transition-all hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-gray-200"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-50 group-hover:bg-[#E60023] group-hover:border-[#E60023] transition-colors">
                                                            <metric.icon className="h-4 w-4 text-[#E60023] group-hover:text-white transition-colors" />
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <div className="text-3xl font-black text-black tracking-tighter leading-none mb-1">{formatNumber(metric.value)}</div>
                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{metric.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator className="bg-gray-100" />

                                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Context & Metadata</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="p-5 bg-white rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-50 rounded-lg">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <span className="text-[13px] font-bold text-gray-500">Live Date</span>
                                                </div>
                                                <span className="text-[13px] font-black text-black">
                                                    {post?.publishedAt ? format(new Date(post.publishedAt), "MMM dd, yyyy HH:mm") : "Not Published"}
                                                </span>
                                            </div>

                                            <div className="p-6 bg-gray-50/30 rounded-[24px] border border-gray-100 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                                        <Pin className="h-4 w-4 text-[#E60023]" />
                                                    </div>
                                                    <span className="text-[13px] font-bold text-gray-500">Editorial Content</span>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="text-[16px] font-black text-black leading-tight">
                                                        {post?.title || "Untitled Pin"}
                                                    </div>
                                                    <div className="text-[14px] leading-relaxed text-gray-600 font-medium bg-white p-5 rounded-xl border border-gray-50 max-h-[120px] overflow-y-auto">
                                                        {post?.message || post?.description || "No description provided."}
                                                    </div>
                                                </div>
                                            </div>

                                            {data?.permalink && (
                                                <a
                                                    href={data.permalink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={cn(
                                                        buttonVariants({ variant: "outline", size: "lg" }),
                                                        "w-full h-14 rounded-2xl border-gray-200 justify-between group px-6 hover:bg-[#E60023] hover:border-[#E60023] transition-all flex items-center"
                                                    )}
                                                >
                                                    <span className="flex items-center gap-3 text-gray-600 font-bold group-hover:text-white transition-colors">
                                                        <PinterestLogo className="h-5 w-5 fill-current" />
                                                        Open on Pinterest.com
                                                    </span>
                                                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Right Column - Premium Pinterest Preview */}
                    <div className="w-[440px] bg-gray-50/30 flex items-center justify-center p-8">
                        {loading ? (
                            <Skeleton className="w-[340px] h-[540px] rounded-[40px] shadow-2xl" />
                        ) : (
                            <div className="w-[340px] animate-in zoom-in-95 duration-500">
                                <div className="text-center mb-6">
                                    <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em]">Live Pinterest Preview</span>
                                </div>
                                <div className="bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col group cursor-default">
                                    <div className="relative">
                                        {getMediaUrl() && (
                                            <div className="w-full aspect-[2/3] bg-gray-100 relative overflow-hidden">
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
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                        alt="Pin"
                                                    />
                                                )}
                                                <div className="absolute top-6 right-6 bg-[#E60023] text-white text-[13px] font-black px-5 py-2.5 rounded-full shadow-2xl transition-transform active:scale-90 opacity-100 scale-100">
                                                    Save
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-8 flex flex-col gap-4">
                                        <h3 className="font-black text-black text-xl leading-[1.2] line-clamp-3">
                                            {post?.title || "The perfect inspiration for your next project"}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-4 p-2 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm transition-all hover:bg-white group/user overflow-hidden">
                                            <Avatar className="h-10 w-10 ring-2 ring-white">
                                                <AvatarImage src={post?.profilePicture} className="object-cover" />
                                                <AvatarFallback className="bg-gray-200 font-bold text-gray-400">{post?.username?.[0] || 'P'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[13px] font-black text-black truncate pr-4">
                                                    {post?.username || "Studio Admin"}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Creator</span>
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
