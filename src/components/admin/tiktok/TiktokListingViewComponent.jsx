// src/components/admin/tiktok/TiktokListingViewComponent.jsx
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
    Search, Heart, MessageCircle, MoreVertical, Edit, Trash2, History, Play, Share2, Eye, X
} from "lucide-react";
import { getTiktokPosts, deleteTiktokPost } from "@/app/actions/social/tiktok/tiktokPostsActions";
import { getUserTikTokAccounts } from "@/app/actions/social/tiktok/getAccounts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TiktokLogo } from "@/components/icons/TiktokLogo";

export default function TiktokListingViewComponent({
    accountId: initialAccountId,
    initialStatus = "all",
    refreshTrigger = 0,
    onEdit = null
}) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);

    const [filters, setFilters] = useState({
        status: initialStatus,
        accountId: initialAccountId || "all",
        searchQuery: "",
        sortBy: "date",
        sortOrder: "desc"
    });

    const [pagination, setPagination] = useState({
        pageSize: 15,
        hasMore: false,
        lastPostId: null
    });

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

    const formatNumber = (num) => {
        if (!num && num !== 0) return "0";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    if (loading && posts.length === 0) {
        return <Skeleton className="h-[400px] w-full" />;
    }

    return (
        <div className="space-y-4">
            <Card className="p-4 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search posts..."
                        className="pl-9"
                        value={filters.searchQuery}
                        onChange={(e) => setFilters(p => ({ ...p, searchQuery: e.target.value }))}
                    />
                </div>
                <Select value={filters.status} onValueChange={(v) => setFilters(p => ({ ...p, status: v }))}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filters.accountId} onValueChange={(v) => setFilters(p => ({ ...p, accountId: v }))}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Account" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Accounts</SelectItem>
                        {accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.username}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Card>

            <Card className="overflow-hidden border-none shadow-lg">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px]">Video</TableHead>
                            <TableHead>Content</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Engagement</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {posts.map((post) => (
                            <TableRow key={post.id} className="hover:bg-gray-50/50">
                                <TableCell>
                                    <div className="h-14 w-10 bg-black rounded overflow-hidden relative group">
                                        {post.content?.media?.[0]?.url ? (
                                            <video src={post.content.media[0].url} className="h-full w-full object-cover" muted />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center"><TiktokLogo className="h-4 w-4 text-gray-700" /></div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm font-medium line-clamp-2 max-w-xs">{post.content?.text}</p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={accounts.find(a => a.id === post.accountId)?.profilePicture} />
                                            <AvatarFallback>T</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-bold">@{accounts.find(a => a.id === post.accountId)?.username}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("capitalize", post.status === 'published' ? "text-green-600 bg-green-50" : "text-purple-600 bg-purple-50")}>
                                        {post.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500">
                                            <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {formatNumber(post.metrics?.likes)}</span>
                                            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {formatNumber(post.metrics?.comments)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500">
                                            <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {formatNumber(post.metrics?.shares)}</span>
                                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(post.metrics?.views)}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-[11px]">
                                        <span className="font-bold">{format(new Date(post.publishedAt || post.scheduledAt || post.createdAt), "MMM dd, yyyy")}</span>
                                        <span className="text-gray-400">{format(new Date(post.publishedAt || post.scheduledAt || post.createdAt), "h:mm a")}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit?.(post)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => deleteTiktokPost(post.id).then(() => loadPosts(true))}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {posts.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500 font-medium">No posts found</div>
                )}
            </Card>

            {pagination.hasMore && (
                <div className="flex justify-center pt-4">
                    <Button onClick={() => loadPosts(false, pagination.lastPostId)} variant="ghost" size="sm">Load More Activity <History className="ml-2 h-3 w-3" /></Button>
                </div>
            )}
        </div>
    );
}
