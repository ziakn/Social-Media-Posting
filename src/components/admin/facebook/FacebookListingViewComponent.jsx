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
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Search, TrendingUp, Heart, MessageCircle, Eye, ChevronRight, X, Filter,
    Layers, ImageIcon, Film, Play, Edit, MoreVertical, Send, Trash2, History, Loader2, BarChart3, Share2, Facebook, Globe, ThumbsUp
} from "lucide-react";
import { getFacebookPosts, getUserFacebookPages, publishFacebookPostNow } from "@/app/actions/social/facebook/facebookPostsActions";

export default function ListingViewComponent({
    pageId: initialPageId,
    initialStatus = "all",
    refreshTrigger = 0,
    onEdit = null
}) {
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState([]);
    const [publishingId, setPublishingId] = useState(null);

    const [filters, setFilters] = useState({
        status: initialStatus,
        postType: "all",
        pageId: initialPageId || "all",
        searchQuery: "",
        dateFrom: null,
        dateTo: null,
        sortBy: "newest",
        sortOrder: "desc"
    });

    const [pagination, setPagination] = useState({
        pageSize: 15,
        hasMore: false,
        lastVisible: null
    });

    useEffect(() => {
        const loadPages = async () => {
            const result = await getUserFacebookPages();
            if (result.success) setPages(result.pages);
        };
        loadPages();
    }, []);

    const loadPosts = useCallback(async (reset = false, lastId = null) => {
        try {
            setLoading(true);
            const result = await getFacebookPosts({
                pageSize: pagination.pageSize,
                lastDocId: reset ? null : lastId,
                filters: {
                    status: filters.status,
                    postType: filters.postType,
                    pageId: filters.pageId,
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
            pageId: initialPageId || "all",
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
            const result = await publishFacebookPostNow(post.id);
            if (result.success) {
                toast.success("Post published successfully!");
                loadPosts(true);
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
            return format(new Date(date), "MMM dd, yyyy • HH:mm");
        } catch {
            return "N/A";
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Filter className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{stats.totalPosts || 0}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Facebook Posts</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Heart className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{formatNumber(stats.totalEngagements || 0)}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Engagements</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <MessageCircle className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{formatNumber(stats.totalComments || 0)}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Comments</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-cyan-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{stats.avgEngagementRate || 0}%</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Engagement Rate</div>
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
                                placeholder="Search by caption..."
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
                            <Select value={filters.pageId} onValueChange={(v) => handleFilterChange("pageId", v)}>
                                <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Page" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Pages</SelectItem>
                                    {pages.map((p) => (
                                        <SelectItem key={p.pageId} value={p.pageId}>{p.pageName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-blue-600 rounded-lg">
                                <X className="h-4 w-4 mr-1" /> Reset
                            </Button>
                        </div>
                    </div>
                    {/* Active Filters */}
                    {(filters.status !== "all" || filters.pageId !== "all" || filters.searchQuery) && (
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Active:</span>
                            {filters.status !== "all" && <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 text-[10px] font-bold py-0">{filters.status}</Badge>}
                            {filters.pageId !== "all" && <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 text-[10px] font-bold py-0">{pages.find(p => p.pageId === filters.pageId)?.pageName || filters.pageId}</Badge>}
                            {filters.searchQuery && <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 text-[10px] font-bold py-0">"{filters.searchQuery}"</Badge>}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Table View */}
            <Card className="border-none shadow-none bg-transparent">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent border-gray-100">
                                <TableHead className="w-[100px] font-bold">Media</TableHead>
                                <TableHead className="font-bold">Caption & Page</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold">Metrics</TableHead>
                                <TableHead className="font-bold">Date</TableHead>
                                <TableHead className="w-[100px] text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && posts.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-12 w-12 rounded-lg" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : posts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Facebook className="h-10 w-10 text-blue-100" />
                                            <p className="text-sm font-bold text-gray-400">No posts matched your filters</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                posts.map((post) => (
                                    <TableRow key={post.id} className="group hover:bg-blue-50/30 transition-colors border-gray-50">
                                        <TableCell>
                                            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200 shadow-sm group-hover:scale-105 transition-transform">
                                                {post.mediaUrls?.[0]?.url ? (
                                                    post.postType === 'video' ? (
                                                        <div className="w-full h-full bg-black flex items-center justify-center text-white"><Play className="h-4 w-4" /></div>
                                                    ) : (
                                                        <img src={post.mediaUrls[0].url} className="w-full h-full object-cover" alt="" />
                                                    )
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200"><Facebook className="h-6 w-6" /></div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-900 truncate max-w-md">{post.message || post.caption || "No caption provided"}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 border-blue-100 rounded-md py-0 px-1.5">{post.pageName || "N/A"}</Badge>
                                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium"><Globe className="h-2.5 w-2.5" /> {post.postType || "text"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter", post.status === 'published' ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200")}>
                                                {post.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4 text-xs font-bold text-gray-700">
                                                <div className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5 text-blue-500" /> {formatNumber(post.metrics?.likes)}</div>
                                                <div className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5 text-blue-500" /> {formatNumber(post.metrics?.comments)}</div>
                                                <div className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5 text-blue-500" /> {formatNumber(post.metrics?.shares)}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {post.status === 'scheduled' ? (post.scheduledAt ? format(new Date(post.scheduledAt), "MMM dd, yyyy") : "N/A") :
                                                        (post.createdAt ? format(new Date(post.createdAt), "MMM dd, yyyy") : "N/A")}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-400">
                                                    {post.status === 'scheduled' ? (post.scheduledAt ? format(new Date(post.scheduledAt), "h:mm a") : "") :
                                                        (post.createdAt ? format(new Date(post.createdAt), "h:mm a") : "")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-100 text-gray-400 hover:text-blue-600"><MoreVertical className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-gray-100">
                                                    {post.status === 'published' ? (
                                                        <>
                                                            <DropdownMenuItem onClick={() => onEditClick(post)} className="gap-2.5 text-xs font-black rounded-lg">
                                                                <Eye className="h-4 w-4" /> View Post
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => onEditClick(post, 'analytics')} className="gap-2.5 text-xs font-black text-blue-600 rounded-lg">
                                                                <BarChart3 className="h-4 w-4" /> View Analytics
                                                            </DropdownMenuItem>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DropdownMenuItem onClick={() => onEditClick(post)} className="gap-2.5 text-xs font-black rounded-lg">
                                                                <Edit className="h-4 w-4" /> Edit Post
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="gap-2.5 text-xs font-black text-blue-600 rounded-lg">
                                                                <Send className="h-4 w-4" /> Publish Now
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => onEditClick(post, 'delete')} className="gap-2.5 text-xs font-black text-red-600 rounded-lg">
                                                                <Trash2 className="h-4 w-4" /> Delete Post
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {pagination.hasMore && (
                <div className="flex justify-center pt-8">
                    <Button onClick={handleLoadMore} disabled={loading} variant="outline" className="w-full sm:w-auto min-w-[200px]">
                        {loading ? "Loading..." : "Load More Posts"}
                    </Button>
                </div>
            )}
        </div>
    );
}
