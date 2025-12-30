"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    ThumbsUp,
    MessageCircle,
    Eye,
    BarChart3,
    Share2,
    MousePointer2,
    Users,
    Play,
    TrendingUp,
    Calendar,
    Info,
    Facebook,
    ExternalLink,
    Layers,
    MoreVertical,
    ImageIcon,
    RotateCw,
    X
} from "lucide-react";
import { getFacebookPostAnalytics } from "@/app/actions/social/facebook/getAnalytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function FacebookAnalyticsModal({
    open,
    onOpenChange,
    post
}) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    useEffect(() => {
        if (open && post?.facebookPostId && post?.pageId) {
            loadAnalytics();
        } else if (open) {
            setLoading(false);
            // Fallback for posts that don't have IDs yet or are local
            setData({
                summary: {
                    likes: post?.metrics?.likes || 0,
                    comments: post?.metrics?.comments || 0,
                    shares: post?.metrics?.shares || 0,
                    reach: post?.metrics?.reach || 0,
                    impressions: post?.metrics?.views || 0,
                    clicks: 0
                },
                insights: []
            });
        }
    }, [open, post]);

    const loadAnalytics = async (forceRefresh = false) => {
        try {
            if (forceRefresh) setRefreshing(true);
            else setLoading(true);

            const res = await getFacebookPostAnalytics(post.pageId, post.facebookPostId, forceRefresh);

            if (res.success) {
                setData(res.data);
                setLastRefreshed(res.lastRefreshed);
                if (forceRefresh) toast.success("Analytics refreshed");
            } else {
                toast.error(res.message || "Failed to load analytics");
                if (!data) {
                    setData({
                        summary: {
                            likes: post.metrics?.likes || 0,
                            comments: post.metrics?.comments || 0,
                            shares: post.metrics?.shares || 0,
                            reach: post.metrics?.reach || 0,
                            impressions: post.metrics?.views || 0,
                            clicks: 0
                        },
                        insights: []
                    });
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while loading analytics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getMediaUrl = () => {
        if (!post) return null;
        if (post.mediaUrls?.[0]?.url) return post.mediaUrls[0].url;
        if (post.mediaUrl) return post.mediaUrl;
        return null;
    };

    const formatNumber = (num) => {
        if (!num) return 0;
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
    };

    const metrics = [
        {
            label: "Impressions",
            value: data?.summary?.impressions || 0,
            icon: Eye,
            desc: "Total views"
        },
        {
            label: "Reach",
            value: data?.summary?.reach || 0,
            icon: Users,
            desc: "Unique accounts"
        },
        {
            label: "Reactions",
            value: data?.summary?.likes || 0,
            icon: ThumbsUp,
            desc: "Total reactions"
        },
        {
            label: "Comments",
            value: data?.summary?.comments || 0,
            icon: MessageCircle,
            desc: "Total comments"
        },
        {
            label: "Shares",
            value: data?.summary?.shares || 0,
            icon: Share2,
            desc: "Total shares"
        },
        {
            label: "Clicks",
            value: data?.summary?.clicks || 0,
            icon: MousePointer2,
            desc: "Post clicks"
        }
    ];

    if (data?.summary?.reach > 0) {
        const eng = (data.summary.likes + data.summary.comments + data.summary.shares);
        metrics.push({
            label: "Engagement Rate",
            value: ((eng / data.summary.reach) * 100).toFixed(2) + "%",
            icon: TrendingUp,
            desc: "Interaction per reach"
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] md:w-[85vw] md:max-w-[1200px] h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem]">
                {/* Header */}
                <div className="px-8 py-6 border-b flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-facebook-blue rounded-2xl shadow-lg shadow-blue-100">
                            <Facebook className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-semibold text-gray-900 tracking-tight">Post Insights</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">Performance Intelligence</DialogDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        {lastRefreshed && (
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[10px] uppercase font-semibold text-muted-foreground/60 leading-tight">
                                    Last Sync
                                </span>
                                <span className="text-xs font-medium text-muted-foreground">
                                    {formatDistanceToNow(new Date(lastRefreshed), { addSuffix: true })}
                                </span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-11 px-6 rounded-xl gap-2 font-semibold border-2 border-blue-50 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                            onClick={() => loadAnalytics(true)}
                            disabled={loading || refreshing}
                        >
                            <RotateCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                            {refreshing ? "Updating..." : "Refresh Stats"}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-11 w-11 hover:bg-red-50 hover:text-red-500 transition-colors"><X className="h-6 w-6" /></Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex h-[calc(90vh-93px)] overflow-hidden bg-gray-50/50">
                    {/* Metrics Panel */}
                    <ScrollArea className="flex-1 border-r border-gray-100">
                        <div className="p-8 space-y-8">
                            {loading ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[...Array(6)].map((_, i) => (
                                            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                                        ))}
                                    </div>
                                    <Skeleton className="h-40 w-full rounded-2xl" />
                                </div>
                            ) : (
                                <>
                                    {/* High-Impact Stat Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {metrics.map((metric, i) => (
                                            <div
                                                key={i}
                                                className="group relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <metric.icon className="h-12 w-12 text-blue-600" />
                                                </div>
                                                <div className="relative space-y-1">
                                                    <div className="p-1.5 bg-blue-50 w-fit rounded-lg mb-2">
                                                        <metric.icon className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900 tracking-tighter">{typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}</div>
                                                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator className="bg-gray-100" />

                                    {/* Detailed Post Context */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Content Metadata</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-1">
                                                <span className="text-xs text-muted-foreground">Post Type</span>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Badge variant="outline" className="rounded-lg h-7 font-semibold text-xs gap-1.5 bg-blue-50 text-blue-600 border-blue-100">
                                                        {post?.postType === 'video' ? <><Play className="h-3 w-3 fill-current" /> VIDEO REEL</> :
                                                            post?.postType === 'images' ? <><ImageIcon className="h-3 w-3" /> IMAGE GALLERY</> :
                                                                <><Layers className="h-3 w-3" /> TEXT STATUS</>}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-1">
                                                <span className="text-xs text-muted-foreground">Published On</span>
                                                <div className="flex items-center gap-2 pt-1 font-bold text-sm text-gray-700">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {post?.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    }) : "Unknown Date"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <MessageCircle className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs text-muted-foreground">Original Caption</span>
                                            </div>
                                            <ScrollArea className="max-h-[150px]">
                                                <p className="text-[15px] font-medium leading-relaxed text-gray-700 whitespace-pre-wrap italic opacity-80 pl-2 border-l-4 border-blue-100">
                                                    {post?.message || post?.caption || "No caption provided for this post."}
                                                </p>
                                            </ScrollArea>
                                        </div>

                                        {data?.permalink_url && (
                                            <Button
                                                variant="outline"
                                                className="w-full h-14 rounded-2xl font-semibold text-base border-2 hover:bg-facebook-blue hover:text-white hover:border-facebook-blue transition-all group active:scale-[0.98]"
                                                onClick={() => window.open(data.permalink_url, '_blank')}
                                            >
                                                <ExternalLink className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
                                                Interact on Facebook
                                            </Button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Visual Preview Sidecar */}
                    <div className="hidden lg:flex w-[450px] bg-white items-center justify-center p-8">
                        {loading ? (
                            <Skeleton className="w-[360px] h-[580px] rounded-[3rem] shadow-2xl" />
                        ) : (
                            <div className="w-[360px] bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border-[10px] border-gray-950 overflow-hidden relative">
                                {/* Mobile-style Status Bar Area */}
                                <div className="h-6 bg-gray-950" />

                                {/* FB Post Header */}
                                <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-facebook-blue to-blue-800 flex items-center justify-center p-0.5 shadow-md">
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                                <Facebook className="h-6 w-6 text-facebook-blue fill-current" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 leading-none">Social Portal</span>
                                            <span className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-wider flex items-center gap-1">2h • <Users className="h-2 w-2" /></span>
                                        </div>
                                    </div>
                                    <MoreVertical className="h-5 w-5 text-gray-300" />
                                </div>

                                {/* Media Content */}
                                <div className="aspect-square relative bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {getMediaUrl() ? (
                                        post.postType === 'video' ? (
                                            <video src={getMediaUrl()} className="w-full h-full object-cover" controls playsInline />
                                        ) : (
                                            <img src={getMediaUrl()} className="w-full h-full object-cover" alt="" />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-200">
                                            <Info className="h-16 w-16 mb-4 opacity-20" />
                                            <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-30">No Media</span>
                                        </div>
                                    )}
                                </div>

                                {/* Interaction Area */}
                                <div className="px-5 py-4 space-y-4 bg-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center -space-x-1.5">
                                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white shadow-sm"><ThumbsUp className="h-2.5 w-2.5 text-white fill-white" /></div>
                                            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center border-2 border-white shadow-sm"><Heart className="h-2.5 w-2.5 text-white fill-white" /></div>
                                            <span className="pl-3.5 text-xs font-semibold text-gray-500">{formatNumber(data?.summary?.likes || 0)}</span>
                                        </div>
                                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{formatNumber(data?.summary?.comments || 0)} comments</div>
                                    </div>
                                    <Separator className="bg-gray-50" />
                                    <div className="flex items-center justify-around py-1">
                                        <ThumbsUp className="h-5 w-5 text-gray-300" />
                                        <MessageCircle className="h-5 w-5 text-gray-300" />
                                        <Share2 className="h-5 w-5 text-gray-300" />
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
