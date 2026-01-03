"use client";

import { useState, useRef, useTransition, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Tabs, TabsList, TabsTrigger, TabsContent
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";
import GalleryModal from "@/components/gallery/GalleryModal";

// Icons
import {
    LayoutGrid, List, Calendar as CalendarIcon, Plus, X,
    ImageIcon, Play, Edit, Trash2, Send, Loader2, Check,
    ChevronUp, ChevronDown, Upload, BarChart3, Clock
} from "lucide-react";

// Server Actions
import {
    getThreadsPosts, deleteThreadsPost, getAllThreadsCalendarPosts, publishThreadsPostNow
} from "@/app/actions/social/threads/threadsPostsActions";
import { createThreadsPost, getUserThreadsAccounts } from "@/app/actions/social/threads/createPost";
import { getDateTime } from "@/lib/utils";

// Internal Components
import ThreadsCalendarViewComponent from "./ThreadsCalendarViewComponent";
import ThreadsViewComponent from "./ThreadsViewComponent";
import ThreadsListingViewComponent from "./ThreadsListingViewComponent";
import ThreadsPreview from "./ThreadsPreview";
import ThreadsAnalyticsModal from "./ThreadsAnalyticsModal";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";

// -----------------------------------------------------------------------------
// CREATE POST FORM
// -----------------------------------------------------------------------------
function CreateThreadsPostForm({ initialData = null, onSuccess = null }) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!initialData?.id;
    const isReadOnly = initialData?.readOnly || false;

    const [postType, setPostType] = useState(initialData?.postType || "text");
    const [postContent, setPostContent] = useState({
        message: initialData?.content?.text || initialData?.message || "",
        media: initialData?.mediaUrls || (initialData?.content?.mediaUrl ? [{ url: initialData.content.mediaUrl, type: initialData.content.mediaType }] : []),
    });

    const [scheduling, setScheduling] = useState({
        schedule: !!initialData?.scheduledAt,
        date: initialData?.scheduledAt ? new Date(initialData.scheduledAt) : new Date(),
        time: initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "HH:mm") : "12:00",
    });

    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(initialData?.accountId || null);

    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryMediaType, setGalleryMediaType] = useState("image");
    const [currentSlide, setCurrentSlide] = useState(0);
    const selectionScrollRef = useRef(null);

    useEffect(() => {
        async function loadAccounts() {
            const res = await getUserThreadsAccounts();
            if (res.success) {
                setAccounts(res.accounts || []);
                if (res.accounts.length > 0 && !selectedAccount) {
                    // We don't auto-select here to force user choice if multiple
                }
            }
        }
        loadAccounts();
    }, [selectedAccount]);

    const handleGallerySelect = (selectedItems) => {
        const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
        const newMedia = items.map(item => ({
            url: item.fileUrl,
            type: item.mediaType || (item.fileType?.startsWith('video') ? 'video' : 'image')
        }));

        setPostContent(prev => ({
            ...prev,
            media: [...prev.media, ...newMedia].slice(0, 10) // Threads up to 10
        }));
        setGalleryOpen(false);
    };

    const removeMedia = (index) => {
        setPostContent(prev => ({
            ...prev,
            media: prev.media.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (!selectedAccount) return toast.error("Please select a Threads account");
        if (!postContent.message.trim() && postContent.media.length === 0) return toast.error("Post must have text or media");

        startTransition(async () => {
            try {
                const scheduledTime = scheduling.schedule ? getDateTime(scheduling.date, scheduling.time) : null;

                // For simplified Threads module, we assume single media for now as per createPost.js
                const result = await createThreadsPost({
                    pageId: selectedAccount,
                    text: postContent.message,
                    mediaUrl: postContent.media[0]?.url,
                    mediaType: postContent.media[0]?.type?.toUpperCase(),
                    scheduling: scheduledTime
                });

                if (result.success) {
                    toast.success(scheduling.schedule ? "Thread scheduled!" : "Thread published!");
                    onSuccess?.();
                } else {
                    toast.error(result.message || "Failed to create thread");
                }
            } catch (error) {
                toast.error(error.message);
            }
        });
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                    <div className="space-y-6">
                        {/* Accounts */}
                        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Select Account</h3>
                            <div className="flex flex-wrap gap-3">
                                {accounts.map(acc => (
                                    <div
                                        key={acc.id}
                                        onClick={() => setSelectedAccount(acc.accountId)}
                                        className={cn(
                                            "flex items-center gap-2 p-2 rounded-full border cursor-pointer transition-all",
                                            selectedAccount === acc.accountId ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 hover:border-gray-300"
                                        )}
                                    >
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage src={acc.profilePicture} />
                                            <AvatarFallback>{acc.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-bold pr-2">{acc.username}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Composer */}
                        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm space-y-4">
                            <SocialCaptionEditor
                                value={postContent.message}
                                onChange={(e) => setPostContent(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Start a thread..."
                                platform="threads"
                                className="min-h-[150px] text-lg font-medium border-none p-0 focus-visible:ring-0 shadow-none"
                            />

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full h-9 px-4 font-bold border-gray-200"
                                    onClick={() => {
                                        setGalleryMediaType(["image", "video"]);
                                        setGalleryOpen(true);
                                    }}
                                >
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    Add Media
                                </Button>
                            </div>

                            {postContent.media.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {postContent.media.map((m, i) => (
                                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                                            <img src={m.url} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeMedia(i)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Scheduling */}
                        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <h3 className="text-sm font-bold">Schedule Post</h3>
                                </div>
                                <Switch checked={scheduling.schedule} onCheckedChange={(c) => setScheduling(s => ({ ...s, schedule: c }))} />
                            </div>
                            {scheduling.schedule && (
                                <div className="grid grid-cols-2 gap-3">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="justify-start font-bold rounded-xl h-11 border-gray-100">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {format(scheduling.date, "PPP")}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0 border-none rounded-2xl shadow-2xl">
                                            <Calendar
                                                mode="single"
                                                selected={scheduling.date}
                                                onSelect={(d) => d && setScheduling(s => ({ ...s, date: d }))}
                                                disabled={{ before: new Date() }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        type="time"
                                        value={scheduling.time}
                                        onChange={(e) => setScheduling(s => ({ ...s, time: e.target.value }))}
                                        className="h-11 rounded-xl border-gray-100 font-bold"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Live Preview</h3>
                        <ThreadsPreview
                            content={postContent}
                            page={accounts.find(a => a.accountId === selectedAccount)}
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t flex justify-end px-12">
                <Button
                    disabled={isPending}
                    onClick={handleSubmit}
                    className="h-12 px-10 rounded-full bg-black text-white font-black hover:bg-gray-800"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {scheduling.schedule ? "Schedule Thread" : "Post Thread"}
                </Button>
            </div>

            <GalleryModal
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                onSelect={handleGallerySelect}
                allowedTypes={galleryMediaType}
                maxSelection={1} // Match backend for now
            />
        </div>
    );
}

// -----------------------------------------------------------------------------
// MAIN CONTAINER
// -----------------------------------------------------------------------------
export default function PublishedPosts({ accountId: initialAccountId }) {
    const [activeTab, setActiveTab] = useState("threads");
    const [isCreating, setIsCreating] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [analyticsModal, setAnalyticsModal] = useState({ open: false, post: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });

    const handleEdit = (post, action = 'edit') => {
        if (action === 'analytics') {
            setAnalyticsModal({ open: true, post });
        } else if (action === 'delete') {
            setDeleteDialog({ open: true, postId: post.id });
        } else {
            // Edit not implemented for Threads API yet, but we can show composer
            setIsCreating(true);
        }
    };

    const handleDelete = async () => {
        const res = await deleteThreadsPost(deleteDialog.postId);
        if (res.success) {
            toast.success("Post deleted");
            setRefreshTrigger(p => p + 1);
        } else {
            toast.error(res.message);
        }
        setDeleteDialog({ open: false, postId: null });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-black rounded-full border border-gray-800 text-white">
                        <ThreadsLogo className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Threads Studio</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Threads Manager</h1>
                    <p className="text-gray-500 font-medium text-sm">Create, schedule and analyze your Threads content.</p>
                </div>

                <Button
                    onClick={() => setIsCreating(true)}
                    className="h-14 px-8 bg-black text-white hover:bg-gray-800 rounded-2xl font-black shadow-xl shadow-gray-100 gap-2 text-base transition-all hover:scale-[1.02] active:scale-95 border-0"
                >
                    <Plus className="h-5 w-5" />
                    Compose Thread
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white border p-1 rounded-2xl mb-8">
                    <TabsTrigger value="calendar" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-gray-100 gap-2">
                        <CalendarIcon className="h-4 w-4" /> Calendar
                    </TabsTrigger>
                    <TabsTrigger value="threads" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-gray-100 gap-2">
                        <LayoutGrid className="h-4 w-4" /> Feed View
                    </TabsTrigger>
                    <TabsTrigger value="listing" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-gray-100 gap-2">
                        <List className="h-4 w-4" /> Listing
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar">
                    <ThreadsCalendarViewComponent
                        onDateClick={() => setIsCreating(true)}
                        onPostClick={handleEdit}
                        refreshTrigger={refreshTrigger}
                        onRefresh={() => setRefreshTrigger(p => p + 1)}
                    />
                </TabsContent>

                <TabsContent value="threads">
                    <ThreadsViewComponent
                        accountId={initialAccountId}
                        refreshTrigger={refreshTrigger}
                        onEdit={handleEdit}
                        onRefresh={() => setRefreshTrigger(p => p + 1)}
                    />
                </TabsContent>

                <TabsContent value="listing">
                    <ThreadsListingViewComponent
                        accountId={initialAccountId}
                        refreshTrigger={refreshTrigger}
                        onEdit={handleEdit}
                        onRefresh={() => setRefreshTrigger(p => p + 1)}
                    />
                </TabsContent>
            </Tabs>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden border-none rounded-[32px]">
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b bg-white flex items-center justify-between px-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-black rounded-xl">
                                    <ThreadsLogo className="h-4 w-4 text-white" />
                                </div>
                                <DialogTitle className="text-lg font-black tracking-tight">Compose Thread</DialogTitle>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full hover:bg-gray-100">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <CreateThreadsPostForm
                            onSuccess={() => {
                                setIsCreating(false);
                                setRefreshTrigger(p => p + 1);
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <ThreadsAnalyticsModal
                open={analyticsModal.open}
                onOpenChange={(o) => setAnalyticsModal(p => ({ ...p, open: o }))}
                post={analyticsModal.post}
            />

            <AlertDialog open={deleteDialog.open} onOpenChange={(o) => setDeleteDialog(p => ({ ...p, open: o }))}>
                <AlertDialogContent className="rounded-[32px] border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black">Delete this thread?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 font-medium pt-2">
                            This will remove the thread from your history. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-6">
                        <AlertDialogCancel className="rounded-xl font-bold border-gray-100">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl h-11 px-8">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
