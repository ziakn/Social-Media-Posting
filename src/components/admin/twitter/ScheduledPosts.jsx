"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Twitter, MoreVertical, Trash2, Calendar as CalendarIcon, Clock, Edit3,
    Image as ImageIcon, Video, Link2, FileText, Loader2, Play, Eye,
    AlertCircle, Timer, Repeat2, Search, X, BarChart3
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { getTwitterScheduledPosts, deleteTwitterPost, getUserTwitterAccounts } from "@/app/actions/social/twitter/twitterPostsActions";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ScheduledPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [selectedPost, setSelectedPost] = useState(null);

    // Filter State
    const [filters, setFilters] = useState({
        status: "scheduled",
        postType: "all",
        accountId: "all",
        startDate: "",
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [twitterAccounts, setTwitterAccounts] = useState([]);

    // Pagination State
    const [pagination, setPagination] = useState({
        hasMore: false,
        lastVisible: null,
        pageSize: 12,
        totalCount: 0
    });

    // Load Twitter Accounts
    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const res = await getUserTwitterAccounts();
                if (res.success) {
                    setTwitterAccounts(res.accounts);
                }
            } catch (error) {
                console.error("Failed to load Twitter accounts", error);
            }
        };
        loadAccounts();
    }, []);

    // Load Posts
    const loadPosts = useCallback(async (reset = false, lastDocId = null) => {
        setLoading(true);
        try {
            const res = await getTwitterScheduledPosts({
                pageSize: pagination.pageSize,
                lastDocId: reset ? null : lastDocId,
                filters,
                sortBy
            });

            if (res.success) {
                if (reset || !lastDocId) {
                    setPosts(res.posts);
                } else {
                    setPosts(prev => [...prev, ...res.posts]);
                }
                setPagination(prev => ({
                    ...prev,
                    hasMore: res.pagination?.hasMore || false,
                    lastVisible: res.pagination?.lastVisible || null,
                    totalCount: res.pagination?.total || 0
                }));
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to load scheduled posts");
        } finally {
            setLoading(false);
        }
    }, [pagination.pageSize, filters, sortBy]);

    useEffect(() => {
        loadPosts(true);
    }, [loadPosts]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: "scheduled",
            postType: "all",
            accountId: "all",
            startDate: "",
        });
        setSearchQuery("");
    };

    const handleDelete = async (postId) => {
        startTransition(async () => {
            try {
                const res = await deleteTwitterPost(postId);
                if (res.success) {
                    toast.success(res.message);
                    setPosts(posts.filter(p => p.id !== postId));
                    setSelectedPost(null);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("An unexpected error occurred");
            }
        });
    };

    const getPostIcon = (post) => {
        if (post.postType === "image") return <ImageIcon className="h-4 w-4" />;
        if (post.postType === "video") return <Video className="h-4 w-4" />;
        if (post.postType === "link") return <Link2 className="h-4 w-4" />;
        return <FileText className="h-4 w-4" />;
    };

    // Client-side search filtering
    const filteredAndSortedPosts = posts.filter(post => {
        if (searchQuery) {
            return post.message?.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    if (loading && posts.length === 0) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <Card className="bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Scheduled Tweets
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600 pl-13">
                                Manage your upcoming Twitter content and publishing schedule
                            </CardDescription>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                                        <Timer className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xl font-bold text-gray-900">
                                            {pagination.totalCount || posts.length}
                                        </div>
                                        <div className="text-xs text-gray-500">Scheduled</div>
                                    </div>
                                </div>
                            </div>

                            <Link href="/admin/twitter/create">
                                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-100 h-full py-4">
                                    <Twitter className="h-4 w-4 mr-2" />
                                    Schedule New Tweet
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Advanced Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex-1 w-full">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search scheduled tweets..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 w-full lg:w-96"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Clear Filters
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                            <div className="flex-1 flex flex-wrap gap-3">
                                <Select value={filters.postType} onValueChange={(value) => handleFilterChange("postType", value)}>
                                    <SelectTrigger className="w-full lg:w-[150px]">
                                        <SelectValue placeholder="Post Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="text">Text Only</SelectItem>
                                        <SelectItem value="image">Images</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="link">Link</SelectItem>
                                    </SelectContent>
                                </Select>

                                {twitterAccounts.length > 0 && (
                                    <Select value={filters.accountId} onValueChange={(value) => handleFilterChange("accountId", value)}>
                                        <SelectTrigger className="w-full lg:w-[180px]">
                                            <SelectValue placeholder="Account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Accounts</SelectItem>
                                            {twitterAccounts.map((account) => (
                                                <SelectItem key={account.id} value={account.accountId}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={account.profilePicture} />
                                                            <AvatarFallback>{account.username?.[0] || "?"}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="truncate">{account.username}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full lg:w-[150px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Earliest First</SelectItem>
                                        <SelectItem value="oldest">Latest First</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !filters.startDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.startDate ? format(new Date(filters.startDate), "PPP") : <span>Pick a start date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={filters.startDate ? new Date(filters.startDate) : undefined}
                                            onSelect={(date) => handleFilterChange("startDate", date ? date.toISOString() : "")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(filters.postType !== "all" || filters.accountId !== "all" || filters.startDate) && (
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {filters.postType !== "all" && (
                                    <Badge variant="secondary" className="gap-1">
                                        Type: {filters.postType}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("postType", "all")} />
                                    </Badge>
                                )}
                                {filters.startDate && (
                                    <Badge variant="secondary" className="gap-1">
                                        Start Date: {format(new Date(filters.startDate), "MMM dd")}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("startDate", "")} />
                                    </Badge>
                                )}
                                {filters.accountId !== "all" && (
                                    <Badge variant="secondary" className="gap-1">
                                        Account Filter Active
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("accountId", "all")} />
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Posts Grid */}
            {filteredAndSortedPosts.length === 0 ? (
                <Card className="p-16 text-center border-dashed border-2 border-muted shadow-none bg-gray-50/30">
                    <CardContent className="space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {searchQuery ? "No matching tweets found" : "No scheduled tweets"}
                        </div>
                        <p className="text-muted-foreground text-lg max-w-md mx-auto">
                            {searchQuery ? "Try adjusting your search or filters" : "Your upcoming tweets will appear here with countdown timers."}
                        </p>
                        <Button onClick={clearFilters} variant="outline" className="mt-4">
                            Clear All Filters
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAndSortedPosts.map((post) => (
                        <Card
                            key={post.id}
                            className="group relative border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white aspect-square flex flex-col"
                        >
                            {/* Full Card Media/Background */}
                            <div className="absolute inset-0 z-0 bg-gray-50 cursor-pointer" onClick={() => setSelectedPost(post)}>
                                {post.mediaUrls?.[0]?.url ? (
                                    <>
                                        {post.mediaUrls[0].type === "video" ? (
                                            <div className="w-full h-full bg-black relative">
                                                <video src={post.mediaUrls[0].url} className="w-full h-full object-cover opacity-90" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-white/30 backdrop-blur-md p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                                        <Play className="h-6 w-6 text-white fill-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img
                                                src={post.mediaUrls[0].url}
                                                alt="Scheduled post media"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-100 p-6 text-center">
                                        <Twitter className="h-8 w-8 mb-2 text-gray-300" />
                                        <p className="text-xs font-medium line-clamp-4 text-gray-600">
                                            {post.message || "No content"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Top Actions */}
                            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-700 border border-gray-100">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setSelectedPost(post)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </DropdownMenuItem>
                                        <Separator className="my-1" />
                                        <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Cancel Schedule
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Status Flag */}
                            <div className="absolute top-3 left-3 z-20 pointer-events-none">
                                <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-full px-2 py-1 flex items-center gap-1.5">
                                    <Timer className="h-3 w-3 text-blue-600" />
                                    <span className="text-[10px] font-semibold text-gray-700">
                                        {formatDistanceToNow(post.scheduledAt?.toDate ? post.scheduledAt.toDate() : new Date(post.scheduledAt), { addSuffix: false })}
                                    </span>
                                </div>
                            </div>

                            {/* Bottom Content Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-3 z-10 pointer-events-none text-white">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold tracking-wide drop-shadow-sm uppercase">
                                            Twitter Post
                                        </span>
                                        {post.mediaUrls?.length > 1 && (
                                            <span className="text-[10px] bg-black/40 px-1.5 rounded-full backdrop-blur-sm flex items-center gap-0.5">
                                                <Repeat2 className="h-3 w-3" /> +{post.mediaUrls.length - 1}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs line-clamp-2 leading-snug font-medium text-gray-100 drop-shadow-md">
                                        {post.message || "No caption"}
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-300 font-medium pt-1">
                                        <CalendarIcon className="h-3 w-3" />
                                        <span>{format(post.scheduledAt?.toDate ? post.scheduledAt.toDate() : new Date(post.scheduledAt), "MMM d, h:mm a")}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Load More */}
            {pagination.hasMore && (
                <div className="flex justify-center pt-8">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => loadPosts(false, pagination.lastVisible)}
                        disabled={loading}
                        className="min-w-[200px] rounded-xl border-2 hover:bg-slate-50 transition-colors"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <ArrowRight className="h-4 w-4 mr-2 rotate-90" />
                        )}
                        Load More Content
                    </Button>
                </div>
            )}

            {/* Detail Dialog */}
            <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
                <DialogContent className="max-w-5xl p-0 border-0 overflow-hidden rounded-3xl shadow-2xl">
                    {selectedPost && (
                        <div className="flex flex-col md:flex-row h-[80vh]">
                            {/* Left: Media Preview */}
                            <div className="flex-1 bg-slate-950 flex items-center justify-center relative group">
                                {selectedPost.mediaUrls?.[0]?.url ? (
                                    selectedPost.mediaUrls[0].type === "video" ? (
                                        <video src={selectedPost.mediaUrls[0].url} controls className="max-h-full max-w-full" />
                                    ) : (
                                        <img src={selectedPost.mediaUrls[0].url} alt="" className="max-h-full max-w-full object-contain" />
                                    )
                                ) : (
                                    <div className="p-12 text-center space-y-4">
                                        <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                                            <Twitter className="h-10 w-10 text-blue-400" />
                                        </div>
                                        <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                                            {selectedPost.message}
                                        </p>
                                    </div>
                                )}
                                <div className="absolute top-6 left-6">
                                    <Badge className="bg-amber-500 text-white border-0 px-3 py-1 font-bold">
                                        <Clock className="h-3 w-3 mr-2" />
                                        Scheduled Tweet
                                    </Badge>
                                </div>
                            </div>

                            {/* Right: Details */}
                            <div className="w-full md:w-[400px] bg-white flex flex-col">
                                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                            <Twitter className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">Scheduled Details</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {format(selectedPost.scheduledAt ? new Date(selectedPost.scheduledAt) : new Date(), "MMM d, yyyy 'at' h:mm a")}
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50">
                                                <MoreVertical className="h-5 w-5 text-slate-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl">
                                            <DropdownMenuItem className="p-3 cursor-pointer">
                                                <Edit3 className="h-4 w-4 mr-3 text-slate-400" />
                                                Edit Content
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="p-3 cursor-pointer">
                                                <CalendarIcon className="h-4 w-4 mr-3 text-slate-400" />
                                                Reschedule
                                            </DropdownMenuItem>
                                            <Separator className="my-1" />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem className="p-3 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50" onSelect={(e) => e.preventDefault()}>
                                                        <Trash2 className="h-4 w-4 mr-3" />
                                                        Cancel Schedule
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-xl font-bold text-slate-900">Cancel Schedule?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-slate-500">
                                                            This will remove the tweet from your scheduled queue. You can always recreate it later.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="gap-2">
                                                        <AlertDialogCancel className="rounded-xl border-slate-200 font-bold">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(selectedPost.id)}
                                                            className="rounded-xl bg-rose-600 hover:bg-rose-700 font-bold"
                                                            disabled={isPending}
                                                        >
                                                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Cancellation"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <ScrollArea className="flex-1">
                                    <div className="p-6 space-y-8">
                                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                                            <Timer className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <div className="text-sm font-bold text-blue-900">
                                                    Posting {formatDistanceToNow(selectedPost.scheduledAt?.toDate ? selectedPost.scheduledAt.toDate() : new Date(selectedPost.scheduledAt), { addSuffix: true })}
                                                </div>
                                                <div className="text-xs text-blue-700">
                                                    {format(selectedPost.scheduledAt?.toDate ? selectedPost.scheduledAt.toDate() : new Date(selectedPost.scheduledAt), "EEEE, MMMM d 'at' h:mm a")}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message</Label>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                {selectedPost.message}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post Info</Label>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 font-medium flex items-center gap-2">
                                                        <FileText className="h-4 w-4" /> Type
                                                    </span>
                                                    <Badge variant="outline" className="rounded-lg font-bold uppercase text-[10px]">{selectedPost.postType}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 font-medium flex items-center gap-2">
                                                        <Clock className="h-4 w-4" /> Status
                                                    </span>
                                                    <Badge className="bg-amber-500 text-white border-0 rounded-lg font-bold uppercase text-[10px]">Scheduled</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>

                                <div className="p-6 border-t border-slate-50">
                                    <Button
                                        className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 transition-all"
                                        onClick={() => setSelectedPost(null)}
                                    >
                                        Close Preview
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
