"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Search, TrendingUp, Heart, MessageCircle, Eye, ChevronRight, X, Filter,
    Layers, ImageIcon, Film, Play, Edit, MoreVertical, Send, Trash2, History, Loader2, BarChart3,
    Check, Repeat2, ThumbsUp, Globe, FileText, Link2, LayoutGrid
} from "lucide-react";
import { getLinkedinPosts, getLinkedinPostsStats, publishLinkedinPostNow, deleteLinkedinPost, fetchLinkedinAccounts } from "@/app/actions/social/linkedin/linkedinPostsActions";
import { LinkedinLogo } from "@/components/icons/LinkedinLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LinkedinAnalyticsModal from "./LinkedinAnalyticsModal";
import LinkedinPreview from "./LinkedinPreview";

export default function LinkedinViewComponent({
    accountId: initialAccountId,
    initialStatus = "all",
    refreshTrigger = 0,
    onEdit = null,
    onRefresh = null
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
        dateFrom: null,
        dateTo: null,
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
            if (initialAccountId && initialAccountId !== "all") return;
            const result = await fetchLinkedinAccounts();
            if (result.success) setAccounts(result.accounts || []);
        };
        loadAccounts();
    }, [initialAccountId]);

    const loadStats = useCallback(async () => {
        try {
            const result = await getLinkedinPostsStats({ accountId: filters.accountId });
            if (result.success) setStats(result.stats);
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }, [filters.accountId]);

    useEffect(() => {
        loadStats();
    }, [loadStats, refreshTrigger]);

    const loadPosts = useCallback(async (reset = false, lastId = null) => {
        try {
            setLoading(true);
            const result = await getLinkedinPosts({
                pageSize: pagination.pageSize,
                lastDocId: reset ? null : lastId,
                filters: {
                    status: filters.status,
                    accountId: filters.accountId,
                    postType: filters.postType,
                    searchQuery: filters.searchQuery,
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo
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
            accountId: initialAccountId || "all",
            searchQuery: "",
            dateFrom: null,
            dateTo: null,
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
            displayName: account?.displayName || post.displayName || "LinkedIn Member",
            profilePicture: account?.profilePicture || post.profilePicture,
            headline: account?.headline || post.headline || "Professional"
        };
        setSelectedPostForAnalytics(enrichedPost);
        setAnalyticsModalOpen(true);
    };

    const handleEdit = (post, action = 'edit') => {
        if (onEdit) onEdit(post, action);
    };

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            const result = await publishLinkedinPostNow(post.id);
            if (result.success) {
                toast.success("Post published successfully!");
                if (onRefresh) onRefresh();
                else loadPosts(true);
            } else {
                toast.error(result.message || "Failed to publish post");
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
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="aspect-video w-full" />
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <Card className="bg-gradient-to-r from-blue-50/50 via-white to-gray-50/50 border border-blue-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0077b5] text-white shadow-lg rotate-2">
                                <LinkedinLogo className="h-6 w-6 stroke-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">
                                    LinkedIn Reach
                                </CardTitle>
                                <CardDescription className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                    Track your professional engagement & growth
                                </CardDescription>
                            </div>
                        </div>
                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <Layers className="h-4 w-4 text-[#0077b5]" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-black text-gray-900 tracking-tight">{stats.totalPosts || 0}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Posts</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <ThumbsUp className="h-4 w-4 text-[#0077b5]" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-black text-gray-900 tracking-tight">{formatNumber(stats.totalLikes || 0)}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reactions</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <MessageCircle className="h-4 w-4 text-[#0077b5]" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-black text-gray-900 tracking-tight">{formatNumber(stats.totalComments || 0)}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Comments</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <TrendingUp className="h-4 w-4 text-[#0077b5]" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-black text-gray-900 tracking-tight">{stats.avgEngagement || 0}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg. Eng.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Advanced Filters */}
            <Card className="rounded-3xl border-gray-100 overflow-hidden shadow-sm">
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex-1 w-full">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-[#0077b5] transition-colors" />
                                    <Input
                                        placeholder="Search professional updates..."
                                        value={filters.searchQuery}
                                        onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                                        className="pl-9 w-full lg:w-96 rounded-xl border-gray-100 focus:border-[#0077b5] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500">
                                    <X className="h-4 w-4" /> Reset
                                </Button>
                            </div>
                        </div>



                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                            <div className="flex-1 flex flex-wrap gap-3">
                                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                                    <SelectTrigger className="w-full lg:w-[150px] rounded-xl border-gray-100"><SelectValue placeholder="Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="posted">Published</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filters.accountId} onValueChange={(value) => handleFilterChange("accountId", value)}>
                                    <SelectTrigger className="w-full lg:w-[200px] rounded-xl border-gray-100"><SelectValue placeholder="LinkedIn Account" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Accounts</SelectItem>
                                        {accounts.map((account) => (
                                            <SelectItem key={account.accountId} value={account.accountId}>
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate">{account.displayName}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Active Filters */}
                        {(filters.status !== "all" || filters.postType !== "all" || filters.accountId !== "all" || filters.searchQuery) && (
                            <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active:</span>
                                {filters.status !== "all" && <Badge variant="secondary" className="gap-1 bg-white border-blue-100 text-[#0077b5] font-bold text-[10px] uppercase tracking-wider rounded-lg px-2 py-1">Status: {filters.status === 'posted' ? 'Published' : filters.status} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("status", "all")} /></Badge>}
                                {filters.accountId !== "all" && <Badge variant="secondary" className="gap-1 bg-white border-blue-100 text-[#0077b5] font-bold text-[10px] uppercase tracking-wider rounded-lg px-2 py-1">Account: {accounts.find(p => p.accountId === filters.accountId)?.displayName || filters.accountId} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("accountId", "all")} /></Badge>}
                                {filters.searchQuery && <Badge variant="secondary" className="gap-1 bg-white border-blue-100 text-[#0077b5] font-bold text-[10px] uppercase tracking-wider rounded-lg px-2 py-1">"{filters.searchQuery}" <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("searchQuery", "")} /></Badge>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            {
                posts.length === 0 && !loading ? (
                    <Card className="border-dashed border-2 border-gray-200 bg-gray-50/30 rounded-3xl">
                        <CardContent className="p-16 text-center">
                            <div className="w-20 h-20 bg-white shadow-lg rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                <LinkedinLogo className="h-10 w-10 text-[#0077b5]" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">{filters.searchQuery ? "No matching updates" : "No professional updates"}</h3>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-8">{filters.searchQuery ? "Try a different search term" : "Your network is quiet. Post something!"}</p>
                            <Button onClick={clearFilters} variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border-gray-200">Reset Dashboard</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => {
                            const message = post.text || post.message || post.caption || "";
                            const media = post.mediaUrls || (post.imageUrl ? [{ url: post.imageUrl, type: 'image' }] : []) || (post.videoUrl ? [{ url: post.videoUrl, type: 'video' }] : []) || [];
                            const account = accounts.find(a => a.accountId === post.accountId);

                            return (
                                <div key={post.id} className={cn("relative group transition-all duration-300 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md", publishingId === post.id && "opacity-70 pointer-events-none")}>
                                    {/* Status Badge Overlay */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <Badge className={cn("text-[10px] font-black uppercase tracking-wider shadow-sm", post.status === 'posted' || post.status === 'published' ? "bg-white/90 text-green-700 hover:bg-white" : "bg-white/90 text-blue-700 hover:bg-white")}>
                                            {post.status === 'posted' ? 'Published' : post.status || 'Draft'}
                                        </Badge>
                                    </div>

                                    <LinkedinPreview
                                        content={{
                                            message: message,
                                            media: media
                                        }}
                                        page={account || { displayName: post.displayName || "Member" }}
                                        compact={true}
                                        noBorder={true}
                                        customActions={
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 rounded-full hover:bg-gray-100"><MoreVertical className="h-5 w-5" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-xl p-1.5 border border-gray-100">
                                                    {post.status === 'posted' || post.status === 'published' ? (
                                                        <>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenAnalytics(post); }} className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-blue-50 focus:bg-blue-50 text-gray-700 focus:text-blue-700 font-medium transition-colors">
                                                                <BarChart3 className="h-4 w-4" />
                                                                <span>View Performance</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(post); }} className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-gray-50 focus:bg-gray-50 font-medium transition-colors">
                                                                <Eye className="h-4 w-4" />
                                                                <span>View Post</span>
                                                            </DropdownMenuItem>
                                                            {post.permalink && (
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(post.permalink, '_blank'); }} className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-gray-50 focus:bg-gray-50 font-medium transition-colors">
                                                                    <Globe className="h-4 w-4" />
                                                                    <span>View Native</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(post); }} className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-gray-50 focus:bg-gray-50 font-medium transition-colors">
                                                                <Edit className="h-4 w-4" />
                                                                <span>Edit Post</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-blue-50 focus:bg-blue-50 text-blue-600 focus:text-blue-700 font-medium transition-colors">
                                                                <Send className="h-4 w-4" />
                                                                <span>Publish Now</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(post, 'delete'); }} className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-700 font-medium transition-colors">
                                                                <Trash2 className="h-4 w-4" />
                                                                <span>Delete</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        }
                                    />

                                    {publishingId === post.id && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-[#0077b5]" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0077b5]">Publishing...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            }

            {
                pagination.hasMore && (pagination.lastPostId || true) && (
                    <div className="flex justify-center pt-10">
                        <Button onClick={handleLoadMore} disabled={loading} variant="ghost" className="group rounded-full py-6 px-10 transition-all hover:bg-[#0077b5] hover:text-white">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[11px] font-black uppercase tracking-[0.3em]">{loading ? "Connecting..." : "Load Older updates"}</span>
                                <History className={cn("h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity", loading && "animate-spin")} />
                            </div>
                        </Button>
                    </div>
                )
            }

            {/* Analytics Modal */}
            <LinkedinAnalyticsModal
                open={analyticsModalOpen}
                onOpenChange={setAnalyticsModalOpen}
                post={selectedPostForAnalytics}
            />
        </div >
    );
}
