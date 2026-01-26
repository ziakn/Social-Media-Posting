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
    Search, Heart, MessageCircle, MoreVertical, Edit, Trash2, History, Play, Share2, Eye, X, Send, BarChart3, Clock
} from "lucide-react";
import { getTiktokPosts, deleteTiktokPost, publishTiktokPostNow } from "@/app/actions/social/tiktok/tiktokPostsActions";
import { getUserTikTokAccounts } from "@/app/actions/social/tiktok/getAccounts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import TiktokAnalyticsModal from "./TiktokAnalyticsModal";

export default function TiktokListingViewComponent({
    accountId: initialAccountId,
    initialStatus = "all",
    refreshTrigger = 0,
    onEdit = null,
    onRefresh = null
}) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [publishingId, setPublishingId] = useState(null);

    const [filters, setFilters] = useState({
        status: initialStatus,
        accountId: initialAccountId || "all",
        searchQuery: "",
        sortBy: "date",
        sortOrder: "desc"
    });

    useEffect(() => {
        if (initialAccountId) {
            setFilters(prev => ({ ...prev, accountId: initialAccountId }));
        }
    }, [initialAccountId]);

    const [pagination, setPagination] = useState({
        pageSize: 15,
        hasMore: false,
        lastPostId: null
    });

    // Analytics Modal State
    const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
    const [selectedPostForAnalytics, setSelectedPostForAnalytics] = useState(null);

    useEffect(() => {
        const loadAccounts = async () => {
            const result = await getUserTikTokAccounts();
            if (result.success) setAccounts(result.accounts || []);
        };
        loadAccounts();
    }, []);

    const loadPosts = useCallback(async (reset = false, lastId = null) => {
        try {
            setLoading(true);
            const result = await getTiktokPosts({
                pageSize: pagination.pageSize,
                lastDocId: reset ? null : lastId,
                filters: {
                    status: filters.status,
                    accountId: filters.accountId,
                    searchQuery: filters.searchQuery
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
            }
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
            accountId: initialAccountId || "all",
            searchQuery: "",
            sortBy: "date",
            sortOrder: "desc"
        });
    };

    const handleOpenAnalytics = (post) => {
        const account = accounts.find(a => a.accountId === post.accountId);
        const enrichedPost = {
            ...post,
            username: account?.username || post.username || "TikTok User",
            profilePicture: account?.profilePicture || post.profilePicture
        };
        setSelectedPostForAnalytics(enrichedPost);
        setAnalyticsModalOpen(true);
    };

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            const result = await publishTiktokPostNow(post.id);
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
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    if (loading && posts.length === 0) {
        return <Skeleton className="h-[400px] w-full rounded-2xl" />;
    }

    return (
        <div className="space-y-6">
            <Card className="p-4 flex flex-wrap gap-4 items-center rounded-2xl shadow-sm border-gray-100">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search posts..."
                        className="pl-9 rounded-xl border-gray-200"
                        value={filters.searchQuery}
                        onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                    />
                </div>
                <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
                    <SelectTrigger className="w-[150px] rounded-xl border-gray-200 font-bold"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={clearFilters} className="rounded-xl"><X className="h-4 w-4" /></Button>
            </Card>

            <Card className="overflow-hidden border-none shadow-xl rounded-3xl bg-white">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-100">
                            <TableHead className="w-[100px] font-black uppercase tracking-widest text-[10px] text-gray-400 pl-6 py-5">Video</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-gray-400 py-5">Content</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-gray-400 py-5">Account</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-gray-400 py-5">Status</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-gray-400 py-5">Engagement</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-gray-400 py-5">Date</TableHead>
                            <TableHead className="text-right font-black uppercase tracking-widest text-[10px] text-gray-400 pr-6 py-5">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {posts.map((post) => (
                            <TableRow key={post.id} className="hover:bg-gray-50/30 transition-colors border-gray-50 group">
                                <TableCell className="pl-6">
                                    <div className="h-16 w-12 bg-black rounded-xl overflow-hidden relative shadow-lg group-hover:scale-105 transition-transform duration-300">
                                        {post.content?.media?.[0]?.url ? (
                                            <video src={post.content.media[0].url} className="h-full w-full object-cover opacity-80" muted />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gray-900"><TiktokLogo className="h-4 w-4 text-gray-700" /></div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Play className="h-4 w-4 text-white/40 fill-white/10" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-[13px] font-bold text-gray-900 line-clamp-2 max-w-xs">{post.content?.text || post.message}</p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2.5">
                                        <Avatar className="h-7 w-7 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                            <AvatarImage src={accounts.find(a => a.accountId === post.accountId)?.profilePicture} />
                                            <AvatarFallback className="text-[8px] font-black bg-gray-50 text-gray-400">T</AvatarFallback>
                                        </Avatar>
                                        <span className="text-[11px] font-black text-gray-700">@{accounts.find(a => a.accountId === post.accountId)?.username || post.username}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("capitalize rounded-lg px-2 py-0.5 text-[10px] font-black tracking-widest border-none", post.status === 'published' ? "text-green-600 bg-green-50" : "text-purple-600 bg-purple-50")}>
                                        {post.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-400">
                                            <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors"><Heart className="h-3 w-3 fill-red-50" /> {formatNumber(post.metrics?.likes)}</span>
                                            <span className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"><MessageCircle className="h-3 w-3 fill-blue-50" /> {formatNumber(post.metrics?.comments)}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-400">
                                            <span className="flex items-center gap-1.5 hover:text-orange-500 transition-colors"><Share2 className="h-3 w-3 fill-orange-50" /> {formatNumber(post.metrics?.shares)}</span>
                                            <span className="flex items-center gap-1.5 hover:text-purple-500 transition-colors"><Eye className="h-3 w-3 fill-purple-50" /> {formatNumber(post.metrics?.views)}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[12px] font-black text-gray-900">{format(new Date(post.publishedAt || post.scheduledAt || post.createdAt), "MMM dd, yyyy")}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(new Date(post.publishedAt || post.scheduledAt || post.createdAt), "h:mm a")}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-black transition-all"><MoreVertical className="h-5 w-5" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[180px] rounded-[24px] shadow-2xl border border-gray-100 p-2">
                                            {post.status === 'published' ? (
                                                <>
                                                    <DropdownMenuItem onClick={() => handleOpenAnalytics(post)} className="flex items-center gap-3 p-3 cursor-pointer rounded-[18px] hover:bg-gray-50 transition-colors group">
                                                        <BarChart3 className="h-5 w-5 text-gray-900" />
                                                        <span className="font-bold text-[13px] text-gray-900">View Analytics</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onEdit?.(post)} className="flex items-center gap-3 p-3 cursor-pointer rounded-[18px] hover:bg-gray-50 transition-colors group">
                                                        <Eye className="h-5 w-5 text-gray-900" />
                                                        <span className="font-bold text-[13px] text-gray-900">Masterpiece Details</span>
                                                    </DropdownMenuItem>
                                                </>
                                            ) : (
                                                <>
                                                    <DropdownMenuItem onClick={() => onEdit?.(post)} className="flex items-center gap-3 p-3 cursor-pointer rounded-[18px] hover:bg-gray-50 transition-colors group">
                                                        <Edit className="h-5 w-5 text-gray-900" />
                                                        <span className="font-bold text-[13px] text-gray-900">Edit Masterpiece</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="flex items-center gap-3 p-3 cursor-pointer rounded-[18px] hover:bg-purple-50 transition-colors group">
                                                        <Send className="h-5 w-5 text-purple-600" />
                                                        <span className="font-bold text-[13px] text-purple-600">Publish Now</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 flex items-center gap-3 p-3 cursor-pointer rounded-[18px] hover:bg-red-50 transition-colors group" onClick={() => deleteTiktokPost(post.id).then(() => loadPosts(true))}>
                                                        <Trash2 className="h-5 w-5 text-red-600" />
                                                        <span className="font-bold text-[13px] text-red-600">Delete Masterpiece</span>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {posts.length === 0 && !loading && (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TiktokLogo className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No matching videos</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">Try adjusting your filters or search query to find your TikTok content.</p>
                    </div>
                )}
            </Card>

            {
                pagination.hasMore && (
                    <div className="flex justify-center pt-8">
                        <Button onClick={() => loadPosts(false, pagination.lastPostId)} variant="outline" size="lg" className="h-12 px-8 rounded-2xl border-gray-200 font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all shadow-xl shadow-black/5 active:scale-95 gap-3">
                            {loading ? "Loading Content..." : "Load More Activity"}
                            {!loading && <History className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                )
            }

            {/* Analytics Modal */}
            <TiktokAnalyticsModal
                open={analyticsModalOpen}
                onOpenChange={setAnalyticsModalOpen}
                post={selectedPostForAnalytics}
            />
        </div >
    );
}
