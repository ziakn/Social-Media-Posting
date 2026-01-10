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
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
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
import { Textarea } from "@/components/ui/textarea";
import { 
    Send, MoreVertical, ExternalLink, Trash2, Search, BarChart3, 
    Image as ImageIcon, Video, Link2, FileText, Loader2, Clock, 
    AlertCircle, X, Eye, Edit3
} from "lucide-react";
import { toast } from "sonner";
import { 
    getTelegramPublishedPosts, 
    deleteTelegramPost, 
    getUserTelegramAccounts, 
    updateTelegramPost 
} from "@/app/actions/social/telegram/telegramPostsActions";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PublishedTelegramPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [selectedPost, setSelectedPost] = useState(null);
    const [editDialog, setEditDialog] = useState({ open: false, postId: null, message: "" });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });
    const [telegramAccounts, setTelegramAccounts] = useState([]);

    const [filters, setFilters] = useState({
        postType: "all",
        accountId: "all",
        startDate: "",
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const [pagination, setPagination] = useState({
        hasMore: false,
        lastVisible: null,
        pageSize: 12,
        totalCount: 0
    });

    useEffect(() => {
        const loadAccounts = async () => {
            const res = await getUserTelegramAccounts();
            if (res.success) setTelegramAccounts(res.accounts);
        };
        loadAccounts();
    }, []);

    const loadPosts = useCallback(async (reset = false) => {
        setLoading(true);
        try {
            const res = await getTelegramPublishedPosts({
                pageSize: pagination.pageSize,
                lastDocId: reset ? null : pagination.lastVisible,
                filters,
                sortBy
            });

            if (res.success) {
                setPosts(reset ? res.posts : [...posts, ...res.posts]);
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
    }, [pagination.pageSize, pagination.lastVisible, filters, sortBy, posts]);

    useEffect(() => {
        loadPosts(true);
    }, [filters, sortBy]);

    const handleDelete = async (postId) => {
        startTransition(async () => {
            const res = await deleteTelegramPost(postId);
            if (res.success) {
                toast.success(res.message);
                setPosts(posts.filter(p => p.id !== postId));
                setDeleteDialog({ open: false, postId: null });
                setSelectedPost(null);
            } else {
                toast.error(res.message);
            }
        });
    };

    const handleUpdate = async () => {
        startTransition(async () => {
            const res = await updateTelegramPost(editDialog.postId, editDialog.message);
            if (res.success) {
                toast.success(res.message);
                setPosts(posts.map(p => p.id === editDialog.postId ? { ...p, message: editDialog.message } : p));
                setEditDialog({ open: false, postId: null, message: "" });
            } else {
                toast.error(res.message);
            }
        });
    };

    const getPostIcon = (type) => {
        if (type === "image") return <ImageIcon className="h-4 w-4" />;
        if (type === "video") return <Video className="h-4 w-4" />;
        if (type === "link") return <Link2 className="h-4 w-4" />;
        return <FileText className="h-4 w-4" />;
    };

    const filteredPosts = posts.filter(post => 
        post.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <Card className="bg-gradient-to-r from-blue-50 via-white to-cyan-50 border border-blue-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                                    <Send className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-slate-900">
                                    Published Broadcasts
                                </CardTitle>
                            </div>
                            <CardDescription className="text-slate-600 pl-1">
                                Manage your sent Telegram messages and media
                            </CardDescription>
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm min-w-[200px]">
                            <div className="text-2xl font-bold text-slate-900">{pagination.totalCount}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Broadcasts</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                placeholder="Search broadcasts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 rounded-xl border-slate-200"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={filters.postType} onValueChange={(val) => setFilters(f => ({ ...f, postType: val }))}>
                                <SelectTrigger className="w-[140px] h-11 rounded-xl capitalize">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="image">Photo</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" className="h-11 px-3 rounded-xl" onClick={() => {
                                setSearchQuery("");
                                setFilters({ postType: "all", accountId: "all", startDate: "" });
                            }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {filteredPosts.length === 0 ? (
                <Card className="border-dashed border-2 py-20">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Send className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No broadcasts found</h3>
                        <p className="text-slate-500 max-w-xs mt-2">
                            {searchQuery ? "Try adjusting your filters or search query." : "Your published Telegram messages will appear here."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredPosts.map(post => (
                        <Card 
                            key={post.id} 
                            className="group relative overflow-hidden aspect-square border-0 shadow-md hover:shadow-xl transition-all cursor-pointer"
                            onClick={() => setSelectedPost(post)}
                        >
                            {post.mediaUrls?.[0]?.url ? (
                                <div className="absolute inset-0">
                                    {post.postType === "video" ? (
                                        <div className="w-full h-full bg-black">
                                            <video src={post.mediaUrls[0].url} className="w-full h-full object-cover opacity-80" />
                                        </div>
                                    ) : (
                                        <img src={post.mediaUrls[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center p-6 text-center">
                                    <p className="text-slate-600 text-sm line-clamp-4 font-medium">{post.message}</p>
                                </div>
                            )}

                            <div className="absolute top-3 left-3 flex gap-2">
                                <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 border-0 shadow-sm flex items-center gap-1.5 py-1">
                                    {getPostIcon(post.postType)}
                                    <span className="text-[10px] font-bold uppercase">{post.postType}</span>
                                </Badge>
                            </div>

                            <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs text-white/90 line-clamp-2 font-medium drop-shadow-sm">
                                        {post.message}
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">
                                        <Clock className="h-3 w-3" />
                                        {format(post.createdAt || new Date(), "MMM d, yyyy")}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.hasMore && (
                <div className="flex justify-center pt-8">
                    <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => loadPosts()} 
                        disabled={loading}
                        className="rounded-2xl px-8 h-12 font-bold hover:bg-slate-50"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Load More Broadcasts"}
                    </Button>
                </div>
            )}

            {/* Post Detail Dialog */}
            <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
                    {selectedPost && (
                        <div className="flex flex-col md:flex-row h-[70vh]">
                            <div className="flex-1 bg-slate-900 flex items-center justify-center relative">
                                {selectedPost.mediaUrls?.[0]?.url ? (
                                    selectedPost.postType === "video" ? (
                                        <video src={selectedPost.mediaUrls[0].url} controls className="max-h-full max-w-full" />
                                    ) : (
                                        <img src={selectedPost.mediaUrls[0].url} className="max-h-full max-w-full object-contain" />
                                    )
                                ) : (
                                    <div className="p-12 text-center text-slate-400 space-y-4">
                                        <Send className="h-16 w-16 mx-auto opacity-20" />
                                        <p className="text-lg font-medium max-w-sm">{selectedPost.message}</p>
                                    </div>
                                )}
                                <div className="absolute top-6 left-6">
                                    <Badge className="bg-blue-500 text-white border-0 px-3 py-1 font-bold shadow-lg">
                                        Telegram Broadcast
                                    </Badge>
                                </div>
                            </div>
                            <div className="w-full md:w-[350px] bg-white flex flex-col p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                            <Send className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">Broadcast Info</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                ID: {selectedPost.telegramMessageId}
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <MoreVertical className="h-5 w-5 text-slate-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl p-1 border-slate-100 shadow-xl">
                                            <DropdownMenuItem className="p-3 cursor-pointer" onClick={() => setEditDialog({ open: true, postId: selectedPost.id, message: selectedPost.message || "" })}>
                                                <Edit3 className="h-4 w-4 mr-3 text-slate-400" /> Edit Content
                                            </DropdownMenuItem>
                                            <Separator className="my-1" />
                                            <DropdownMenuItem 
                                                className="p-3 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                                onClick={() => setDeleteDialog({ open: true, postId: selectedPost.id })}
                                            >
                                                <Trash2 className="h-4 w-4 mr-3" /> Delete Post
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <ScrollArea className="flex-1 pr-4">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message</Label>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                {selectedPost.message}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Details</Label>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 flex items-center gap-2"><Clock className="h-4 w-4" /> Posted</span>
                                                    <span className="font-bold text-slate-900">{format(selectedPost.createdAt || new Date(), "MMM d, h:mm a")}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 flex items-center gap-2">{getPostIcon(selectedPost.postType)} Type</span>
                                                    <Badge variant="secondary" className="rounded-lg capitalize font-bold text-[10px]">{selectedPost.postType}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 flex items-center gap-2"><Send className="h-4 w-4" /> Message ID</span>
                                                    <span className="font-mono text-[10px] font-bold text-slate-400">{selectedPost.telegramMessageId}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                                
                                <div className="mt-6 pt-6 border-t border-slate-50">
                                    <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg active:scale-95">
                                        <ExternalLink className="h-4 w-4 mr-2" /> Open Chat
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit/Delete Dialogs */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, postId: null })}>
                <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">Delete Broadcast?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500">
                            This will remove the post from your dashboard and attempt to delete it from Telegram. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 pt-4">
                        <AlertDialogCancel className="rounded-xl border-slate-200 font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => handleDelete(deleteDialog.postId)}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 font-bold shadow-lg shadow-rose-200"
                            disabled={isPending}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Permanently"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, postId: null, message: "" })}>
                <DialogContent className="max-w-lg rounded-3xl border-0 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Update Content</DialogTitle>
                        <DialogDescription className="text-slate-500">Modify the text content of your broadcast.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">New Message</Label>
                        <Textarea 
                            value={editDialog.message}
                            onChange={(e) => setEditDialog(prev => ({ ...prev, message: e.target.value }))}
                            className="min-h-[150px] rounded-2xl border-slate-200 p-4 focus:ring-blue-500"
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, postId: null, message: "" })} className="rounded-xl font-bold">Cancel</Button>
                        <Button 
                            onClick={handleUpdate} 
                            disabled={isPending || !editDialog.message.trim()}
                            className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold px-8 shadow-lg shadow-blue-200"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
