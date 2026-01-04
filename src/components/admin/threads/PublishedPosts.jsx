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
import { Separator } from "@/components/ui/separator";

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

    const [postContent, setPostContent] = useState({
        message: initialData?.content?.text || initialData?.message || "",
        media: initialData?.mediaUrls || (initialData?.content?.mediaUrl ? [{ url: initialData.content.mediaUrl, type: initialData.content.mediaType }] : []),
    });

    const [scheduling, setScheduling] = useState({
        schedule: !!initialData?.scheduledAt,
        date: initialData?.scheduledAt ? new Date(initialData.scheduledAt) : new Date(),
        time: initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "HH:mm") : "12:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
                    // Auto-select first account if only one
                    if (res.accounts.length === 1) setSelectedAccount(res.accounts[0].accountId);
                }
            }
        }
        loadAccounts();
    }, [selectedAccount]);

    const handleGallerySelect = (selectedItems) => {
        const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
        const newMedia = items.map(item => ({
            url: item.fileUrl,
            name: item.fileName,
            size: item.fileSize,
            type: item.mediaType || (item.fileType?.startsWith('video') ? 'video' : 'image')
        }));

        setPostContent(prev => ({
            ...prev,
            media: [...prev.media, ...newMedia].slice(0, 10)
        }));
        setGalleryOpen(false);
    };

    const removeMedia = (index) => {
        setPostContent(prev => ({
            ...prev,
            media: prev.media.filter((_, i) => i !== index)
        }));
        if (currentSlide >= postContent.media.length - 1) {
            setCurrentSlide(Math.max(0, postContent.media.length - 2));
        }
    };

    const scrollSelection = (direction) => {
        if (selectionScrollRef.current) {
            const scrollAmount = 80;
            selectionScrollRef.current.scrollBy({
                top: direction === 'up' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleSubmit = async () => {
        if (!selectedAccount) return toast.error("Please select a Threads account");
        if (!postContent.message.trim() && postContent.media.length === 0) return toast.error("Thread must have text or media");

        startTransition(async () => {
            try {
                const scheduledTime = scheduling.schedule ? getDateTime(scheduling.date, scheduling.time) : null;

                const result = await createThreadsPost({
                    pageId: selectedAccount,
                    text: postContent.message,
                    mediaUrl: postContent.media[0]?.url,
                    mediaType: postContent.media[0]?.type?.toUpperCase(),
                    scheduling: scheduledTime
                });

                if (result.success) {
                    toast.success(scheduling.schedule ? "Thread scheduled!" : (isEditing ? "Post updated!" : "Thread published!"));
                    onSuccess?.();
                } else {
                    toast.error(result.message || "Failed to create thread");
                }
            } catch (error) {
                toast.error(error.message);
            }
        });
    };

    const characterCount = postContent.message.length;
    const maxCharacters = 500; // Threads limit

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
                    {/* Account Selection */}
                    <div className="space-y-3 px-2">
                        <div className="flex items-center gap-2 opacity-40">
                            <ThreadsLogo className="h-3 w-3 text-black" />
                            <h3 className="text-[8px] font-black text-gray-900 uppercase tracking-[0.3em]"> Profile Selection </h3>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                            {accounts.map((acc) => {
                                const isSelected = selectedAccount === acc.accountId;
                                return (
                                    <div key={acc.id} onClick={() => !isReadOnly && setSelectedAccount(acc.accountId)} className={cn("group relative cursor-pointer transition-all duration-300 flex items-center justify-center rounded-full border p-1 bg-white", isSelected ? "border-black bg-white shadow-lg" : "w-12 h-12 border-gray-100 opacity-60", isReadOnly && "cursor-default")}>
                                        <div className="w-10 h-10 relative">
                                            <div className={cn("w-full h-full rounded-full bg-black p-[2px]", isSelected && "animate-spin-slow")}>
                                                <div className="w-full h-full rounded-full bg-white p-[2px]">
                                                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black overflow-hidden">
                                                        {acc.profilePicture ? <img src={acc.profilePicture} alt="" className="w-full h-full object-cover" /> : acc.username?.charAt(0)}
                                                    </div>
                                                </div>
                                            </div>
                                            {isSelected && <div className="absolute -top-1 -right-1 bg-black text-white rounded-full p-1"><Check className="h-2 w-2" /></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 lg:gap-8 items-start">
                        {/* Editor */}
                        <div className="space-y-6">
                            {/* Strategy */}
                            <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-black" />
                                        <h3 className="text-xs font-black text-gray-900 leading-none">Smart Scheduler</h3>
                                    </div>
                                    <Switch disabled={isReadOnly} checked={scheduling.schedule} onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))} className="data-[state=checked]:bg-black scale-75" />
                                </div>
                                {scheduling.schedule && (
                                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-50">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button disabled={isReadOnly} variant="outline" className="w-full h-8 rounded-lg text-xs justify-start px-2">
                                                    <CalendarIcon className="mr-1.5 h-3 w-3 text-black" /> {scheduling.date ? format(scheduling.date, "MMM dd, yyyy") : "Date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-0 rounded-3xl" align="start">
                                                <Calendar mode="single" selected={scheduling.date} onSelect={(date) => date && setScheduling(prev => ({ ...prev, date }))} disabled={{ before: new Date() }} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <Input disabled={isReadOnly} type="time" value={scheduling.time} onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value }))} className="h-8 rounded-lg text-xs" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-gray-900 uppercase">New Thread</h3>
                                </div>
                                <SocialCaptionEditor
                                    disabled={isReadOnly}
                                    value={postContent.message}
                                    onChange={(e) => setPostContent(prev => ({ ...prev, message: e.target.value }))}
                                    placeholder="Start a thread..."
                                    platform="threads"
                                    className="rounded-xl border-gray-50 bg-gray-50/50 p-4 font-medium text-sm text-gray-800"
                                />
                                <div className="flex justify-end">
                                    <span className={cn("text-[10px] font-black uppercase", characterCount > maxCharacters ? "text-red-500" : "text-gray-300")}>
                                        {characterCount} / {maxCharacters}
                                    </span>
                                </div>

                                <Separator className="bg-gray-50" />
                                <div className="space-y-4">
                                    <Label className="text-sm font-bold text-gray-900">Media</Label>
                                    <Button disabled={isReadOnly} variant="outline" onClick={() => { setGalleryMediaType(["image", "video"]); setGalleryOpen(true); }} className="h-24 w-full rounded-2xl border-2 border-dashed border-gray-100 hover:border-black hover:bg-gray-50 flex flex-col gap-2">
                                        <div className="flex items-center gap-3"><ImageIcon className="h-5 w-5 text-black" /></div>
                                        <span className="text-xs font-black uppercase text-gray-600">Select Media</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Preview & Media Tray */}
                        <div className="lg:sticky top-0 flex gap-4">
                            <div className="flex-1 min-w-0">
                                <ThreadsPreview
                                    content={postContent}
                                    page={accounts.find(a => a.accountId === selectedAccount)}
                                    currentSlide={currentSlide}
                                />
                            </div>

                            {/* Media Selection Tray */}
                            {postContent.media.length > 0 && (
                                <div className="hidden lg:flex flex-col items-center py-2 bg-white rounded-2xl border border-gray-100 shadow-sm w-20 shrink-0 h-fit">
                                    <Button variant="ghost" size="icon" onClick={() => scrollSelection('up')} className="h-6 w-6 text-gray-400 hover:text-black mb-2">
                                        <ChevronUp className="h-4 w-4" />
                                    </Button>

                                    <div ref={selectionScrollRef} className="flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[450px] px-2">
                                        {postContent.media.map((item, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "relative group shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer",
                                                    currentSlide === index
                                                        ? "border-black ring-2 ring-gray-100 scale-105 shadow-md"
                                                        : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-200"
                                                )}
                                                onClick={() => setCurrentSlide(index)}
                                            >
                                                {item.type === 'video' ? (
                                                    <div className="w-full h-full bg-black relative">
                                                        <video src={item.url} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                            <Play className="h-4 w-4 text-white fill-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                                                )}

                                                {!isReadOnly && (
                                                    <div
                                                        onClick={(e) => { e.stopPropagation(); removeMedia(index); }}
                                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[1px]"
                                                    >
                                                        <Trash2 className="h-5 w-5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <Button variant="ghost" size="icon" onClick={() => scrollSelection('down')} className="h-6 w-6 text-gray-400 hover:text-black mt-2">
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            {!isReadOnly && (
                <div className="p-4 border-t bg-white shrink-0 flex justify-end gap-3 px-8">
                    <Button disabled={isPending} onClick={handleSubmit} className="bg-black hover:bg-zinc-800 text-white font-bold rounded-xl px-12 h-11">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEditing ? <Edit className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />)}
                        {isEditing ? "Save Changes" : (scheduling.schedule ? "Schedule Thread" : "Post Thread")}
                    </Button>
                </div>
            )}
            <GalleryModal open={galleryOpen} onOpenChange={setGalleryOpen} onSelect={handleGallerySelect} allowedTypes={galleryMediaType} allowMultiple={true} maxSelection={10} />
        </div>
    );
}

// -----------------------------------------------------------------------------
// MAIN CONTAINER
// -----------------------------------------------------------------------------
export default function PublishedPosts({ accountId: initialAccountId }) {
    const [activeTab, setActiveTab] = useState("calendar");
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
            // Edit not implemented for Threads API yet
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

    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Premium Compact Header - Matching Instagram's Studio Style */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-50/20 p-5 lg:p-6">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-gradient-to-br from-gray-200/10 to-gray-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black border border-gray-800 text-white">
                            <ThreadsLogo className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-wider">Threads Business Academy</span>
                        </div>

                        <div className="space-y-0.5">
                            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-gray-900">
                                Content Studio
                            </h1>
                            <p className="text-gray-500 max-w-md text-xs font-medium leading-relaxed">
                                Elevate your threads presence with precision scheduling and performance intelligence.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex flex-row items-center -space-x-2 mr-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                                    <img src={`https://i.pravatar.cc/150?u=${i + 30}`} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={() => setIsCreating(true)}
                            className="group relative px-6 h-11 bg-black hover:bg-gray-800 text-white font-black rounded-xl shadow-xl shadow-gray-100 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                        >
                            <div className="relative flex items-center gap-2">
                                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                <span className="text-sm">Compose Masterpiece</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white border border-gray-100 p-1 rounded-xl shadow-sm mb-6 h-auto inline-flex">
                    <TabsTrigger value="calendar" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 font-bold text-gray-500 gap-2">
                        <CalendarIcon className="h-4 w-4" /> Calendar View
                    </TabsTrigger>
                    <TabsTrigger value="threads" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white font-bold text-gray-500 gap-2">
                        <LayoutGrid className="h-4 w-4" /> Threads View
                    </TabsTrigger>
                    <TabsTrigger value="listing" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 font-bold text-gray-500 gap-2">
                        <List className="h-4 w-4" /> Listing View
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ThreadsCalendarViewComponent
                        onDateClick={(date) => {
                            // This would ideally prepopulate date, but composer needs to be updated to accept it
                            setIsCreating(true);
                        }}
                        onPostClick={handleEdit}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="threads" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ThreadsViewComponent
                        accountId={initialAccountId}
                        refreshTrigger={refreshTrigger}
                        onEdit={handleEdit}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="listing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ThreadsListingViewComponent
                        accountId={initialAccountId}
                        refreshTrigger={refreshTrigger}
                        onEdit={handleEdit}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>
            </Tabs>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="!w-[80vw] !max-w-[80vw] h-[90vh] overflow-hidden p-0 border-0 bg-transparent shadow-none" showCloseButton={false}>
                    {isCreating && (
                        <div className="bg-white w-full h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                            {/* Modal Header */}
                            <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center justify-between font-sans shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-black rounded-lg shadow-md"><ThreadsLogo className="h-3.5 w-3.5 text-white" /></div>
                                    <div><DialogTitle className="text-sm font-black text-gray-900 leading-none">Post Creator</DialogTitle></div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full hover:bg-gray-100"><X className="h-5 w-5 text-gray-400" /></Button>
                            </div>
                            <CreateThreadsPostForm
                                onSuccess={() => {
                                    setIsCreating(false);
                                    setRefreshTrigger(prev => prev + 1);
                                }}
                            />
                        </div>
                    )}
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
                        <AlertDialogTitle className="text-2xl font-black tracking-tight">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 font-medium pt-2">
                            This will permanently delete the post from our records.
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
