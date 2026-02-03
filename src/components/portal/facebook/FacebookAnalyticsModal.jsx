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
    X,
    Heart,
    FileText
} from "lucide-react";
import { getFacebookPostAnalytics } from "@/app/actions/social/facebook/getAnalytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

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

    const totalEngagements = (data?.summary?.likes || 0) + (data?.summary?.comments || 0) + (data?.summary?.shares || 0);

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
            label: "Engagement",
            value: totalEngagements,
            icon: TrendingUp,
            desc: "Interactions"
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] md:w-[85vw] md:max-w-[1200px] h-[90vh] p-0 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Facebook className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">Post Analytics</DialogTitle>
                    </div>
                    <div className="flex items-center gap-4">
                        {lastRefreshed && (
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/60 leading-tight">
                                    Last Updated
                                </span>
                                <span className="text-xs font-medium text-muted-foreground">
                                    {formatDistanceToNow(new Date(lastRefreshed), { addSuffix: true })}
                                </span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2"
                            onClick={() => loadAnalytics(true)}
                            disabled={loading || refreshing}
                        >
                            <RotateCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="flex h-[calc(90vh-73px)] overflow-hidden">
                    {/* Left Column - Metrics & Details */}
                    <ScrollArea className="flex-1 border-r">
                        <div className="p-6 space-y-6">
                            {loading ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[...Array(6)].map((_, i) => (
                                            <Skeleton key={i} className="h-20 w-full" />
                                        ))}
                                    </div>
                                    <Skeleton className="h-32 w-full" />
                                </div>
                            ) : (
                                <>
                                    {/* Metrics Grid */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                            Performance Metrics
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {metrics.map((metric, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-3 px-4 py-3 bg-muted/30 border border-border/60 rounded-lg hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="p-2 bg-background rounded-md">
                                                        <metric.icon className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xl font-bold">{formatNumber(metric.value)}</div>
                                                        <p className="text-xs text-muted-foreground truncate">{metric.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Post Information */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                            Post Information
                                        </h3>
                                        <div className="space-y-4">
                                            {/* Post Type & Status */}
                                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/60">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-muted-foreground">Type:</span>
                                                    <Badge variant="outline" className="capitalize text-xs">
                                                        {post?.postType === 'video' ? (
                                                            <><Play className="h-3 w-3 mr-1" /> Video</>
                                                        ) : post?.postType === 'carousel' ? (
                                                            <><Layers className="h-3 w-3 mr-1" /> Carousel</>
                                                        ) : (
                                                            <><ImageIcon className="h-3 w-3 mr-1" /> Image</>
                                                        )}
                                                    </Badge>
                                                </div>
                                                <Badge variant={post?.status === 'published' ? 'default' : 'secondary'}>
                                                    {post?.status || 'Published'}
                                                </Badge>
                                            </div>

                                            {/* Published Date */}
                                            <div className="p-3 bg-muted/30 rounded-lg border border-border/60">
                                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Published Date
                                                </div>
                                                <div className="text-sm font-medium pl-6">
                                                    {post?.publishedAt || post?.createdAt ? format(new Date(post.publishedAt || post.createdAt), "MMMM dd, yyyy • HH:mm") : "N/A"}
                                                </div>
                                            </div>

                                            {/* Caption */}
                                            <div className="p-3 bg-muted/30 rounded-lg border border-border/60">
                                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                                    <MessageCircle className="h-4 w-4" />
                                                    Caption
                                                </div>
                                                <ScrollArea className="h-[120px] w-full">
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 pl-6">
                                                        {post?.message || post?.caption || "No caption provided"}
                                                    </p>
                                                </ScrollArea>
                                            </div>

                                            {/* View on Facebook */}
                                            {data?.permalink_url && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() => window.open(data.permalink_url, '_blank')}
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    View on Facebook
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Right Column - Facebook Preview */}
                    <div className="w-[420px] bg-muted/20 flex items-center justify-center p-6">
                        {loading ? (
                            <Skeleton className="w-[340px] h-[600px] rounded-3xl" />
                        ) : (
                            <div className="w-[340px] bg-background rounded-3xl shadow-2xl border-8 border-border/40 overflow-hidden">
                                {/* Facebook Header */}
                                <div className="px-4 py-3 border-b flex items-center justify-between bg-background">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                            <Facebook className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold">Facebook User</span>
                                    </div>
                                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                </div>

                                {/* Media Preview */}
                                <div className="aspect-square relative bg-muted/40">
                                    {getMediaUrl() ? (
                                        post.postType === 'video' ? (
                                            <video
                                                src={getMediaUrl()}
                                                className="w-full h-full object-cover"
                                                controls
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={getMediaUrl()}
                                                className="w-full h-full object-cover"
                                                alt="Post"
                                            />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                            <Info className="h-12 w-12 mb-2 opacity-40" />
                                            <span className="text-xs">No Preview</span>
                                        </div>
                                    )}
                                </div>

                                {/* Facebook Actions */}
                                <div className="px-4 py-3 space-y-3 bg-background">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center -space-x-1">
                                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center border-2 border-background">
                                                <ThumbsUp className="h-2.5 w-2.5 text-white fill-white" />
                                            </div>
                                            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center border-2 border-background">
                                                <Heart className="h-2.5 w-2.5 text-white fill-white" />
                                            </div>
                                            <span className="pl-2 text-xs font-medium text-muted-foreground">
                                                {formatNumber(data?.summary?.likes || 0)}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatNumber(data?.summary?.comments || 0)} comments
                                        </span>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-around py-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <ThumbsUp className="h-5 w-5" />
                                            <span className="text-xs font-semibold">Like</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MessageCircle className="h-5 w-5" />
                                            <span className="text-xs font-semibold">Comment</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Share2 className="h-5 w-5" />
                                            <span className="text-xs font-semibold">Share</span>
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
