"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn, formatNumber } from "@/lib/utils";
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
    Search, TrendingUp, Heart, MessageCircle, Eye, X,
    Layers, Play, Edit, MoreVertical, Send, Trash2, Loader2, BarChart3, Repeat2, Twitter, Globe
} from "lucide-react";
import { XLogo } from "@/components/icons/XLogo";
import {
    getTwitterPosts,
    getUserTwitterAccounts,
    publishTwitterPostNow
} from "@/app/actions/social/twitter/twitterPostsActions";

export default function TwitterListingViewComponent({
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
            toast.error("An error occurred while loading tweets");
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



    if (loading && posts.length === 0) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                    ))}
                </div>
                <Card className="border-gray-100 shadow-sm">
                    <CardContent className="p-0">
                        <div className="space-y-4 p-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Stats Row */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
                                <Layers className="h-5 w-5 text-black" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{stats.totalPosts || 0}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Posts</div>
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
                            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <Repeat2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{formatNumber(stats.totalRetweets || 0)}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Retweets</div>
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
                                placeholder="Search posts..."
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
                                    <SelectItem value="posted">Published</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.accountId} onValueChange={(v) => handleFilterChange("accountId", v)}>
                                <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Account" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map((a) => (
                                        <SelectItem key={a.id} value={a.accountId}>{a.username}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-black rounded-lg">
                                <X className="h-4 w-4 mr-1" /> Reset
                            </Button>
                        </div>
                    </div>
                    {/* Active Filters */}
                    {(filters.status !== "all" || filters.accountId !== "all" || filters.searchQuery) && (
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Active:</span>
                            {filters.status !== "all" && <Badge variant="secondary" className="bg-black text-black hover:bg-gray-100 border-sky-100 text-[10px] font-bold py-0">{filters.status}</Badge>}
                            {filters.accountId !== "all" && <Badge variant="secondary" className="bg-black text-black hover:bg-gray-100 border-sky-100 text-[10px] font-bold py-0">{accounts.find(a => a.accountId === filters.accountId)?.username || filters.accountId}</Badge>}
                            {filters.searchQuery && <Badge variant="secondary" className="bg-black text-black hover:bg-gray-100 border-sky-100 text-[10px] font-bold py-0">"{filters.searchQuery}"</Badge>}
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
                                <TableHead className="font-bold">Content & Account</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold">Metrics</TableHead>
                                <TableHead className="font-bold">Date</TableHead>
                                <TableHead className="w-[100px] text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Empty strings/nulls are handled in rendering logic below */}
                            {posts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <XLogo className="h-10 w-10 text-blue-100" />
                                            <p className="text-sm font-bold text-gray-400">No posts match your filters</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                posts.map((post) => (
                                    <TableRow key={post.id} className={cn("group hover:bg-black/30 transition-colors border-gray-50", publishingId === post.id && "opacity-70 pointer-events-none")}>
                                        <TableCell>
                                            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200 shadow-sm group-hover:scale-105 transition-transform">
                                                {post.mediaUrls?.[0]?.url ? (
                                                    post.postType === 'video' ? (
                                                        <div className="w-full h-full bg-black flex items-center justify-center text-white"><Play className="h-4 w-4" /></div>
                                                    ) : (
                                                        <img src={post.mediaUrls[0].url} className="w-full h-full object-cover" alt="" />
                                                    )
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-black text-gray-400"><XLogo className="h-6 w-6" /></div>
                                                )}
                                                {publishingId === post.id && (
                                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                                        <Loader2 className="h-5 w-5 animate-spin text-black" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-900 truncate max-w-md">{post.message || post.caption || "No content"}</p>
                                                <div className="flex items-center gap-1.5">
                                                    {/* <span className="text-[11px] font-bold text-gray-700 truncate max-w-[100px]">{post.name || "X User"}</span> */}
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase text-white bg-black border-sky-100 rounded-md py-0 px-1.5">{post.username ? `@${post.username}` : "N/A"}</Badge>
                                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium"><Globe className="h-2.5 w-2.5" /> {post.postType || "text"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter", post.status === 'posted' ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : "bg-gray-100 text-black hover:bg-gray-100 border-sky-200")}>
                                                {post.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4 text-xs font-bold text-gray-700">
                                                <div className="flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-red-500" /> {formatNumber(post.metrics?.likes)}</div>
                                                <div className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5 text-black" /> {formatNumber(post.metrics?.replies)}</div>
                                                <div className="flex items-center gap-1"><Repeat2 className="h-3.5 w-3.5 text-green-500" /> {formatNumber(post.metrics?.retweets)}</div>
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
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black"><MoreVertical className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-gray-100">
                                                    {post.status === 'posted' ? (
                                                        <>
                                                            <DropdownMenuItem onClick={() => onEditClick(post, 'analytics')} className="gap-2.5 text-xs font-black text-blue-600 rounded-lg">
                                                                <BarChart3 className="h-4 w-4" /> View Analytics
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => onEditClick(post)} className="gap-2.5 text-xs font-black rounded-lg">
                                                                <Eye className="h-4 w-4" /> View Post
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
