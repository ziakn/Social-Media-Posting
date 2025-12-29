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
    Heart,
    MessageCircle,
    Eye,
    BarChart3,
    Share2,
    Bookmark,
    Users,
    Play,
    TrendingUp,
    Calendar,
    Info,
    Instagram,
    ExternalLink,
    Layers,
    MoreVertical,
    ImageIcon
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

    // Helper function to get media URL from post object
    const getMediaUrl = () => {
        if (!post) return null;

        // Direct mediaUrl property
        if (post.mediaUrl) return post.mediaUrl;

        // Check content.media array
        if (post.content?.media && Array.isArray(post.content.media) && post.content.media.length > 0) {
            return post.content.media[0].url;
        }

        // Check content.image
        if (post.content?.image?.url) return post.content.image.url;

        // Check content.video
        if (post.content?.video?.url) return post.content.video.url;

        return null;
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
            desc: "Total views"
        },
        {
            label: "Reach",
            value: getMetricValue("reach"),
            icon: Users,
            desc: "Unique accounts"
        },
        {
            label: "Likes",
            value: data?.like_count || 0,
            icon: Heart,
            desc: "Total likes"
        },
        {
            label: "Comments",
            value: data?.comments_count || 0,
            icon: MessageCircle,
            desc: "Total comments"
        },
        {
            label: "Saved",
            value: getMetricValue("saved"),
            icon: Bookmark,
            desc: "Total saves"
        },
        {
            label: "Engagement",
            value: (data?.like_count || 0) + (data?.comments_count || 0) + (getMetricValue("saved") || 0),
            icon: TrendingUp,
            desc: "Interactions"
        }
    ];

    // Add video specific metrics
    if (data?.media_type === "VIDEO" || data?.media_type === "REELS") {
        const views = getMetricValue("video_views") || getMetricValue("plays"); // plays for reels
        metrics.push({
            label: "Video Views",
            value: views,
            icon: Play,
            desc: "Total plays"
        });
    }

    // Shares
    const shares = getMetricValue("shares");
    if (shares > 0) {
        metrics.push({
            label: "Shares",
            value: shares,
            icon: Share2,
            desc: "Total shares"
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] md:w-[85vw] md:max-w-[1200px] h-[90vh] p-0 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
                            <Instagram className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">Post Analytics</DialogTitle>
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
                                                            <><Play className="h-3 w-3 mr-1" /> Reel</>
                                                        ) : post?.postType === 'carousel' ? (
                                                            <><Layers className="h-3 w-3 mr-1" /> Carousel</>
                                                        ) : (
                                                            <><Eye className="h-3 w-3 mr-1" /> Image</>
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
                                                    {post?.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : "N/A"}
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
                                                        {post?.caption || "No caption provided"}
                                                    </p>
                                                </ScrollArea>
                                            </div>

                                            {/* View on Instagram */}
                                            {data?.permalink && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() => window.open(data.permalink, '_blank')}
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    View on Instagram
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Right Column - Instagram Preview */}
                    <div className="w-[420px] bg-muted/20 flex items-center justify-center p-6">
                        {loading ? (
                            <Skeleton className="w-[340px] h-[600px] rounded-3xl" />
                        ) : (
                            <div className="w-[340px] bg-background rounded-3xl shadow-2xl border-8 border-border/40 overflow-hidden">
                                {/* Instagram Header */}
                                <div className="px-4 py-3 border-b flex items-center justify-between bg-background">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                            <Instagram className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold">@instagram_user</span>
                                    </div>
                                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                </div>

                                {/* Media Preview */}
                                <div className="aspect-square relative bg-muted/40">
                                    {getMediaUrl() ? (
                                        post.postType === 'video' || post.postType === 'reels' || post.postType === 'reel' ? (
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

                                {/* Instagram Actions */}
                                <div className="px-4 py-3 space-y-2 bg-background">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Heart className="h-6 w-6" />
                                            <MessageCircle className="h-6 w-6" />
                                            <Share2 className="h-6 w-6" />
                                        </div>
                                        <Bookmark className="h-6 w-6" />
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-semibold">@instagram_user</span>
                                        <span className="text-muted-foreground ml-2">
                                            {post?.caption ?
                                                (post.caption.length > 50 ? post.caption.substring(0, 50) + '...' : post.caption)
                                                : 'Write a caption...'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">JUST NOW</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
