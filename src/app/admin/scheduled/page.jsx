"use client";

import { useState, useEffect, useCallback } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
    Calendar as CalendarIcon, Layers, Clock, Search, Trash2, Edit3, CalendarClock, Loader2, X,
    Image as ImageIcon, Video, FileText, Eye, Facebook, Instagram
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
    Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import debounce from "lodash/debounce";

// Server Actions
import {
    getUnifiedScheduledPosts, getCurrentUser, getAllConnectedAccounts,
    deleteScheduledPost, updateScheduledPostContent, reschedulePost
} from "@/app/actions/scheduled/scheduledActions";

// Custom Brand Icons
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import PinterestLogo from "@/components/icons/PinterestLogo";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";
import { XLogo } from "@/components/icons/XLogo";
import { LinkedinLogo } from "@/components/icons/LinkedinLogo";

export default function ScheduledPage() {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [accounts, setAccounts] = useState([]);

    // Pagination
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);

    // Filters
    const [date, setDate] = useState();
    const [platform, setPlatform] = useState("all");
    const [postType, setPostType] = useState("all");
    const [accountId, setAccountId] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Dialogs
    const [editDialog, setEditDialog] = useState({ open: false, post: null, content: "" });
    const [rescheduleDialog, setRescheduleDialog] = useState({ open: false, post: null, date: new Date(), time: "12:00" });
    const [previewDialog, setPreviewDialog] = useState({ open: false, post: null });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        async function init() {
            const user = await getCurrentUser();
            setCurrentUser(user);
            const accountsRes = await getAllConnectedAccounts();
            if (accountsRes.success) {
                setAccounts(accountsRes.accounts);
            }
        }
        init();
    }, []);

    useEffect(() => {
        fetchPosts(true);
    }, [date, platform, postType, accountId]);

    const debouncedSearch = useCallback(
        debounce(() => {
            fetchPosts(true);
        }, 500),
        [date, platform, postType, accountId]
    );

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        debouncedSearch();
    };

    async function fetchPosts(reset = false) {
        if (reset) {
            setLoading(true);
            setPosts([]);
            setNextCursor(null);
        } else {
            setLoadingMore(true);
        }

        try {
            const res = await getUnifiedScheduledPosts({
                platform,
                postType,
                accountId,
                searchQuery,
                startDate: date?.from ? date.from.toISOString() : null,
                endDate: date?.to ? date.to.toISOString() : null,
                pageSize: 20,
                cursor: reset ? null : nextCursor
            });

            if (res.success) {
                if (reset) {
                    setPosts(res.posts);
                } else {
                    setPosts(prev => [...prev, ...res.posts]);
                }
                setHasMore(res.hasMore);
                setNextCursor(res.nextCursor);
            } else {
                toast.error(res.message || "Failed to load posts");
            }
        } catch (error) {
            toast.error("Failed to load scheduled posts");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    const handleDelete = async (post) => {
        toast("Are you sure you want to delete this scheduled post?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        const res = await deleteScheduledPost(post.id, post.platform);
                        if (res.success) {
                            toast.success("Post deleted successfully");
                            setPosts(posts.filter(p => p.id !== post.id));
                        } else {
                            toast.error(res.message);
                        }
                    } catch (error) {
                        toast.error("Failed to delete post");
                    }
                },
            },
        });
    };

    const handleEdit = async () => {
        if (!editDialog.post || !editDialog.content.trim()) return;
        setActionLoading(true);
        try {
            const res = await updateScheduledPostContent(editDialog.post.id, editDialog.post.platform, editDialog.content);
            if (res.success) {
                toast.success("Post updated successfully");
                setPosts(posts.map(p => p.id === editDialog.post.id ? { ...p, caption: editDialog.content } : p));
                setEditDialog({ open: false, post: null, content: "" });
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to update post");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleDialog.post) return;
        setActionLoading(true);
        try {
            const newDateTime = new Date(`${format(rescheduleDialog.date, "yyyy-MM-dd")}T${rescheduleDialog.time}`);
            const res = await reschedulePost(rescheduleDialog.post.id, rescheduleDialog.post.platform, newDateTime.toISOString());
            if (res.success) {
                toast.success("Post rescheduled successfully");
                setPosts(posts.map(p => p.id === rescheduleDialog.post.id ? { ...p, scheduledAt: newDateTime.toISOString() } : p));
                setRescheduleDialog({ open: false, post: null, date: new Date(), time: "12:00" });
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to reschedule post");
        } finally {
            setActionLoading(false);
        }
    };

    const PlatformIcon = ({ platform, className }) => {
        switch (platform) {
            case 'facebook': return <Facebook className={className} />;
            case 'instagram': return <Instagram className={className} />;
            case 'twitter': return <XLogo className={className} />;
            case 'linkedin': return <LinkedinLogo className={className} />;
            case 'tiktok': return <TiktokLogo className={className} />;
            case 'pinterest': return <PinterestLogo className={className} />;
            case 'threads': return <ThreadsLogo className={className} />;
            case 'bluesky': return <BlueSkyLogo className={className} />;
            default: return <Layers className={className} />;
        }
    };

    const getPlatformBadge = (platform) => {
        const colorMap = {
            'facebook': "bg-blue-100 text-blue-700 border-blue-200",
            'instagram': "bg-pink-100 text-pink-700 border-pink-200",
            'twitter': "bg-sky-100 text-sky-700 border-sky-200",
            'linkedin': "bg-blue-100 text-blue-800 border-blue-200",
            'tiktok': "bg-slate-100 text-slate-700 border-slate-200",
            'pinterest': "bg-red-100 text-red-700 border-red-200",
            'threads': "bg-slate-100 text-slate-700 border-slate-200",
            'bluesky': "bg-sky-100 text-sky-600 border-sky-200",
        };
        const color = colorMap[platform] || "bg-slate-100 text-slate-700 border-slate-200";

        return (
            <span className={`px-2 py-0.5 rounded-[4px] border text-[10px] font-black uppercase tracking-wider w-fit flex items-center gap-1 ${color}`}>
                <PlatformIcon platform={platform} className="h-3 w-3" />
                {platform}
            </span>
        );
    };

    const getPostTypeBadge = (type) => {
        const colorMap = {
            'video': "bg-purple-100 text-purple-700 border-purple-200",
            'image': "bg-green-100 text-green-700 border-green-200",
            'text': "bg-slate-100 text-slate-700 border-slate-200",
        };
        const color = colorMap[type] || colorMap['text'];
        const icons = {
            'video': <Video className="h-3 w-3" />,
            'image': <ImageIcon className="h-3 w-3" />,
            'text': <FileText className="h-3 w-3" />,
        };

        return (
            <span className={`px-2 py-0.5 rounded-[4px] border text-[10px] font-black uppercase tracking-wider w-fit flex items-center gap-1 ${color}`}>
                {icons[type] || icons['text']}
                {type}
            </span>
        );
    };

    if (loading) return <Spinner />;

    return (
        <div className="p-6">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-xl font-semibold">Scheduled Posts</CardTitle>
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-9 h-9 w-48"
                            />
                        </div>

                        {/* Platform Filter */}
                        <Select value={platform} onValueChange={setPlatform}>
                            <SelectTrigger className="w-[130px] h-9">
                                <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Platforms</SelectItem>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="twitter">Twitter</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="pinterest">Pinterest</SelectItem>
                                <SelectItem value="threads">Threads</SelectItem>
                                <SelectItem value="bluesky">Bluesky</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Post Type Filter */}
                        <Select value={postType} onValueChange={setPostType}>
                            <SelectTrigger className="w-[100px] h-9">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {posts.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="mb-4">No scheduled posts found.</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableCaption>A list of all scheduled posts across platforms.</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Platform</TableHead>
                                        <TableHead>Account</TableHead>
                                        <TableHead>Content</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Scheduled</TableHead>
                                        {currentUser?.role === 'Administrator' && <TableHead>Author</TableHead>}
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.map((post) => (
                                        <TableRow key={`${post.platform}-${post.id}`} className="hover:bg-gray-50">
                                            <TableCell>
                                                {getPlatformBadge(post.platform)}
                                            </TableCell>
                                            <TableCell>
                                                {post.account ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={post.account.profilePicture} />
                                                            <AvatarFallback className="text-[9px]">{post.account.name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm font-medium truncate max-w-[120px]">{post.account.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-gray-700 line-clamp-1 max-w-[200px]">
                                                    {post.caption || <span className="text-gray-400 italic">No caption</span>}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {getPostTypeBadge(post.postType)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{format(new Date(post.scheduledAt), "MMM d, h:mm a")}</span>
                                                    <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(post.scheduledAt), { addSuffix: true })}</span>
                                                </div>
                                            </TableCell>
                                            {currentUser?.role === 'Administrator' && (
                                                <TableCell>
                                                    {post.author ? (
                                                        <span className="text-sm">{post.author.name}</span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </TableCell>
                                            )}
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const postDate = new Date(post.scheduledAt);
                                                        setRescheduleDialog({
                                                            open: true,
                                                            post,
                                                            date: postDate,
                                                            time: format(postDate, "HH:mm")
                                                        });
                                                    }}
                                                >
                                                    Reschedule
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(post)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Load More */}
                            {hasMore && (
                                <div className="flex justify-center pt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => fetchPosts(false)}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, post: null, content: "" })}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Post Content</DialogTitle>
                        <DialogDescription>Update the caption or message for this scheduled post.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Content</Label>
                        <Textarea
                            value={editDialog.content}
                            onChange={(e) => setEditDialog(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Enter your content..."
                            className="min-h-[120px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, post: null, content: "" })}>Cancel</Button>
                        <Button onClick={handleEdit} disabled={actionLoading || !editDialog.content.trim()}>
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reschedule Dialog */}
            <Dialog open={rescheduleDialog.open} onOpenChange={(open) => setRescheduleDialog({ open, post: null, date: new Date(), time: "12:00" })}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reschedule Post</DialogTitle>
                        <DialogDescription>Choose a new date and time for this post.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(rescheduleDialog.date, "PPP")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={rescheduleDialog.date}
                                        onSelect={(date) => setRescheduleDialog(prev => ({ ...prev, date: date || new Date() }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Time</Label>
                            <Input
                                type="time"
                                value={rescheduleDialog.time}
                                onChange={(e) => setRescheduleDialog(prev => ({ ...prev, time: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRescheduleDialog({ open: false, post: null, date: new Date(), time: "12:00" })}>Cancel</Button>
                        <Button onClick={handleReschedule} disabled={actionLoading}>
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reschedule"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={previewDialog.open} onOpenChange={(open) => setPreviewDialog({ open, post: null })}>
                <DialogContent className="max-w-2xl">
                    {previewDialog.post && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="capitalize flex items-center gap-2">
                                    <PlatformIcon platform={previewDialog.post.platform} className="h-5 w-5" />
                                    {previewDialog.post.platform} Post
                                </DialogTitle>
                                <DialogDescription>
                                    Scheduled for {format(new Date(previewDialog.post.scheduledAt), "MMMM d, yyyy 'at' h:mm a")}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                {previewDialog.post.account && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={previewDialog.post.account.profilePicture} />
                                            <AvatarFallback>{previewDialog.post.account.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold">{previewDialog.post.account.name}</div>
                                            {previewDialog.post.account.username && (
                                                <div className="text-sm text-gray-500">@{previewDialog.post.account.username}</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {previewDialog.post.media && previewDialog.post.media.length > 0 && (
                                    <div className="rounded-lg overflow-hidden bg-gray-100">
                                        <img src={previewDialog.post.media[0].url} alt="" className="w-full max-h-[300px] object-contain" />
                                    </div>
                                )}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Content</Label>
                                    <p className="text-gray-700 whitespace-pre-wrap">{previewDialog.post.caption || "No caption"}</p>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
