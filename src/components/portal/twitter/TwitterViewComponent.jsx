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
    Search, TrendingUp, Heart, MessageCircle, Eye, ChevronRight, X,
    Layers, ImageIcon, Film, Play, Edit, MoreVertical, Send, Trash2, History, Loader2, BarChart3, Share2, Repeat2, Globe
} from "lucide-react";
import { XLogo } from "@/components/icons/XLogo";
import XPostCard from "./XPostCard";
import { getTwitterPosts, getUserTwitterAccounts, publishTwitterPostNow } from "@/app/actions/social/twitter/twitterPostsActions";

export default function TwitterViewComponent({
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
        sortBy: "newest",
        sortOrder: "desc"
    });

    const [pagination, setPagination] = useState({
        pageSize: 12,
        hasMore: false,
        lastVisible: null
    });

    useEffect(() => {
        const loadAccounts = async () => {
            const result = await getUserTwitterAccounts();
            if (result.success) setAccounts(result.accounts || []);
        };
        loadAccounts();
    }, []);

    const loadPosts = useCallback(async (reset = false, lastId = null) => {
        try {
            setLoading(true);
            const result = await getTwitterPosts({
                pageSize: pagination.pageSize,
                lastDocId: reset ? null : lastId,
                filters: {
                    status: filters.status,
                    postType: filters.postType,
                    accountId: filters.accountId,
                    searchQuery: filters.searchQuery
                },
                sortBy: filters.sortBy
            });

            if (result.success) {
                if (reset) setPosts(result.posts);
                else setPosts(prev => [...prev, ...result.posts]);

                setStats(result.statistics);
                setPagination(prev => ({
                    ...prev,
                    hasMore: result.pagination?.hasMore || false,
                    lastVisible: result.pagination?.lastVisible || null
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
            sortBy: "newest",
            sortOrder: "desc"
        });
    };

    const handleLoadMore = () => {
        if (pagination.hasMore && pagination.lastVisible) {
            loadPosts(false, pagination.lastVisible);
        }
    };

    const onEditClick = (post, action = 'edit') => {
        if (onEdit) onEdit(post, action);
    };

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            const result = await publishTwitterPostNow(post.id);
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

    const getAccountName = (id) => {
        const found = accounts.find(a => a.id === id || a.accountId === id);
        return found ? (found.username ? `@${found.username}` : "X Account") : "X Account";
    };

    const getAccountImage = (id) => {
        const found = accounts.find(a => a.id === id || a.accountId === id);
        return found ? found.profilePicture : null;
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <Card className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    X Performance
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600 pl-13">
                                Analyze your post reach and engagement
                            </CardDescription>
                        </div>
                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Layers className="h-4 w-4 text-black" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-gray-900">{stats.totalPosts || 0}</div>
                                            <div className="text-xs text-gray-500">Total Posts</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Add more stats cards as desired, matched Facebook structure */}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Advanced Filters */}
            <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex-1 w-full">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search posts..."
                                        value={filters.searchQuery}
                                        onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                                        className="pl-9 w-full lg:w-96"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                                    <X className="h-4 w-4" /> Clear Filters
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                                <SelectTrigger className="w-[140px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.accountId} onValueChange={(value) => handleFilterChange("accountId", value)}>
                                <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Account" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map((a) => (
                                        <SelectItem key={a.id || a.accountId} value={a.accountId || a.id}>{a.username ? `@${a.username}` : "Account"}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Active Filters */}
                        {(filters.status !== "all" || filters.accountId !== "all" || filters.searchQuery) && (
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {filters.status !== "all" && <Badge variant="secondary" className="gap-1">Status: {filters.status} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("status", "all")} /></Badge>}
                                {filters.accountId !== "all" && <Badge variant="secondary" className="gap-1">Account: {accounts.find(p => (p.accountId === filters.accountId || p.id === filters.accountId))?.username || filters.accountId} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("accountId", "all")} /></Badge>}
                                {filters.searchQuery && <Badge variant="secondary" className="gap-1">Search: {filters.searchQuery} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("searchQuery", "")} /></Badge>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && posts.length === 0 ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="border border-gray-100 rounded-2xl p-5 space-y-4 bg-white">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    ))
                ) : (
                    <>
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <XPostCard
                                    key={post.id}
                                    post={post}
                                    onEditClick={onEditClick}
                                    onPublishNow={handlePublishNow}
                                    publishingId={publishingId}
                                />
                            ))
                        ) : (
                            <div className="col-span-full">
                                <Card className="border-dashed border-2 rounded-3xl mx-auto max-w-lg mt-8">
                                    <CardContent className="p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Layers className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-black mb-2">No posts found</h3>
                                        <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                                        <Button onClick={clearFilters} variant="outline" className="rounded-xl px-8">Clear All Filters</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Load More */}
            {pagination.hasMore && (
                <div className="flex justify-center pt-8 pb-8">
                    <Button onClick={handleLoadMore} disabled={loading} variant="outline" className="min-w-[200px] rounded-full border-gray-200">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {loading ? "Loading..." : "Load More Posts"}
                    </Button>
                </div>
            )}
        </div>
    );
}
