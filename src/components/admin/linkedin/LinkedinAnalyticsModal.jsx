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
    Repeat2,
    Send,
    TrendingUp,
    Calendar,
    Info,
    RotateCw,
    MoreHorizontal,
    Globe
} from "lucide-react";
import { getLinkedinPostAnalytics } from "@/app/actions/social/linkedin/getAnalytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { LinkedinLogo } from "@/components/icons/LinkedinLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LinkedinPreview from "./LinkedinPreview";

export default function LinkedinAnalyticsModal({
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
                    comments: 0,
                    shares: 0,
                    views: 0
                }
            });
        }
    }, [open, post]);

    const loadAnalytics = async (forceRefresh = false) => {
        try {
            if (forceRefresh) setRefreshing(true);
            else setLoading(true);

            const res = await getLinkedinPostAnalytics(post.accountId, post.id, forceRefresh);

            if (res.success) {
                setData(res.data);
                setLastRefreshed(res.lastRefreshed);
                setIsRateLimited(!!res.isRateLimited);

                if (res.isRateLimited) {
                    toast.warning(res.message || "LinkedIn rate limit reached. Showing cached data.");
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

    const formatNumber = (num) => {
        if (!num) return 0;
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
    };

    const metrics = [
        {
            label: "Impressions",
            value: data?.summary?.views || data?.views || 0,
            icon: Eye,
            desc: "Total views"
        },
        {
            label: "Reactions",
            value: data?.summary?.likes || data?.likes || 0,
            icon: Heart,
            desc: "Total likes"
        },
        {
            label: "Comments",
            value: data?.summary?.comments || data?.comments || 0,
            icon: MessageCircle,
            desc: "Total comments"
        },
        {
            label: "Reposts",
            value: data?.summary?.shares || data?.shares || 0,
            icon: Repeat2,
            desc: "Total shares"
        },
        {
            label: "Engagement Rate",
            value: data?.summary?.engagementRate || "2.4%",
            icon: TrendingUp,
            desc: "Interaction percentage"
        },
        {
            label: "Avg. Daily Reach",
            value: formatNumber((data?.summary?.views || 0) / 7),
            icon: Globe,
            desc: "Estimated daily reach"
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] md:w-[85vw] md:max-w-[1200px] h-[90vh] p-0 overflow-hidden rounded-[24px] border-none shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between bg-white relative z-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0077b5] rounded-lg shadow-lg rotate-3">
                            <LinkedinLogo className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <DialogTitle className="text-xl font-black text-gray-900 leading-none">Post Analytics</DialogTitle>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Professional Performance v1.0</span>
                        </div>
                        {isRateLimited && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 gap-1 px-2 py-0.5 h-auto ml-2">
                                <Info className="h-3 w-3" />
                                Cached
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {lastRefreshed && (
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[10px] uppercase font-black text-gray-300 leading-tight tracking-widest">Last Synced</span>
                                <span className="text-[11px] font-bold text-gray-500">
                                    {formatDistanceToNow(new Date(lastRefreshed), { addSuffix: true })}
                                </span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-gray-100 hover:bg-gray-50"
                            onClick={() => loadAnalytics(true)}
                            disabled={loading || refreshing}
                        >
                            <RotateCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                            {refreshing ? "Updating..." : "Refresh"}
                        </Button>
                    </div>
                </div>

                <div className="flex h-[calc(90vh-73px)] overflow-hidden bg-gray-50/30">
                    {/* Left Column - Metrics */}
                    <ScrollArea className="flex-1 border-r border-gray-100 pb-10">
                        <div className="p-8 space-y-10">
                            {loading ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[...Array(6)].map((_, i) => (
                                            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                                        ))}
                                    </div>
                                    <Skeleton className="h-48 w-full rounded-3xl" />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 opacity-30">
                                            <div className="h-[1px] flex-1 bg-gray-900" />
                                            <h3 className="text-[9px] font-black text-gray-900 uppercase tracking-[0.4em] whitespace-nowrap">Core Performance</h3>
                                            <div className="h-[1px] flex-1 bg-gray-900" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {metrics.map((metric, i) => (
                                                <div
                                                    key={i}
                                                    className="group flex flex-col gap-2 p-6 bg-white border border-gray-100 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-blue-50 group-hover:text-[#0077b5] transition-colors">
                                                            <metric.icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-100 group-hover:bg-[#0077b5] group-hover:scale-150 transition-all" />
                                                    </div>
                                                    <div className="mt-2 text-center md:text-left">
                                                        <div className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">{metric.value}</div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{metric.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 opacity-30">
                                            <div className="h-[1px] flex-1 bg-gray-900" />
                                            <h3 className="text-[9px] font-black text-gray-900 uppercase tracking-[0.4em] whitespace-nowrap">Distribution Detail</h3>
                                            <div className="h-[1px] flex-1 bg-gray-900" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="p-6 bg-white rounded-[2rem] border border-gray-100 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-2 bg-blue-50 rounded-lg"><Calendar className="h-4 w-4 text-[#0077b5]" /></div>
                                                        <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Publication Date</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-400">
                                                        {post?.createdAt || post?.publishedAt ? format(new Date(post.publishedAt || post.createdAt), "MMM dd, yyyy · HH:mm") : "N/A"}
                                                    </span>
                                                </div>
                                                <Separator className="bg-gray-50" />
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-2 bg-gray-50 rounded-lg"><Info className="h-4 w-4 text-gray-400" /></div>
                                                        <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Source Message</span>
                                                    </div>
                                                    <div className="text-[13px] leading-relaxed text-gray-600 bg-gray-50/50 p-5 rounded-2xl border border-gray-100 max-h-[200px] overflow-y-auto font-medium shadow-inner italic">
                                                        {post?.text || post?.message || post?.caption || "No content provided"}
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
                    <div className="w-[480px] bg-white border-l border-gray-100 flex items-center justify-center p-10 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent pointer-events-none" />

                        {loading ? (
                            <Skeleton className="w-full max-w-[340px] aspect-[3/4] rounded-[32px]" />
                        ) : (
                            <div className="relative z-10 w-full max-w-[360px] transform hover:scale-[1.02] transition-transform duration-500">
                                <div className="absolute -inset-4 bg-blue-600/5 blur-[40px] rounded-full pointer-events-none" />
                                <LinkedinPreview
                                    content={{
                                        message: post?.text || post?.message || post?.caption || "",
                                        media: post?.mediaUrls || (post?.imageUrl ? [{ url: post.imageUrl, type: 'image' }] : []) || (post?.videoUrl ? [{ url: post.videoUrl, type: 'video' }] : []) || []
                                    }}
                                    page={{
                                        displayName: post?.displayName || "Member",
                                        profilePicture: post?.profilePicture,
                                        headline: post?.headline || "LinkedIn Professional"
                                    }}
                                    compact={true}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
