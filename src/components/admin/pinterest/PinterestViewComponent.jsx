"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Search, TrendingUp, Heart, Eye, ChevronRight, X, Filter,
    Layers, ImageIcon, Play, Edit, MoreVertical, MoreHorizontal, Send, Trash2, History, Loader2, BarChart3,
    Pin, MousePointer2, Calendar
} from "lucide-react";
import { getPinterestPosts, getPinterestPostsStats, publishPinterestPostNow, deletePinterestPost } from "@/app/actions/social/pinterest/pinterestPostsActions";
import { getPinterestAccounts } from "@/app/actions/social/pinterest/getAccounts";
import PinterestLogo from "@/components/icons/PinterestLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PinterestAnalyticsModal from "./PinterestAnalyticsModal";
import CreatePinterestPost from "./CreatePinterestPost";
import PinterestPreview from "./PinterestPreview";

export default function PinterestViewComponent({
    accountId: initialAccountId,
    initialStatus = "all",
    onEdit = null,
    onRefresh = null,
    refreshTrigger = 0
}) {

    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [publishingId, setPublishingId] = useState(null);

    const [filters, setFilters] = useState({
        status: initialStatus,
        postType: "all",
        accountId: initialAccountId || "all",
        searchQuery: "",
        sortBy: "date",
        sortOrder: "desc"
    });

    const [pagination, setPagination] = useState({
        pageSize: 12,
        hasMore: false,
        lastPostId: null
    });

    // Analytics Modal State
    const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
    const [selectedPostForAnalytics, setSelectedPostForAnalytics] = useState(null);

    useEffect(() => {
        const loadAccounts = async () => {
            const result = await getPinterestAccounts();
            if (result.success) setAccounts(result.accounts || []);
        };
        loadAccounts();
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const result = await getPinterestPostsStats({ accountId: filters.accountId });
            if (result.success) setStats(result.stats);
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }, [filters.accountId]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const loadPosts = useCallback(async (reset = false, lastId = null) => {
        try {
            setLoading(true);
            const result = await getPinterestPosts({
                pageSize: pagination.pageSize,
                lastDocId: reset ? null : lastId,
                filters: {
                    status: filters.status,
                    accountId: filters.accountId,
                    postType: filters.postType,
                    searchQuery: filters.searchQuery,
                },
                sortBy: filters.sortBy === 'date' ? 'createdAt' : filters.sortBy,
                sortOrder: filters.sortOrder
            });

            if (result.success) {
                if (reset) setPosts(result.posts);
                else setPosts(prev => [...prev, ...result.posts]);

                setPagination(prev => ({
                    ...prev,
                    hasMore: result.hasMore,
                    lastPostId: result.lastPostId
                }));
            } else {
                toast.error(result.message || "Failed to load posts");
            }
        } catch (err) {
            toast.error("An error occurred while loading posts");
            console.error("Error loading posts:", err);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.pageSize]);

    useEffect(() => {
        loadPosts(true);
    }, [loadPosts, refreshTrigger]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: "all",
            postType: "all",
            accountId: "all",
            searchQuery: "",
            sortBy: "date",
            sortOrder: "desc"
        });
    };

    const handleLoadMore = () => {
        if (pagination.hasMore && pagination.lastPostId) {
            loadPosts(false, pagination.lastPostId);
        }
    };

    const handleOpenAnalytics = (post) => {
        const account = accounts.find(a => a.accountId === post.accountId);
        const enrichedPost = {
            ...post,
            username: account?.username || post.username || "Pinterest User",
            profilePicture: account?.profilePicture || post.profilePicture
        };
        setSelectedPostForAnalytics(enrichedPost);
        setAnalyticsModalOpen(true);
    };

    const handleEditClick = (post, action = 'edit') => {
        if (onEdit) onEdit(post, action);
    };

    const handleDelete = async (post) => {
        if (confirm("Are you sure you want to delete this pin?")) {
            const res = await deletePinterestPost(post.id);
            if (res.success) {
                toast.success("Pin deleted");
                loadPosts(true);
            } else {
                toast.error(res.message);
            }
        }
    };

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            const result = await publishPinterestPostNow(post.id);
            if (result.success) {
                toast.success("Pin published successfully!");
                loadPosts(true);
            } else {
                toast.error(result.message || "Failed to publish pin");
            }
        } catch (error) {
            toast.error("An error occurred while publishing");
        } finally {
            setPublishingId(null);
        }
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        try {
            return format(new Date(date), "MMM dd, yyyy");
        } catch {
            return "N/A";
        }
    };


    if (loading && posts.length === 0) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-[2/3] w-full rounded-[32px]" />
                            <div className="px-2 space-y-2">
                                <Skeleton className="h-4 w-3/4 rounded-full" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-5 rounded-full" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                    <Skeleton className="h-3 w-10" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                                <Layers className="h-5 w-5 text-zinc-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{stats.totalPosts || 0}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Pins</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                                <Pin className="h-5 w-5 text-[#E60023]" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{formatNumber(stats.totalLikes || 0)}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Saves</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <MousePointer2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{formatNumber(stats.totalReplies || 0)}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Clicks</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{stats.avgEngagement || 0}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg. Engagement</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Filters */}
            <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm">
                <div className="p-6">
                    <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex-1 w-full flex flex-col lg:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search pins..."
                                        value={filters.searchQuery}
                                        onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                                        className="pl-9 w-full"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                                        <SelectTrigger className="w-full lg:w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={filters.accountId} onValueChange={(value) => handleFilterChange("accountId", value)}>
                                        <SelectTrigger className="w-full lg:w-[200px]"><SelectValue placeholder="Pinterest Account" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Accounts</SelectItem>
                                            {accounts.map((account) => (
                                                <SelectItem key={account.accountId} value={account.accountId}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate">{account.username}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button className="gap-2 bg-[#E60023] hover:bg-[#ad001b] text-white" onClick={() => onEdit && onEdit(null)}>
                                    <Pin className="h-4 w-4" /> Create Pin
                                </Button>
                            </div>
                        </div>
                        {/* Active Filters */}
                        {(filters.status !== "all" || filters.accountId !== "all" || filters.searchQuery) && (
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {filters.status !== "all" && <Badge variant="secondary" className="gap-1 capitalize">Status: {filters.status} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("status", "all")} /></Badge>}
                                {filters.accountId !== "all" && <Badge variant="secondary" className="gap-1">Account: {accounts.find(p => p.accountId === filters.accountId)?.username || filters.accountId} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("accountId", "all")} /></Badge>}
                                {filters.searchQuery && <Badge variant="secondary" className="gap-1">Search: {filters.searchQuery} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("searchQuery", "")} /></Badge>}
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto h-6 text-xs hover:bg-transparent text-gray-400 hover:text-gray-900">Clear All</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            {posts.length === 0 && !loading ? (
                <div className="border border-dashed border-gray-200 rounded-[32px] bg-white hover:bg-gray-50/50 transition-colors duration-300">
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Pin className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{filters.searchQuery ? "No matching pins found" : "No pins available"}</h3>
                        <p className="text-muted-foreground mb-6">{filters.searchQuery ? "Try adjusting your search or filters" : "Start by creating a pin"}</p>
                        <Button onClick={clearFilters} variant="outline" className="rounded-xl font-bold border-gray-200">Clear All Filters</Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {posts.map((post) => {
                        const media = post.content?.media || (post.imageUrl ? [{ url: post.imageUrl, type: "image" }] : []) || [];
                        const hasMedia = media.length > 0;
                        const message = post.message || post.description || post.title || "";
                        const name = accounts.find(a => a.accountId === post.accountId)?.username || post.username || "Pinterest User";
                        const isScheduled = post.status === 'scheduled';
                        const mediaUrl = post.content?.media?.[0]?.url || post.imageUrl;

                        return (
                            <Card key={post.id} className={cn("group relative flex flex-col transition-all duration-300 cursor-pointer rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md bg-white", publishingId === post.id && "opacity-70 pointer-events-none")} onClick={() => handleEditClick(post)}>
                                <div className="relative aspect-[2/3] rounded-[32px] overflow-hidden bg-neutral-100 group/media shadow-sm hover:shadow-xl transition-shadow duration-300">
                                    <div className="group/media relative w-full aspect-[2/3] rounded-[32px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                                        {mediaUrl ? (
                                            <img
                                                src={mediaUrl}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-gray-400">No Media</div>
                                        )}

                                        {/* Top Right Three Dots Overlay */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <div onClick={(e) => e.stopPropagation()} className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-lg border border-gray-100 opacity-60 group-hover/media:opacity-100 transition-all duration-300 z-10 scale-90 group-hover/media:scale-110 active:scale-95 cursor-pointer">
                                                    <MoreHorizontal className="h-5 w-5 text-gray-900" />
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[200px] rounded-[32px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-2.5">
                                                {post.status === 'published' ? (
                                                    <>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenAnalytics(post); }} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-gray-50 transition-colors group">
                                                            <BarChart3 className="h-5 w-5 text-gray-900" />
                                                            <span className="font-bold text-[13px] text-gray-900">View Analytics</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditClick(post, 'view'); }} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-gray-50 transition-colors group">
                                                            <Eye className="h-5 w-5 text-gray-900" />
                                                            <span className="font-bold text-[13px] text-gray-900">Pin Details</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditClick(post, 'edit'); }} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-gray-50 transition-colors group">
                                                            <Edit className="h-5 w-5 text-gray-900" />
                                                            <span className="font-bold text-[13px] text-gray-900">Edit Pin</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-purple-50 transition-colors group">
                                                            <Send className="h-5 w-5 text-purple-600" />
                                                            <span className="font-bold text-[13px] text-purple-600">Publish Now</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditClick(post, 'delete'); }} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-red-50 transition-colors group">
                                                            <Trash2 className="h-5 w-5 text-red-600" />
                                                            <span className="font-bold text-[13px] text-red-600">Delete Pin</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        {isScheduled && (
                                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="uppercase tracking-widest">{formatDate(post.scheduledAt)}</span>
                                            </div>
                                        )}

                                        {publishingId === post.id && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-[60]">
                                                <Loader2 className="h-8 w-8 animate-spin text-[#E60023]" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-3 px-2 space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-black text-[13px] truncate text-gray-900 tracking-tight flex-1" title={post.title}>
                                            {post.title || "No Title"}
                                        </h4>
                                        <Badge className={cn(
                                            "rounded-full px-2 py-0 text-[8px] font-black uppercase tracking-wider shrink-0",
                                            post.status === 'published' ? "bg-green-50 text-green-700 border-green-100" : "bg-purple-50 text-purple-700 border-purple-100"
                                        )}>
                                            {post.status === 'published' ? "Published" : "Scheduled"}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                            <Layers className="w-3 h-3" />
                                            <span className="truncate">
                                                {(() => {
                                                    const account = accounts.find(a => a.accountId === post.accountId);
                                                    return account?.boards?.find(b => b.id === post.boardId)?.name || "Default Board";
                                                })()}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6 border border-gray-100 shadow-sm">
                                                    <AvatarImage src={post.profilePicture} />
                                                    <AvatarFallback className="text-[10px] font-black">{name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-[11px] font-bold text-gray-700 max-w-[100px] truncate">{name}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold">{formatNumber(post.metrics?.impressions || post.metrics?.views)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <Pin className="w-3.5 h-3.5 text-red-500/30" />
                                                    <span className="text-[10px] font-bold">{formatNumber(post.metrics?.saves)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )
            }

            {
                pagination.hasMore && (
                    <div className="flex justify-center pt-6">
                        <Button onClick={handleLoadMore} disabled={loading} variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
                            {loading ? "Loading..." : "Load More Activity"}
                            {!loading && <History className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                )
            }

            {/* Analytics Modal */}
            <PinterestAnalyticsModal
                open={analyticsModalOpen}
                onOpenChange={setAnalyticsModalOpen}
                post={selectedPostForAnalytics}
            />
        </div >
    );
}
