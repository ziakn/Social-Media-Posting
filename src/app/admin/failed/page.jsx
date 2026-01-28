"use client";

import { useState, useEffect, useCallback } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
    Search, Trash2, RefreshCw, Loader2, AlertTriangle, Layers, CalendarClock,
    Image as ImageIcon, Video, FileText, Facebook, Instagram, Calendar as CalendarIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getCurrentUser } from "@/app/actions/scheduled/scheduledActions";
import { getFailedPosts, rescheduleFailedPost, deleteFailedPost } from "@/app/actions/failed/failedActions";

// Custom Brand Icons
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import PinterestLogo from "@/components/icons/PinterestLogo";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";
import { XLogo } from "@/components/icons/XLogo";
import { LinkedinLogo } from "@/components/icons/LinkedinLogo";

export default function FailedPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [platform, setPlatform] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState({});
    const [rescheduleDialog, setRescheduleDialog] = useState({ open: false, post: null, date: new Date(), time: "12:00" });

    useEffect(() => {
        async function init() {
            const user = await getCurrentUser();
            setCurrentUser(user);
        }
        init();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [platform]);

    const debouncedSearch = useCallback(
        debounce(() => {
            fetchPosts();
        }, 500),
        [platform]
    );

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        debouncedSearch();
    };

    async function fetchPosts() {
        setLoading(true);
        try {
            const res = await getFailedPosts({
                platform,
                searchQuery
            });

            if (res.success) {
                setPosts(res.posts);
            } else {
                toast.error(res.message || "Failed to load posts");
            }
        } catch (error) {
            toast.error("Failed to load failed posts");
        } finally {
            setLoading(false);
        }
    }

    const handleReschedule = async () => {
        if (!rescheduleDialog.post) return;
        setActionLoading(prev => ({ ...prev, [rescheduleDialog.post.id]: 'reschedule' }));
        try {
            const newDateTime = new Date(`${format(rescheduleDialog.date, "yyyy-MM-dd")}T${rescheduleDialog.time}`);
            const res = await rescheduleFailedPost(rescheduleDialog.post.id, rescheduleDialog.post.platform, newDateTime.toISOString());
            if (res.success) {
                toast.success("Post rescheduled successfully");
                setPosts(posts.filter(p => p.id !== rescheduleDialog.post.id));
                setRescheduleDialog({ open: false, post: null, date: new Date(), time: "12:00" });
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to reschedule post");
        } finally {
            setActionLoading(prev => ({ ...prev, [rescheduleDialog.post.id]: null }));
        }
    };

    const handleDelete = async (post) => {
        toast("Are you sure you want to delete this failed post?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    setActionLoading(prev => ({ ...prev, [post.id]: 'delete' }));
                    try {
                        const res = await deleteFailedPost(post.id, post.platform);
                        if (res.success) {
                            toast.success("Post deleted successfully");
                            setPosts(posts.filter(p => p.id !== post.id));
                        } else {
                            toast.error(res.message);
                        }
                    } catch (error) {
                        toast.error("Failed to delete post");
                    } finally {
                        setActionLoading(prev => ({ ...prev, [post.id]: null }));
                    }
                },
            },
        });
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
                    <div>
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Failed Posts
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                            Review posts that failed to publish and retry them.
                            {posts.length > 0 && <span className="ml-2 text-red-600 font-bold">{posts.length} failed</span>}
                        </p>
                    </div>
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

                        <Button variant="outline" size="sm" onClick={fetchPosts}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {posts.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="h-8 w-8 text-green-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-900 mb-2">No failed posts!</p>
                            <p className="text-gray-500">All your posts are publishing successfully.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableCaption>A list of posts that failed to publish.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Platform</TableHead>
                                    <TableHead>Content</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Error</TableHead>
                                    <TableHead>Failed At</TableHead>
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
                                            <p className="text-sm text-gray-700 line-clamp-1 max-w-[200px]">
                                                {post.caption || <span className="text-gray-400 italic">No caption</span>}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            {getPostTypeBadge(post.postType)}
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-red-600 font-medium line-clamp-2 max-w-[250px]">
                                                {post.errorMessage}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {post.failedAt ? format(new Date(post.failedAt), "MMM d, h:mm a") : "—"}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {post.failedAt ? formatDistanceToNow(new Date(post.failedAt), { addSuffix: true }) : ""}
                                                </span>
                                            </div>
                                        </TableCell>
                                        {currentUser?.role === 'Administrator' && (
                                            <TableCell>
                                                {post.author ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={post.author.avatar} />
                                                            <AvatarFallback className="text-[9px]">{post.author.name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm">{post.author.name}</span>
                                                    </div>
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
                                                    const postDate = post.failedAt ? new Date(post.failedAt) : new Date();
                                                    setRescheduleDialog({
                                                        open: true,
                                                        post,
                                                        date: postDate,
                                                        time: "12:00"
                                                    });
                                                }}
                                                disabled={actionLoading[post.id] === 'reschedule'}
                                                className="gap-1"
                                            >
                                                {actionLoading[post.id] === 'reschedule' ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <CalendarClock className="h-3 w-3" />
                                                )}
                                                Reschedule
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(post)}
                                                disabled={actionLoading[post.id] === 'delete'}
                                            >
                                                {actionLoading[post.id] === 'delete' ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    "Delete"
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Reschedule Dialog */}
            <Dialog open={rescheduleDialog.open} onOpenChange={(open) => setRescheduleDialog({ open, post: null, date: new Date(), time: "12:00" })}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reschedule Failed Post</DialogTitle>
                        <DialogDescription>Choose a new date and time to retry publishing this post.</DialogDescription>
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
                        <Button onClick={handleReschedule} disabled={actionLoading[rescheduleDialog.post?.id] === 'reschedule'}>
                            {actionLoading[rescheduleDialog.post?.id] === 'reschedule' ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reschedule"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
