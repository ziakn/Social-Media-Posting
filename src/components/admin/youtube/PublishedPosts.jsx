"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { format } from "date-fns";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Youtube, MoreVertical, ExternalLink, Trash2, Calendar as CalendarIcon,
    BarChart3, Search, Eye, Edit3,
    Video, Loader2, Clock, Globe, Play, X, AlertCircle,
    ChevronLeft, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { getYoutubePublishedPosts, deleteYoutubePost, getUserYoutubeAccounts, updateYoutubePost } from "@/app/actions/social/youtube/youtubePostsActions";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUsage } from "@/hooks/useUsage";

export default function PublishedPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [selectedPost, setSelectedPost] = useState(null);
    const [editDialog, setEditDialog] = useState({ open: false, postId: null, title: "", description: "" });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });

    const { canPost, loading: usageLoading } = useUsage();

    // Filter State
    const [filters, setFilters] = useState({
        accountId: "all",
        startDate: "",
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [youtubeAccounts, setYoutubeAccounts] = useState([]);

    // Pagination State
    const [pagination, setPagination] = useState({
        hasMore: false,
        lastVisible: null,
        pageSize: 12,
        totalCount: 0
    });

    const [statistics, setStatistics] = useState(null);

    // Load YouTube Accounts
    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const res = await getUserYoutubeAccounts();
                if (res.success) {
                    setYoutubeAccounts(res.accounts);
                }
            } catch (error) {
                console.error("Failed to load YouTube accounts", error);
            }
        };
        loadAccounts();
    }, []);

    // Load Posts
    const loadPosts = useCallback(async (reset = false, lastDocId = null) => {
        setLoading(true);
        try {
            const res = await getYoutubePublishedPosts({
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
                setStatistics(res.statistics);
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
            toast.error("Failed to load posts");
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
            accountId: "all",
            startDate: "",
        });
        setSearchQuery("");
    };

    const handleDelete = async (postId) => {
        startTransition(async () => {
            try {
                const res = await deleteYoutubePost(postId);
                if (res.success) {
                    toast.success(res.message);
                    setPosts(posts.filter(p => p.id !== postId));
                    setDeleteDialog({ open: false, postId: null });
                    setSelectedPost(null);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("An unexpected error occurred");
            }
        });
    };

    const handleUpdate = async () => {
        if (!editDialog.postId || !editDialog.title.trim()) return;

        startTransition(async () => {
            try {
                const res = await updateYoutubePost(editDialog.postId, {
                    title: editDialog.title,
                    description: editDialog.description
                });
                if (res.success) {
                    toast.success(res.message);
                    setPosts(posts.map(p => p.id === editDialog.postId ? { ...p, title: editDialog.title, description: editDialog.description } : p));
                    setEditDialog({ open: false, postId: null, title: "", description: "" });
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("Failed to update post");
            }
        });
    };

    // Client-side search filtering
    const filteredAndSortedPosts = posts.filter(post => {
        if (searchQuery) {
            return post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.description?.toLowerCase().includes(searchQuery.toLowerCase());
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
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <Card className="bg-gradient-to-r from-red-50 via-white to-orange-50 border border-red-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600">
                                    <Youtube className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Published Videos
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600 pl-13">
                                View and manage your published YouTube content
                            </CardDescription>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 min-w-[300px]">
                            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                        <Video className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xl font-bold text-gray-900">
                                            {pagination.totalCount || posts.length}
                                        </div>
                                        <div className="text-xs text-gray-500">Total Videos</div>
                                    </div>
                                </div>
                            </div>
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
                                        placeholder="Search videos by title or description..."
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
                                {youtubeAccounts.length > 0 && (
                                    <Select value={filters.accountId} onValueChange={(value) => handleFilterChange("accountId", value)}>
                                        <SelectTrigger className="w-full lg:w-[180px]">
                                            <SelectValue placeholder="Account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Accounts</SelectItem>
                                            {youtubeAccounts.map((account) => (
                                                <SelectItem key={account.id} value={account.accountId}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={account.profilePicture} />
                                                            <AvatarFallback>{account.name?.[0] || "?"}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="truncate">{account.name}</span>
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
                                        <SelectItem value="newest">Newest First</SelectItem>
                                        <SelectItem value="oldest">Oldest First</SelectItem>
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
                    </div>
                </CardContent>
            </Card>

            {/* Grid View */}
            {filteredAndSortedPosts.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {searchQuery ? "No matching videos found" : "No videos available"}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {searchQuery ? "Try adjusting your search or filters" : "Your published YouTube videos will appear here"}
                        </p>
                        <Button onClick={clearFilters} variant="outline">
                            Clear All Filters
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAndSortedPosts.map((post) => (
                        <Card
                            key={post.id}
                            className="group relative border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white aspect-video flex flex-col"
                        >
                            {/* Full Card Media/Background */}
                            <div className="absolute inset-0 z-0 bg-gray-900 cursor-pointer" onClick={() => setSelectedPost(post)}>
                                {post.videoUrl ? (
                                    <div className="w-full h-full relative">
                                        <video src={post.videoUrl} className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-white/30 backdrop-blur-md p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                                <Play className="h-6 w-6 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-100 p-6 text-center">
                                        <Youtube className="h-8 w-8 mb-2 text-gray-300" />
                                        <p className="text-xs font-medium line-clamp-4 text-gray-600">
                                            {post.title || "No Title"}
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
                                        <DropdownMenuItem onClick={() => window.open(`https://www.youtube.com/watch?v=${post.videoId}`, '_blank')}>
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Open on YouTube
                                        </DropdownMenuItem>
                                        <Separator className="my-1" />
                                        <DropdownMenuItem onClick={() => setEditDialog({
                                            open: true,
                                            postId: post.id,
                                            title: post.title || "",
                                            description: post.description || ""
                                        })}>
                                            <Edit3 className="mr-2 h-4 w-4" />
                                            Edit Details
                                        </DropdownMenuItem>
                                        <Separator className="my-1" />
                                        <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, postId: post.id })} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Bottom Content Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-3 z-10 pointer-events-none text-white">
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs font-bold line-clamp-1 leading-snug text-gray-100 drop-shadow-md">
                                        {post.title || "Untitled Video"}
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-300 font-medium pt-0.5" suppressHydrationWarning>
                                        <CalendarIcon className="h-3 w-3" />
                                        <span>{format(post.createdAt ? new Date(post.createdAt) : new Date(), "MMM d, yyyy")}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Dialog */}
            <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
                <DialogContent className="max-w-5xl p-0 border-0 overflow-hidden rounded-3xl shadow-2xl">
                    {selectedPost && (
                        <div className="flex flex-col md:flex-row h-[80vh]">
                            {/* Left: Media Preview */}
                            <div className="flex-1 bg-black flex items-center justify-center relative">
                                <video src={selectedPost.videoUrl} controls className="max-h-full max-w-full" />
                                <div className="absolute top-6 left-6">
                                    <Badge className="bg-red-600 text-white border-0 px-3 py-1 font-bold">
                                        <Youtube className="h-3 w-3 mr-2" />
                                        YouTube Video
                                    </Badge>
                                </div>
                            </div>

                            {/* Right: Details */}
                            <div className="w-full md:w-[400px] bg-white flex flex-col">
                                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                                            <Youtube className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">Video Details</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {format(selectedPost.createdAt ? new Date(selectedPost.createdAt) : new Date(), "MMMM d, yyyy")}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1">
                                    <div className="p-6 space-y-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</Label>
                                            <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                                {selectedPost.title}
                                            </h3>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</Label>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                                                {selectedPost.description || "No description provided."}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post Info</Label>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 font-medium flex items-center gap-2">
                                                        <Globe className="h-4 w-4" /> Visibility
                                                    </span>
                                                    <Badge variant="outline" className="rounded-lg font-bold uppercase text-[10px]">{selectedPost.privacyStatus || "public"}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 font-medium flex items-center gap-2">
                                                        <Clock className="h-4 w-4" /> Status
                                                    </span>
                                                    <Badge className="bg-emerald-500 text-white border-0 rounded-lg font-bold uppercase text-[10px]">Published</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>

                                <div className="p-6 border-t border-slate-50">
                                    <Button
                                        className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-100 transition-all"
                                        onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedPost.videoId}`, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View on YouTube
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}>
                <DialogContent className="max-w-lg rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Video Details</DialogTitle>
                        <DialogDescription>
                            Update the title and description of your video.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editDialog.title}
                                onChange={(e) => setEditDialog(prev => ({ ...prev, title: e.target.value }))}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editDialog.description}
                                onChange={(e) => setEditDialog(prev => ({ ...prev, description: e.target.value }))}
                                className="min-h-[150px] rounded-xl resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, postId: null, title: "", description: "" })} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={isPending || !editDialog.title.trim()}
                            className="bg-red-600 hover:bg-red-700 rounded-xl min-w-[100px]"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the video from your dashboard and attempt to delete it from YouTube. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDelete(deleteDialog.postId)}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                            disabled={isPending}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Video"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
