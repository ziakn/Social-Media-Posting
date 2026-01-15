"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Search, TrendingUp, Heart, MessageCircle, Eye, X, Filter,
    Layers, Play, Edit, MoreVertical, Send, Trash2, Loader2, BarChart3,
    History, ImageIcon, Film, MoreHorizontal, Pin
} from "lucide-react";
import { getPinterestPosts, getPinterestPostsStats, publishPinterestPostNow, deletePinterestPost, getPinterestAccounts } from "@/app/actions/social/pinterest/pinterestPostsActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PinterestLogo from "@/components/icons/PinterestLogo";

export default function PinterestListingViewComponent({
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

    useEffect(() => {
        const loadAccounts = async () => {
            if (initialAccountId && initialAccountId !== "all") return;
            const result = await getPinterestAccounts();
            if (result.success) setAccounts(result.accounts || []);
        };
        loadAccounts();
    }, [initialAccountId]);

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
    }, [loadStats, refreshTrigger]);

    const loadPosts = useCallback(async (reset = false, lastId = null) => {
        try {
            setLoading(true);
            const result = await getPinterestPosts({
                pageSize: pagination.pageSize,
                lastDocId: reset ? null : lastId,
                filters: {
                    status: filters.status,
                    accountId: filters.accountId,
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
                toast.error(result.message || "Failed to load pins");
            }
        } catch (err) {
            toast.error("An error occurred while loading pins");
            console.error("Error loading pins:", err);
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

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            const result = await publishPinterestPostNow(post.id);
            if (result.success) {
                toast.success("Pin published successfully!");
                if (onRefresh) onRefresh();
                else loadPosts(true);
            } else {
                toast.error(result.message || "Failed to publish pin");
            }
        } catch (error) {
            toast.error("An error occurred while publishing");
        } finally {
            setPublishingId(null);
        }
    };

    const handleDelete = async (e, post) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this pin reference?")) return;
        const result = await deletePinterestPost(post.id);
        if (result.success) {
            toast.success("Pin deleted");
            loadPosts(true);
        } else {
            toast.error(result.message);
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
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
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
                            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                                <Pin className="h-5 w-5 text-[#E60023]" />
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
                                <Heart className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{formatNumber(stats.totalLikes || 0)}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Likes</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <MessageCircle className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{formatNumber(stats.totalReplies || 0)}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Comments</div>
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
            <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="w-full lg:w-96 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by title or description..."
                                value={filters.searchQuery}
                                onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                                className="pl-9 rounded-xl border-gray-200"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
                                <SelectTrigger className="w-[130px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.accountId} onValueChange={(v) => handleFilterChange("accountId", v)}>
                                <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Account" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map((account) => (
                                        <SelectItem key={account.accountId} value={account.accountId}>
                                            {account.username}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-black rounded-lg">
                                <X className="h-4 w-4 mr-1" /> Reset
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Container */}
            <Card className="border-none shadow-none bg-transparent">
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent border-gray-100">
                                <TableHead className="w-[100px] font-bold">Image</TableHead>
                                <TableHead className="font-bold">Title & Description</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold">Metrics</TableHead>
                                <TableHead className="font-bold">Date</TableHead>
                                <TableHead className="w-[100px] text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => {
                                const title = post.title || "Untitled Pin";
                                const description = post.message || post.description || "";
                                const mediaUrl = post.content?.media?.[0]?.url || post.imageUrl;
                                const date = post.scheduledAt || post.createdAt;
                                return (
                                    <TableRow key={post.id} className={cn("group hover:bg-gray-50/50 transition-colors border-gray-50 cursor-pointer", publishingId === post.id && "opacity-70 pointer-events-none")}>
                                        <TableCell onClick={() => onEdit && onEdit(post)}>
                                            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200 shadow-sm group-hover:scale-105 transition-transform">
                                                {mediaUrl ? (
                                                    <img src={mediaUrl} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-zinc-50">
                                                        <PinterestLogo className="h-6 w-6 text-zinc-200" />
                                                    </div>
                                                )}
                                                {publishingId === post.id && (
                                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                        <Loader2 className="h-5 w-5 animate-spin text-[#E60023]" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={() => onEdit && onEdit(post)}>
                                            <div className="space-y-1.5 max-w-md">
                                                <p className="text-[14px] font-bold text-gray-900 truncate tracking-tight">{title}</p>
                                                <p className="text-[11px] text-gray-500 line-clamp-1">{description}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-0.5 rounded-full">
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={post.profilePicture} />
                                                            <AvatarFallback className="text-[6px] font-black">{post.username?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tight">@{post.username}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={() => onEdit && onEdit(post)}>
                                            <Badge className={cn("rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm", post.status === 'published' ? "bg-green-50 text-green-700 hover:bg-green-50 border-green-100" : "bg-purple-50 text-purple-700 hover:bg-purple-50 border-purple-100")}>
                                                {post.status || "published"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell onClick={() => onEdit && onEdit(post)}>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-900">
                                                        <Heart className="h-3.5 w-3.5 text-red-500 fill-red-50" /> {formatNumber(post.metrics?.likes)}
                                                    </div>
                                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter ml-5">Likes</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-900">
                                                        <MessageCircle className="h-3.5 w-3.5 text-blue-500 fill-blue-50" /> {formatNumber(post.metrics?.replies)}
                                                    </div>
                                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter ml-5">Comments</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={() => onEdit && onEdit(post)}>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {format(new Date(date), "MMM dd, yyyy")}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-400">
                                                    {format(new Date(date), "h:mm a")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black"><MoreVertical className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[200px] rounded-[32px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-2.5">
                                                    {post.status === 'published' ? (
                                                        <>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`https://www.pinterest.com/pin/${post.pinterestPinId}`, '_blank'); }} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-gray-50 transition-colors group">
                                                                <Eye className="h-5 w-5 text-gray-900" />
                                                                <span className="font-bold text-[13px] text-gray-900">View on Pinterest</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit && onEdit(post); }} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-gray-50 transition-colors group">
                                                                <Edit className="h-5 w-5 text-gray-900" />
                                                                <span className="font-bold text-[13px] text-gray-900">Edit Pin</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-red-50 transition-colors group">
                                                                <Send className="h-5 w-5 text-[#E60023]" />
                                                                <span className="font-bold text-[13px] text-[#E60023]">Publish Now</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-red-50 transition-colors group" onClick={(e) => handleDelete(e, post)}>
                                                                <Trash2 className="h-5 w-5 text-red-600" />
                                                                <span className="font-bold text-[13px] text-red-600">Delete Pin</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {pagination.hasMore && (
                <div className="flex justify-center pt-8">
                    <Button onClick={handleLoadMore} disabled={loading} variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px] h-12 rounded-full font-black text-xs uppercase tracking-widest border-gray-200">
                        {loading ? "Loading..." : "Load More Activity"}
                    </Button>
                </div>
            )}
        </div>
    );
}
