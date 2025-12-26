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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Linkedin, MoreVertical, ExternalLink, Trash2, Calendar as CalendarIcon,
    Search, Eye, Edit3, Loader2, Clock, Globe, X, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { deletelinkedinPost,replaceLinkedinPost } from "@/app/actions/social/linkedin/createPost";
import { fetchLinkedinPosts, getUserLinkedinAccounts } from "@/app/actions/social/linkedin/linkedinPostsActions";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

export default function PublishedPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [selectedPost, setSelectedPost] = useState(null);
    const [editDialog, setEditDialog] = useState({ open: false, postId: null, text: "" });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });

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
            const res = await fetchLinkedinPosts();
            if (res.success) {
                setPosts(res.posts);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to load posts");
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
                    setPosts(prev => prev.filter(p => p.id !== postId));
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
                const res = await replaceLinkedinPost(editDialog.postId, {
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
                toast.error("Failed to update post");
            }
        });
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = !searchQuery || post.text?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAccount = filters.accountId === "all" || post.accountId === filters.accountId;
        const matchesDate = !filters.startDate || (post.createdAt && new Date(post.createdAt) >= new Date(filters.startDate));
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
            <Card className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                            <Linkedin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold text-gray-900">Published Posts</CardTitle>
                            <CardDescription>View and manage your LinkedIn activity</CardDescription>
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
                                placeholder="Search posts..."
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
                <Card className="border-dashed py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No posts found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or create a new post.</p>
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
                                    <div className="relative w-full h-full">
                                        <video src={post.videoUrl} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Loader2 className="h-8 w-8 text-white opacity-50" />
                                        </div>
                                    </div>
                                ) : (
                                    <FileText className="h-12 w-12 text-slate-300" />
                                )}
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
                                            {post.linkedinPostId && (
                                                <DropdownMenuItem onClick={() => window.open(`https://www.linkedin.com/feed/update/${post.linkedinPostId}`, '_blank')}>
                                                    <ExternalLink className="mr-2 h-4 w-4" /> LinkedIn
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => setEditDialog({ open: true, postId: post.id, text: post.text || "" })}>
                                                <Edit3 className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <Separator className="my-1" />
                                            <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, postId: post.id })} className="text-rose-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <CardContent className="p-4 flex-1">
                                <p className="text-sm line-clamp-3 mb-4 font-medium">{post.text}</p>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-auto">
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-3 w-3" />
                                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                                    </div>
                                    <Badge variant="outline" className="text-[10px] h-5 rounded-full">LinkedIn</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

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
                                        <div>
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Content</Label>
                                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedPost.text}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Post Details</Label>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500">Platform</span>
                                                    <span className="font-bold">LinkedIn</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500">Date</span>
                                                    <span className="font-bold">{format(new Date(selectedPost.createdAt), "PPP")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                                <div className="mt-6 pt-6 border-t font-semibold">
                                    {selectedPost.linkedinPostId && (
                                        <Button className="w-full bg-[#0A66C2] hover:bg-[#004182]" onClick={() => window.open(`https://www.linkedin.com/feed/update/${selectedPost.linkedinPostId}`, '_blank')}>
                                            <ExternalLink className="h-4 w-4 mr-2" /> View on LinkedIn
                                        </Button>
                                    )}
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
                        <Button onClick={handleUpdate} disabled={isPending}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the post from your dashboard. LinkedIn posts published externally cannot be deleted via the API in this version.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(deleteDialog.postId)} className="bg-rose-600 hover:bg-rose-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
