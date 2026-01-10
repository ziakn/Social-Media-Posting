"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { format } from "date-fns";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Calendar, MoreVertical, Trash2, Edit3, Image as ImageIcon, Video, 
    FileText, Loader2, Clock, Play, X, CalendarDays, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { 
    getTelegramScheduledPosts, 
    deleteTelegramPost, 
    updateTelegramPost 
} from "@/app/actions/social/telegram/telegramPostsActions";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ScheduledTelegramPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [selectedPost, setSelectedPost] = useState(null);
    const [editDialog, setEditDialog] = useState({ open: false, postId: null, message: "" });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });

    const [pagination, setPagination] = useState({
        hasMore: false,
        lastVisible: null,
        pageSize: 12
    });

    const loadPosts = useCallback(async (reset = false) => {
        setLoading(true);
        try {
            const res = await getTelegramScheduledPosts({
                pageSize: pagination.pageSize,
                lastDocId: reset ? null : pagination.lastVisible,
            });

            if (res.success) {
                setPosts(reset ? res.posts : [...posts, ...res.posts]);
                setPagination(prev => ({
                    ...prev,
                    hasMore: res.pagination?.hasMore || false,
                    lastVisible: res.pagination?.lastVisible || null,
                }));
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to load scheduled posts");
        } finally {
            setLoading(false);
        }
    }, [pagination.pageSize, pagination.lastVisible, posts]);

    useEffect(() => {
        loadPosts(true);
    }, []);

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
        return <FileText className="h-4 w-4" />;
    };

    if (loading && posts.length === 0) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-amber-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-200">
                            <CalendarDays className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold text-slate-900">
                                Scheduled Broadcasts
                            </CardTitle>
                            <CardDescription className="text-slate-600">
                                Review and manage messages queued for future delivery
                            </CardDescription>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {posts.length === 0 ? (
                <Card className="border-dashed border-2 py-20 bg-slate-50/30">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                            <Clock className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Queue is empty</h3>
                        <p className="text-slate-500 max-w-xs mt-2 font-medium">
                            Plan ahead and schedule your Telegram broadcasts. They'll show up here!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {posts.map(post => {
                        const isPast = post.scheduledAt && new Date(post.scheduledAt) < new Date();
                        return (
                            <Card 
                                key={post.id} 
                                className="group relative overflow-hidden aspect-square border-0 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col"
                                onClick={() => setSelectedPost(post)}
                            >
                                {post.mediaUrls?.[0]?.url ? (
                                    <div className="absolute inset-0">
                                        <img src={post.mediaUrls[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-8 text-center border-2 border-slate-100">
                                        <p className="text-slate-600 text-sm line-clamp-3 font-medium leading-relaxed">{post.message}</p>
                                    </div>
                                )}

                                <div className="absolute top-3 left-3 flex flex-col gap-2 scale-90 origin-top-left">
                                    <Badge className="bg-white/95 backdrop-blur-sm text-slate-900 border-0 shadow-sm flex items-center gap-1.5 py-1 px-3">
                                        {getPostIcon(post.postType)}
                                        <span className="text-[10px] font-bold uppercase">{post.postType}</span>
                                    </Badge>
                                    <Badge className={`${isPast ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'} border-0 shadow-sm flex items-center gap-1.5 py-1 px-3`}>
                                        <Clock className="h-3 w-3" />
                                        <span className="text-[10px] font-bold uppercase">{isPast ? 'Delayed' : 'Scheduled'}</span>
                                    </Badge>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-4">
                                    <div className="space-y-1.5">
                                        <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/10">
                                            <div className="flex items-center gap-1.5 text-[10px] text-white font-bold uppercase tracking-wider">
                                                <Calendar className="h-3 w-3 text-amber-400" />
                                                {format(post.scheduledAt || new Date(), "MMM d, h:mm a")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {pagination.hasMore && (
                <div className="flex justify-center pt-8">
                    <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => loadPosts()} 
                        disabled={loading}
                        className="rounded-2xl px-8 h-12 font-bold hover:bg-slate-50 border-slate-200"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Load More Scheduled"}
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
                                        <Clock className="h-16 w-16 mx-auto opacity-10 animate-pulse" />
                                        <p className="text-lg font-medium max-w-sm">{selectedPost.message}</p>
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 flex gap-2">
                                    <Badge className="bg-amber-500 text-white border-0 px-3 py-1 font-bold shadow-lg">
                                        Scheduled Broadcast
                                    </Badge>
                                </div>
                            </div>
                            <div className="w-full md:w-[350px] bg-white flex flex-col p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">Queue Management</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Status: {new Date(selectedPost.scheduledAt) < new Date() ? 'Delayed' : 'Pending'}
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
                                                <Edit3 className="h-4 w-4 mr-3 text-slate-400" /> Edit Message
                                            </DropdownMenuItem>
                                            <Separator className="my-1" />
                                            <DropdownMenuItem 
                                                className="p-3 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                                onClick={() => setDeleteDialog({ open: true, postId: selectedPost.id })}
                                            >
                                                <Trash2 className="h-4 w-4 mr-3" /> Cancel & Delete
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
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Schedule</Label>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 flex items-center gap-2"><Calendar className="h-4 w-4" /> Date</span>
                                                    <span className="font-bold text-slate-900">{format(selectedPost.scheduledAt || new Date(), "MMM d, yyyy")}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 flex items-center gap-2"><Clock className="h-4 w-4" /> Time</span>
                                                    <span className="font-bold text-slate-900">{format(selectedPost.scheduledAt || new Date(), "h:mm a")}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 flex items-center gap-2">{getPostIcon(selectedPost.postType)} Type</span>
                                                    <Badge variant="outline" className="rounded-lg capitalize font-bold text-[10px]">{selectedPost.postType}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                                
                                <div className="mt-6 pt-6 border-t border-slate-50">
                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold text-slate-600">
                                            Reschedule
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, postId: null, message: "" })}>
                <DialogContent className="max-w-lg rounded-3xl border-0 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Update Scheduled Post</DialogTitle>
                        <DialogDescription className="text-slate-500">Modify the content before it's sent to Telegram.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Message</Label>
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
                            className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold px-8"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Queue"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, postId: null })}>
                <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">Cancel Broadcast?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500">
                            This will remove the post from the scheduling queue. It will not be sent to Telegram.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 pt-4">
                        <AlertDialogCancel className="rounded-xl border-slate-200 font-bold">Close</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => handleDelete(deleteDialog.postId)}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 font-bold"
                            disabled={isPending}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Cancellation"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
