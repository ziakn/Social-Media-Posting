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
    Search, TrendingUp, Heart, MessageCircle, Eye, X, Filter,
    Layers, Play, Edit, MoreVertical, Send, Trash2, Loader2, BarChart3,
    History, ImageIcon, Film
} from "lucide-react";
import { getThreadsPosts, getThreadsPostsStats, publishThreadsPostNow } from "@/app/actions/social/threads/threadsPostsActions";
import { getUserThreadsAccounts } from "@/app/actions/social/threads/createPost";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";

export default function ThreadsListingViewComponent({
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
            const result = await getUserThreadsAccounts();
            if (result.success) setAccounts(result.accounts || []);
        };
        loadAccounts();
    }, [initialAccountId]);

    const loadStats = useCallback(async () => {
        try {
            const result = await getThreadsPostsStats({ accountId: filters.accountId });
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
            const result = await getThreadsPosts({
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

    const onEditClick = (post, action = 'edit') => {
        if (onEdit) onEdit(post, action);
    };

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            const result = await publishThreadsPostNow(post.id);
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
                            <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                                <Layers className="h-5 w-5 text-zinc-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{stats.totalPosts || 0}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Threads</div>
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
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Replies</div>
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
                                placeholder="Search by content..."
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
                        <TableHeader className="bg-zinc-50/50 border-b border-gray-50">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="pl-6 font-black uppercase text-[10px] tracking-[0.1em] text-zinc-400 h-14">Preview</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.1em] text-zinc-400 h-14">Thread Details</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.1em] text-zinc-400 h-14">Status</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.1em] text-zinc-400 h-14">Engagement</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-[0.1em] text-zinc-400 h-14">Date & Time</TableHead>
                                <TableHead className="pr-6 text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => {
                                const message = post.message || post.content?.text || post.caption || "";
                                const media = post.mediaUrls || post.content?.media || (post.mediaUrl ? [{ url: post.mediaUrl, type: post.mediaType }] : []) || [];
                                const date = post.scheduledAt || post.createdAt;
                                return (
                                    <TableRow key={post.id} className={cn("group hover:bg-zinc-50/30 transition-all border-gray-50 cursor-pointer h-20", publishingId === post.id && "opacity-70 pointer-events-none")} onClick={() => onEditClick(post)}>
                                        <TableCell className="pl-6">
                                            <div className="h-14 w-14 rounded-2xl bg-gray-100 overflow-hidden relative border border-gray-100 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                {media.length > 0 ? (
                                                    media[0].type?.startsWith('video') || post.mediaType === 'VIDEO' ? (
                                                        <div className="w-full h-full bg-black relative flex items-center justify-center">
                                                            <video src={media[0].url} className="w-full h-full object-cover" muted />
                                                            <div className="absolute inset-0 flex items-center justify-center"><Play className="h-5 w-5 text-white fill-white opacity-80" /></div>
                                                        </div>
                                                    ) : (<img src={media[0].url} alt="" className="h-full w-full object-cover" />)
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-zinc-50">
                                                        <ThreadsLogo className="h-6 w-6 text-zinc-200" />
                                                    </div>
                                                )}
                                                {publishingId === post.id && (
                                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                        <Loader2 className="h-5 w-5 animate-spin text-black" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1.5 max-w-md">
                                                <p className="text-[14px] font-bold text-gray-900 truncate tracking-tight">{message || "No content provided"}</p>

                                                {/* Media Grid */}
                                                {media.length > 0 && (
                                                    <div className="flex items-center gap-2 pt-1 pb-2 overflow-x-auto no-scrollbar mask-gradient-right">
                                                        {media.slice(0, 5).map((item, idx) => (
                                                            <div key={idx} className="relative shrink-0 h-10 w-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-100">
                                                                {item.type?.startsWith('video') || post.mediaType === 'VIDEO' ? (
                                                                    <>
                                                                        <video src={item.url} className="h-full w-full object-cover" muted />
                                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                                            <Play className="h-3 w-3 text-white fill-white" />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                                                                )}
                                                                {idx === 4 && media.length > 5 && (
                                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                                        <span className="text-[9px] font-bold text-white">+{media.length - 5}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-0.5 rounded-full">
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={post.profilePicture} />
                                                            <AvatarFallback className="text-[6px] font-black">{post.username?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tight">@{accounts.find(a => a.accountId === post.accountId)?.username || post.username || "Threads"}</span>
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-zinc-200" />
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase text-zinc-400 border-zinc-100 rounded-md py-0 px-1.5">
                                                        {post.postType || (media.length > 0 ? (media[0].type?.startsWith('video') ? 'video' : 'image') : 'text')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn("rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm", post.status === 'published' ? "bg-green-50 text-green-700 hover:bg-green-50 border-green-100" : "bg-purple-50 text-purple-700 hover:bg-purple-50 border-purple-100")}>
                                                {post.status || "published"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
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
                                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter ml-5">Replies</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-bold text-gray-900 tracking-tight">
                                                    {format(new Date(date), "MMM dd, yyyy")}
                                                </span>
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                    {format(new Date(date), "h:mm a")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-black transition-all"><MoreVertical className="h-5 w-5" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-2xl border-gray-100 p-2">
                                                    {post.status === 'published' ? (
                                                        <>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditClick(post, 'analytics'); }} className="gap-3 p-3 text-xs font-bold rounded-xl focus:bg-blue-50 focus:text-blue-700">
                                                                <BarChart3 className="h-4 w-4" />
                                                                <span>View Analytics</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditClick(post); }} className="gap-3 p-3 text-xs font-bold rounded-xl">
                                                                <Eye className="h-4 w-4" />
                                                                <span>Thread Details</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditClick(post); }} className="gap-3 p-3 text-xs font-bold rounded-xl">
                                                                <Edit className="h-4 w-4" />
                                                                <span>Edit Thread</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="gap-3 p-3 text-xs font-bold text-purple-600 rounded-xl focus:bg-purple-50 focus:text-purple-700">
                                                                <Send className="h-4 w-4" />
                                                                <span>Publish Now</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-3 p-3 text-xs font-bold text-red-600 rounded-xl focus:bg-red-50 focus:text-red-700" onClick={(e) => { e.stopPropagation(); onEdit(post, 'delete'); }}>
                                                                <Trash2 className="h-4 w-4" />
                                                                <span>Delete Thread</span>
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
