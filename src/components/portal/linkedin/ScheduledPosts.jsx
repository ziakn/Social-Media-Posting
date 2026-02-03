"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Linkedin, MoreVertical, Trash2, Calendar as CalendarIcon, Clock, Edit3,
    Loader2, Eye, AlertCircle, Timer, Search, X, FileText
} from "lucide-react";
import { toast } from "sonner";
import { deletelinkedinPost } from "@/app/actions/social/linkedin/createPost";
import { fetchScheduledLinkedinPosts, getUserLinkedinAccounts, updateLinkedinPost, updateLinkedinPostSchedule } from "@/app/actions/social/linkedin/linkedinPostsActions";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function ScheduledPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [selectedPost, setSelectedPost] = useState(null);
    const [editDialog, setEditDialog] = useState({ open: false, postId: null, text: "" });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });
    const [scheduleDialog, setScheduleDialog] = useState({ open: false, postId: null, date: new Date(), time: "12:00" });

    const [filters, setFilters] = useState({
        accountId: "all",
        startDate: "",
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [linkedinAccounts, setLinkedinAccounts] = useState([]);

    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const res = await getUserLinkedinAccounts();
                if (res.success) {
                    setLinkedinAccounts(res.accounts);
                }
            } catch (error) {
                console.error("Failed to load LinkedIn accounts", error);
            }
        };
        loadAccounts();
    }, []);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchScheduledLinkedinPosts();
            if (res.success) {
                setPosts(res.posts);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to load scheduled posts");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPosts();
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
                const res = await deletelinkedinPost({ postId });
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
        if (!editDialog.postId) return;

        startTransition(async () => {
            try {
                const res = await updateLinkedinPost(editDialog.postId, {
                    text: editDialog.text
                });
                if (res.success) {
                    toast.success(res.message);
                    setPosts(posts.map(p => p.id === editDialog.postId ? { ...p, text: editDialog.text } : p));
                    setEditDialog({ open: false, postId: null, text: "" });
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("Failed to update post content");
            }
        });
    };

    const handleScheduleUpdate = async (postId, newDate, newTime) => {
        startTransition(async () => {
            try {
                const scheduledAt = new Date(`${format(newDate, "yyyy-MM-dd")}T${newTime}`);
                const res = await updateLinkedinPostSchedule(postId, scheduledAt.toISOString());
                if (res.success) {
                    toast.success(res.message);
                    setPosts(posts.map(p => p.id === postId ? { ...p, scheduledAt: scheduledAt } : p));
                    setScheduleDialog({ open: false, postId: null, date: new Date(), time: "12:00" });
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("Failed to reschedule post");
            }
        });
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = !searchQuery || post.text?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAccount = filters.accountId === "all" || post.accountId === filters.accountId;
        const matchesDate = !filters.startDate || (post.scheduledAt && new Date(post.scheduledAt) >= new Date(filters.startDate));
        return matchesSearch && matchesAccount && matchesDate;
    });

    if (loading && posts.length === 0) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-indigo-50 via-white to-blue-50 border border-indigo-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                            <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold text-gray-900">Scheduled Posts</CardTitle>
                            <CardDescription>Manage your upcoming LinkedIn activity</CardDescription>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search scheduled posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {linkedinAccounts.length > 0 && (
                                <Select value={filters.accountId} onValueChange={(value) => handleFilterChange("accountId", value)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Accounts</SelectItem>
                                        {linkedinAccounts.map((account) => (
                                            <SelectItem key={account.id} value={account.accountId}>
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <Button variant="outline" onClick={clearFilters} className="gap-2">
                                <X className="h-4 w-4" /> Clear
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {filteredPosts.length === 0 ? (
                <Card className="border-dashed py-12 text-center text-slate-500">
                    <Timer className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold">No scheduled posts</h3>
                    <p className="text-sm">Your upcoming LinkedIn posts will appear here.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                        <Card key={post.id} className="overflow-hidden flex flex-col group hover:shadow-md transition-all">
                            <div
                                className="relative aspect-video bg-slate-100 flex items-center justify-center cursor-pointer"
                                onClick={() => setSelectedPost(post)}
                            >
                                {post.imageUrl ? (
                                    <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
                                ) : post.videoUrl ? (
                                    <video src={post.videoUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <FileText className="h-12 w-12 text-slate-300" />
                                )}
                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-white/90 backdrop-blur-sm text-indigo-600 border-indigo-100 flex items-center gap-1.5 shadow-sm">
                                        <Timer className="h-3 w-3" />
                                        <span className="text-[10px] font-bold" suppressHydrationWarning>
                                            {formatDistanceToNow(new Date(post.scheduledAt), { addSuffix: false })}
                                        </span>
                                    </Badge>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 backdrop-blur shadow-sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setSelectedPost(post)}>
                                                <Eye className="mr-2 h-4 w-4" /> View
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setEditDialog({ open: true, postId: post.id, text: post.text || "" })}>
                                                <Edit3 className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                const postDate = new Date(post.scheduledAt);
                                                setScheduleDialog({
                                                    open: true,
                                                    postId: post.id,
                                                    date: postDate,
                                                    time: format(postDate, "HH:mm")
                                                });
                                            }}>
                                                <CalendarIcon className="mr-2 h-4 w-4" /> Reschedule
                                            </DropdownMenuItem>
                                            <Separator className="my-1" />
                                            <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, postId: post.id })} className="text-rose-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Cancel
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <CardContent className="p-4 flex-1">
                                <p className="text-sm line-clamp-3 mb-4 font-medium">{post.text}</p>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-auto">
                                    <div className="flex items-center gap-1" suppressHydrationWarning>
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(post.scheduledAt), "MMM d, h:mm a")}
                                    </div>
                                    <Badge variant="outline" className="text-[10px] h-5 rounded-full border-indigo-100">Scheduled</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Reuse Detail, Edit, Reschedule and Delete Dialogs from PublishedPosts with minor adjustments */}
            <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl">
                    {selectedPost && (
                        <div className="flex flex-col md:flex-row h-[70vh]">
                            <div className="flex-1 bg-slate-50 flex items-center justify-center p-4">
                                {selectedPost.imageUrl ? (
                                    <img src={selectedPost.imageUrl} alt="Post" className="max-w-full max-h-full object-contain" />
                                ) : selectedPost.videoUrl ? (
                                    <video src={selectedPost.videoUrl} controls className="max-w-full max-h-full" />
                                ) : (
                                    <div className="p-12 text-center text-slate-300">
                                        <Linkedin className="h-20 w-20 mx-auto mb-4 opacity-10" />
                                        <p className="text-sm font-bold uppercase tracking-widest">Text Only Post</p>
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-[350px] bg-white p-6 flex flex-col">
                                <ScrollArea className="flex-1 pr-4">
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Scheduled for</div>
                                            <div className="text-sm font-bold text-indigo-900">{format(new Date(selectedPost.scheduledAt), "PPP")}</div>
                                            <div className="text-xs text-indigo-700">{format(new Date(selectedPost.scheduledAt), "p")}</div>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Content</Label>
                                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedPost.text}</p>
                                        </div>
                                    </div>
                                </ScrollArea>
                                <div className="mt-6 pt-6 border-t font-semibold">
                                    <Button variant="outline" className="w-full" onClick={() => setSelectedPost(null)}>Close Preview</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Post</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <Label>Content</Label>
                        <Textarea
                            value={editDialog.text}
                            onChange={(e) => setEditDialog(prev => ({ ...prev, text: e.target.value }))}
                            className="min-h-[200px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, postId: null, text: "" })}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={isPending}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={scheduleDialog.open} onOpenChange={(open) => setScheduleDialog(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Reschedule Post</DialogTitle></DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start h-11 border-slate-200">
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        {format(scheduleDialog.date, "PPP")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={scheduleDialog.date}
                                        onSelect={(date) => date && setScheduleDialog(prev => ({ ...prev, date }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <Input
                                type="time"
                                value={scheduleDialog.time}
                                onChange={(e) => setScheduleDialog(prev => ({ ...prev, time: e.target.value }))}
                                className="h-11 border-slate-200"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setScheduleDialog({ open: false, postId: null, date: new Date(), time: "12:00" })}>Cancel</Button>
                        <Button onClick={() => handleScheduleUpdate(scheduleDialog.postId, scheduleDialog.date, scheduleDialog.time)} disabled={isPending}>
                            Reschedule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete scheduled post?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the post from your queue. You can find your original media in the gallery if you want to recreate it later.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(deleteDialog.postId)} className="bg-rose-600 hover:bg-rose-700">Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
