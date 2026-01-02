"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
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
    MousePointer2,
    Users,
    Play,
    TrendingUp,
    Calendar,
    Twitter,
    ExternalLink,
    Layers,
    MoreVertical,
    ImageIcon,
    RotateCw,
    Share2,
    Info
} from "lucide-react";
import { XLogo } from "@/components/icons/XLogo";
import { toast } from "sonner";
import { cn, formatNumber } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

export default function TwitterAnalyticsModal({
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
            // Fallback for posts that don't have IDs yet or are local
            setData({
                summary: {
                    likes: post?.metrics?.likes || 0,
                    replies: post?.metrics?.replies || 0,
                    retweets: post?.metrics?.retweets || 0,
                    impressions: post?.metrics?.impressions || 0,
                    profile_visits: 0
                },
                insights: []
            });
        }
    }, [open, post]);

    const loadAnalytics = async (forceRefresh = false) => {
        try {
            if (forceRefresh) setRefreshing(true);
            else setLoading(true);

            // Assuming accountId is part of post or we use a fallback
            const res = await getTwitterPostAnalytics(post.accountId || 'unknown', post.id, forceRefresh);

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
                            replies: post.metrics?.replies || 0,
                            retweets: post.metrics?.retweets || 0,
                            impressions: post.metrics?.impressions || 0,
                            profile_visits: 0
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



    const totalEngagements = (data?.summary?.likes || 0) + (data?.summary?.replies || 0) + (data?.summary?.retweets || 0);

    const metrics = [
        {
            label: "Impressions",
            value: data?.summary?.impressions || 0,
            icon: Eye,
            desc: "Total views"
        },
        {
            label: "Profile Visits",
            value: data?.summary?.profile_visits || 0,
            icon: Users,
            desc: "Profile clicks"
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
            value: data?.summary?.retweets || 0,
            icon: Repeat2,
            desc: "Total reposts"
        },
        {
            label: "Engagement",
            value: totalEngagements,
            icon: TrendingUp,
            desc: "Total interactions"
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] md:w-[85vw] md:max-w-[1200px] h-[90vh] p-0 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black rounded-lg">
                            <XLogo className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">Tweet Analytics</DialogTitle>
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
                                                        ) : post?.postType === 'image' || post?.postType === 'images' ? (
                                                            <><ImageIcon className="h-3 w-3 mr-1" /> Image</>
                                                        ) : (
                                                            <><ImageIcon className="h-3 w-3 mr-1" /> Text</> // Default fallback
                                                        )}
                                                    </Badge>
                                                </div>
                                                <Badge variant={post?.status === 'posted' ? 'default' : 'secondary'}>
                                                    {post?.status === 'posted' ? 'Published' : post?.status}
                                                </Badge>
                                            </div>

                                            {/* Published Date */}
                                            <div className="p-3 bg-muted/30 rounded-lg border border-border/60">
                                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Date
                                                </div>
                                                <div className="text-sm font-medium pl-6">
                                                    {post?.scheduledAt || post?.createdAt ? format(new Date(post.scheduledAt || post.createdAt), "MMMM dd, yyyy • HH:mm") : "N/A"}
                                                </div>
                                            </div>

                                            {/* Caption */}
                                            <div className="p-3 bg-muted/30 rounded-lg border border-border/60">
                                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                                    <MessageCircle className="h-4 w-4" />
                                                    Post Content
                                                </div>
                                                <ScrollArea className="h-[120px] w-full">
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 pl-6">
                                                        {post?.message || post?.caption || "No content"}
                                                    </p>
                                                </ScrollArea>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Right Column - Twitter Preview */}
                    <div className="w-[420px] bg-muted/20 flex items-center justify-center p-6">
                        {loading ? (
                            <Skeleton className="w-[340px] h-[400px] rounded-3xl" />
                        ) : (
                            <div className="w-[340px] bg-background rounded-xl shadow-xl border border-border/40 overflow-hidden">
                                {/* Twitter Header */}
                                <div className="px-4 py-3 flex items-start justify-between bg-background">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {post?.profilePicture ?
                                                <img src={post.profilePicture} className="w-full h-full object-cover" /> :
                                                <XLogo className="h-5 w-5 text-black" />
                                            }
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 leading-tight">{post?.username || "Twitter User"}</div>
                                            <div className="text-xs text-gray-500">@{post?.username?.replace(/\s/g, '').toLowerCase() || "user"}</div>
                                        </div>
                                    </div>
                                    <XLogo className="h-5 w-5 text-black" />
                                </div>

                                {/* Content */}
                                <div className="px-4 pb-3">
                                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                                        {post?.message || post?.caption || ""}
                                    </p>
                                </div>

                                {/* Media Preview */}
                                {getMediaUrl() && (
                                    <div className="px-4 pb-3">
                                        <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 relative aspect-video">
                                            {post.postType === 'video' ? (
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
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Twitter Actions */}
                                <div className="px-4 py-3 border-t border-gray-50 bg-background flex items-center justify-between text-gray-500">
                                    <div className="flex items-center gap-1.5 hover:text-black transition-colors">
                                        <MessageCircle className="h-4 w-4" />
                                        <span className="text-xs">{formatNumber(data?.summary?.replies || 0)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
                                        <Repeat2 className="h-4 w-4" />
                                        <span className="text-xs">{formatNumber(data?.summary?.retweets || 0)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                                        <Heart className="h-4 w-4" />
                                        <span className="text-xs">{formatNumber(data?.summary?.likes || 0)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 hover:text-black transition-colors">
                                        <Share2 className="h-4 w-4" />
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
