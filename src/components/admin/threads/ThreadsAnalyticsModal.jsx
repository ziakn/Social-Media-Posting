"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
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
    BarChart3,
    Repeat2,
    TrendingUp,
    Calendar,
    RotateCw,
    Share2,
    Info,
    Send
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatNumber } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";
import { getThreadsPostAnalytics } from "@/app/actions/social/threads/getAnalytics";

export default function ThreadsAnalyticsModal({
    open,
    onOpenChange,
    post
}) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [isRateLimited, setIsRateLimited] = useState(false);

    useEffect(() => {
        if (open && post?.id) {
            loadAnalytics();
        } else if (open) {
            setLoading(false);
            setData({
                summary: post?.metrics || {
                    likes: 0,
                    replies: 0,
                    reposts: 0,
                    quotes: 0,
                    views: 0
                }
            });
        }
    }, [open, post]);

    const loadAnalytics = async (forceRefresh = false) => {
        try {
            if (forceRefresh) setRefreshing(true);
            else setLoading(true);

            const res = await getThreadsPostAnalytics(post.accountId, post.id, forceRefresh);

            if (res.success) {
                setData(res.data);
                setLastRefreshed(res.lastRefreshed);
                setIsRateLimited(!!res.isRateLimited);

                if (res.isRateLimited) {
                    toast.warning(res.message || "Threads rate limit reached. Showing cached data.");
                } else if (forceRefresh) {
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

    const metrics = [
        {
            label: "Views",
            value: data?.summary?.views || 0,
            icon: Eye,
            desc: "Total views"
        },
        {
            label: "Likes",
            value: data?.summary?.likes || 0,
            icon: Heart,
            desc: "Total likes"
        },
        {
            label: "Replies",
            value: data?.summary?.replies || 0,
            icon: MessageCircle,
            desc: "Total replies"
        },
        {
            label: "Reposts",
            value: data?.summary?.reposts || 0,
            icon: Repeat2,
            desc: "Total reposts"
        },
        {
            label: "Quotes",
            value: data?.summary?.quotes || 0,
            icon: Send,
            desc: "Total quotes"
        },
        {
            label: "Engagement",
            value: (data?.summary?.likes || 0) + (data?.summary?.replies || 0),
            icon: TrendingUp,
            desc: "Core interactions"
        }
    ];

    const getMediaUrl = () => {
        if (!post) return null;
        if (post.mediaUrls?.[0]?.url) return post.mediaUrls[0].url;
        if (post.mediaUrl) return post.mediaUrl;
        if (post.content?.mediaUrl) return post.content.mediaUrl;
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] md:w-[85vw] md:max-w-[1200px] h-[90vh] p-0 overflow-hidden rounded-[24px]">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black rounded-lg">
                            <ThreadsLogo className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight">Threads Analytics</DialogTitle>
                        {isRateLimited && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 gap-1 px-2 py-0.5 h-auto">
                                <Info className="h-3 w-3" />
                                Cached
                            </Badge>
                        )}
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
                    {/* Left Column */}
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
                                                        {metric.label === 'Engagement' && (
                                                            <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+4%</div>
                                                        )}
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
                                                    {post?.createdAt ? format(new Date(post.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
                                                </span>
                                            </div>

                                            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <MessageCircle className="h-4 w-4 text-gray-400" />
                                                    <span className="text-[13px] font-bold text-gray-600">Thread Caption</span>
                                                </div>
                                                <div className="text-[14px] leading-relaxed text-gray-900 bg-white p-4 rounded-xl border border-gray-50 max-h-[150px] overflow-y-auto font-medium">
                                                    {post?.content?.text || post?.message || post?.caption || "No caption"}
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
                            <Skeleton className="w-[340px] h-[450px] rounded-[32px]" />
                        ) : (
                            <div className="w-[340px] bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                                    <ThreadsLogo className="h-6 w-6" />
                                    <div className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Preview</div>
                                </div>
                                <div className="p-5 flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10 border border-gray-50">
                                            <AvatarImage src={post?.profilePicture} className="object-cover" />
                                            <AvatarFallback className="bg-gray-100 font-bold text-[10px]">{post?.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[14px] font-bold truncate">{post?.username || "user"}</span>
                                                <span className="text-[12px] text-gray-400">1m</span>
                                            </div>
                                            <p className="text-[14px] text-gray-900 mt-1 line-clamp-4 font-medium">
                                                {post?.content?.text || post?.message || post?.caption || ""}
                                            </p>
                                        </div>
                                    </div>
                                    {getMediaUrl() && (
                                        <div className="rounded-2xl overflow-hidden aspect-square border border-gray-50 shadow-sm">
                                            <img src={getMediaUrl()} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 text-gray-900 opacity-50">
                                        <Heart className="h-5 w-5" />
                                        <MessageCircle className="h-5 w-5" />
                                        <Repeat2 className="h-5 w-5" />
                                        <Send className="h-5 w-5" />
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
