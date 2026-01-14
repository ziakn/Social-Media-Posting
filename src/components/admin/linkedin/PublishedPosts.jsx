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
    ChevronUp, ChevronDown, Upload, BarChart3, Clock,
    FileText, Film, Link2
} from "lucide-react";

// Server Actions
import {
    getLinkedinPosts, deleteLinkedinPost, getAllLinkedinCalendarPosts, publishLinkedinPostNow, updateLinkedinPostAction, fetchLinkedinAccounts
} from "@/app/actions/social/linkedin/linkedinPostsActions";
import { createLinkedinPost } from "@/app/actions/social/linkedin/createPost";
import { getDateTime } from "@/lib/utils";

// Internal Components
import LinkedinCalendarViewComponent from "./LinkedinCalendarViewComponent";
import LinkedinViewComponent from "./LinkedinViewComponent";
import LinkedinListingViewComponent from "./LinkedinListingViewComponent";
import LinkedinPreview from "./LinkedinPreview";
import LinkedinAnalyticsModal from "./LinkedinAnalyticsModal";
import { LinkedinLogo } from "@/components/icons/LinkedinLogo";

// -----------------------------------------------------------------------------
// CREATE POST FORM
// -----------------------------------------------------------------------------
function CreateLinkedinPostForm({ initialData = null, onSuccess = null }) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!initialData?.id;
    const isReadOnly = initialData?.readOnly || false;

    const [postType, setPostType] = useState(initialData?.postType || "text");
    const [postContent, setPostContent] = useState({
        message: initialData?.text || initialData?.message || "",
        media: initialData?.imageUrl || initialData?.videoUrl ? [
            { url: initialData.imageUrl || initialData.videoUrl, type: initialData.imageUrl ? 'image' : 'video' }
        ] : [],
        link: initialData?.link || ""
    });

    const [scheduling, setScheduling] = useState({
        schedule: !!initialData?.scheduling?.schedule || !!initialData?.scheduledAt,
        date: initialData?.scheduling?.date || (initialData?.scheduledAt ? new Date(initialData.scheduledAt) : new Date()),
        time: initialData?.scheduling?.time || (initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "HH:mm") : "12:00"),
        timezone: initialData?.scheduling?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(initialData?.accountId || null);

    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryMediaType, setGalleryMediaType] = useState("image");

    useEffect(() => {
        async function loadAccounts() {
            const res = await fetchLinkedinAccounts();
            if (res.success) {
                const accs = res.accounts || [];
                setAccounts(accs);
            }
        }
        loadAccounts();
    }, [initialData?.accountId]);

    const handleGallerySelect = (selectedItems) => {
        const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
        const newMedia = items.map(item => ({
            url: item.fileUrl,
            name: item.fileName,
            size: item.fileSize,
            type: item.mediaType || (item.fileType?.startsWith('video') ? 'video' : 'image')
        }));

        if (galleryMediaType === 'video') {
            setPostContent(prev => ({ ...prev, media: [newMedia[0]] }));
        } else {
            // LinkedIn component currently handles single image mostly via action
            setPostContent(prev => ({ ...prev, media: [newMedia[0]] }));
        }

        setGalleryOpen(false);
    };

    const handleSubmit = () => {
        if (!selectedAccount) {
            toast.error("Please select a LinkedIn account");
            return;
        }

        const payload = {
            text: postContent.message,
            accountId: selectedAccount,
            scheduledTime: scheduling.schedule ? new Date(`${format(scheduling.date, "yyyy-MM-dd")}T${scheduling.time}`) : null,
            imageUrl: postType === 'images' && postContent.media[0]?.type === 'image' ? postContent.media[0].url : null,
            videoUrl: postType === 'video' && postContent.media[0]?.type === 'video' ? postContent.media[0].url : null,
        };

        if (postType === 'link' && postContent.link) {
            payload.text = `${postContent.message}\n\n${postContent.link}`;
        }

        startTransition(async () => {
            try {
                let res;
                if (isEditing) {
                    res = await updateLinkedinPostAction({
                        postId: initialData.id,
                        accountId: selectedAccount,
                        text: payload.text,
                        imageUrl: payload.imageUrl,
                        videoUrl: payload.videoUrl,
                        scheduledAt: payload.scheduledTime
                    });
                } else {
                    res = await createLinkedinPost(payload);
                }

                if (res.success) {
                    toast.success(res.message);
                    if (onSuccess) onSuccess();
                } else {
                    toast.error(res.message);
                }
            } catch (err) {
                toast.error("Failed to submit post");
            }
        });
    };

    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-gray-500">Select Account</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                        <SelectTrigger className="w-full h-12 rounded-xl border-gray-200">
                            <SelectValue placeholder="Select LinkedIn Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>{acc.displayName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Tabs value={postType} onValueChange={setPostType} className="w-full">
                    <TabsList className="grid grid-cols-4 w-full bg-gray-50/50 p-1 rounded-xl">
                        <TabsTrigger value="text" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"><FileText className="h-4 w-4" /> Text</TabsTrigger>
                        <TabsTrigger value="images" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"><ImageIcon className="h-4 w-4" /> Images</TabsTrigger>
                        <TabsTrigger value="video" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"><Film className="h-4 w-4" /> Video</TabsTrigger>
                        <TabsTrigger value="link" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"><Link2 className="h-4 w-4" /> Link</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="pt-4 animate-in slide-in-from-top-2">
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-wider text-gray-500">Post Content</Label>
                            <SocialCaptionEditor
                                value={postContent.message}
                                onChange={(e) => setPostContent(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="What do you want to talk about?"
                                platform="linkedin"
                                className="min-h-[150px] rounded-xl"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="images" className="pt-4 space-y-4 animate-in slide-in-from-top-2">
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-wider text-gray-500">Caption</Label>
                            <SocialCaptionEditor
                                value={postContent.message}
                                onChange={(e) => setPostContent(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Add a caption..."
                                platform="linkedin"
                                className="min-h-[100px] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            {postContent.media.length > 0 && postContent.media[0].type === 'image' ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
                                    <img src={postContent.media[0].url} className="w-full h-full object-cover" />
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setPostContent(prev => ({ ...prev, media: [] }))}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] rounded-md backdrop-blur-sm">Image Selected</div>
                                </div>
                            ) : (
                                <Button variant="outline" className="w-full h-32 border-dashed border-2 rounded-xl flex flex-col gap-2 hover:bg-gray-50 hover:border-blue-200 transition-colors" onClick={() => { setGalleryMediaType('image'); setGalleryOpen(true); }}>
                                    <div className="p-3 bg-blue-50 rounded-full text-[#0077b5]"><ImageIcon className="h-6 w-6" /></div>
                                    <span className="text-xs font-medium text-gray-500">Click to select an image from gallery</span>
                                </Button>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="video" className="pt-4 space-y-4 animate-in slide-in-from-top-2">
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-wider text-gray-500">Caption</Label>
                            <SocialCaptionEditor
                                value={postContent.message}
                                onChange={(e) => setPostContent(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Add a caption..."
                                platform="linkedin"
                                className="min-h-[100px] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            {postContent.media.length > 0 && postContent.media[0].type === 'video' ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden border bg-black group">
                                    <video src={postContent.media[0].url} className="w-full h-full object-contain" controls />
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setPostContent(prev => ({ ...prev, media: [] }))}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline" className="w-full h-32 border-dashed border-2 rounded-xl flex flex-col gap-2 hover:bg-gray-50 hover:border-blue-200 transition-colors" onClick={() => { setGalleryMediaType('video'); setGalleryOpen(true); }}>
                                    <div className="p-3 bg-purple-50 rounded-full text-purple-600"><Film className="h-6 w-6" /></div>
                                    <span className="text-xs font-medium text-gray-500">Click to select a video</span>
                                </Button>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="link" className="pt-4 space-y-4 animate-in slide-in-from-top-2">
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-wider text-gray-500">Caption</Label>
                            <SocialCaptionEditor
                                value={postContent.message}
                                onChange={(e) => setPostContent(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Add a comment for this link..."
                                platform="linkedin"
                                className="min-h-[100px] rounded-xl"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-wider text-gray-500">Link URL</Label>
                            <div className="relative">
                                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-9 rounded-xl"
                                    placeholder="https://example.com"
                                    value={postContent.link}
                                    onChange={(e) => setPostContent(prev => ({ ...prev, link: e.target.value }))}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="pt-4 pb-2">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={cn("p-1.5 rounded-lg transition-colors", scheduling.schedule ? "bg-blue-100 text-[#0077b5]" : "bg-gray-200 text-gray-500")}>
                                    <Clock className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold text-gray-700">Schedule Post</span>
                            </div>
                            <Switch checked={scheduling.schedule} onCheckedChange={(c) => setScheduling(prev => ({ ...prev, schedule: c }))} />
                        </div>
                        {scheduling.schedule && (
                            <div className="grid grid-cols-2 gap-3 pt-2 animate-in slide-in-from-top-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl border-gray-200 h-11 bg-white">
                                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                                            {scheduling.date ? format(scheduling.date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={scheduling.date} onSelect={(date) => setScheduling(prev => ({ ...prev, date }))} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <Input
                                    type="time"
                                    value={scheduling.time}
                                    onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value }))}
                                    className="rounded-xl border-gray-200 h-11 bg-white"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="ghost" onClick={() => onSuccess?.()} className="rounded-xl">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isPending || !selectedAccount} className="bg-[#0077b5] hover:bg-[#006097] text-white rounded-xl px-8 font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        {scheduling.schedule ? "Schedule Post" : "Publish Masterpiece"}
                    </Button>
                </div>
            </div>

            <GalleryModal
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                apiEndpoint="/api/admin/gallery"
                onSelect={handleGallerySelect}
                allowedTypes={galleryMediaType === 'image' ? ['image'] : ['video']}
                maxSelection={1}
            />
        </div>
    );
}

// -----------------------------------------------------------------------------
// MAIN CONTAINER
// -----------------------------------------------------------------------------
export default function PublishedPosts({ accountId: initialAccountId }) {
    const [activeTab, setActiveTab] = useState("calendar");
    const [isCreating, setIsCreating] = useState(false);
    const [createInitialData, setCreateInitialData] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [analyticsModal, setAnalyticsModal] = useState({ open: false, post: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const loadAccounts = async () => {
            const res = await fetchLinkedinAccounts();
            if (res.success) {
                setAccounts(res.accounts || []);
            }
        };
        loadAccounts();
    }, []);

    const handleDateClick = (date) => {
        setCreateInitialData({
            scheduling: {
                schedule: true,
                date: date,
                time: "12:00",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            readOnly: false
        });
        setIsCreating(true);
    };

    const handleEdit = (post, action = 'edit') => {
        if (action === 'delete') {
            setDeleteDialog({ open: true, postId: post.id });
            return;
        }
        if (action === 'analytics') {
            setAnalyticsModal({ open: true, post });
            return;
        }

        const initialData = {
            ...post,
            readOnly: post.status === 'posted' || post.status === 'published'
        };
        setCreateInitialData(initialData);
        setIsCreating(true);
    };

    const handleDelete = async () => {
        const res = await deleteLinkedinPost(deleteDialog.postId);
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
            {/* Premium Header - LinkedIn Style */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg shadow-blue-50/10 p-5 lg:p-6">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-gradient-to-br from-blue-50/20 to-blue-100/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#0077b5] border border-blue-600 text-white shadow-lg shadow-blue-200/50">
                            <LinkedinLogo className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-wider">LinkedIn Professional Studio</span>
                        </div>

                        <div className="space-y-0.5">
                            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-gray-900">
                                Content Studio
                            </h1>
                            <p className="text-gray-500 max-w-md text-xs font-medium leading-relaxed">
                                Elevate your professional presence with precision scheduling and network intelligence.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {accounts.length > 0 && (
                            <div className="hidden lg:flex flex-row items-center -space-x-2 mr-2">
                                {accounts.slice(0, 3).map((account, i) => (
                                    <div key={account.id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm" title={account.displayName}>
                                        {account.profilePicture ? (
                                            <img src={account.profilePicture} alt={account.displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-[10px] font-bold text-gray-500">
                                                {account.displayName?.charAt(0).toUpperCase() || "L"}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {accounts.length > 3 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-[#0077b5] flex items-center justify-center shadow-sm z-10">
                                        <span className="text-[10px] font-black text-white">+{accounts.length - 3}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            onClick={() => {
                                setCreateInitialData(null);
                                setIsCreating(true);
                            }}
                            className="group relative px-6 h-11 bg-[#0077b5] hover:bg-[#006097] text-white font-black rounded-xl shadow-xl shadow-blue-100 transition-all duration-300 hover:scale-[1.02] active:scale-95"
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
                    <TabsTrigger value="calendar" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-[#0077b5] font-bold text-gray-500 gap-2">
                        <CalendarIcon className="h-4 w-4" /> Calendar View
                    </TabsTrigger>
                    <TabsTrigger value="linkedin" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-[#0077b5] data-[state=active]:text-white font-bold text-gray-500 gap-2">
                        <LayoutGrid className="h-4 w-4" /> LinkedIn View
                    </TabsTrigger>
                    <TabsTrigger value="listing" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 font-bold text-gray-500 gap-2">
                        <List className="h-4 w-4" /> Listing View
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <LinkedinCalendarViewComponent
                        onDateClick={handleDateClick}
                        onPostClick={handleEdit}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="linkedin" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <LinkedinViewComponent
                        accountId={initialAccountId}
                        refreshTrigger={refreshTrigger}
                        onEdit={handleEdit}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="listing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <LinkedinListingViewComponent
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
                            <div className="px-6 py-4 bg-white border-b border-gray-50 flex items-center justify-between font-sans shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-[#0077b5] rounded-xl shadow-lg flex items-center justify-center transform rotate-3"><LinkedinLogo className="h-4 w-4 text-white" /></div>
                                    <div className="flex flex-col">
                                        <DialogTitle className="text-sm font-black text-gray-900 leading-none">Post Creator</DialogTitle>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">LinkedIn Studio v1.0</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => {
                                    setIsCreating(false);
                                    setCreateInitialData(null);
                                }} className="rounded-full hover:bg-gray-50 text-gray-400 hover:text-black transition-all">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <CreateLinkedinPostForm
                                initialData={createInitialData}
                                onSuccess={() => {
                                    setIsCreating(false);
                                    setCreateInitialData(null);
                                    handleRefresh();
                                }}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <LinkedinAnalyticsModal
                open={analyticsModal.open}
                onOpenChange={(o) => setAnalyticsModal(p => ({ ...p, open: o }))}
                post={analyticsModal.post}
            />

            <AlertDialog open={deleteDialog.open} onOpenChange={(o) => setDeleteDialog(p => ({ ...p, open: o }))}>
                <AlertDialogContent className="rounded-[32px] border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black tracking-tight">Remove Content?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 font-medium pt-2">
                            This will permanently remove the post from your dashboard. If it's already published on LinkedIn, it may still remain there.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-6">
                        <AlertDialogCancel className="rounded-xl font-bold border-gray-100">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl h-11 px-8">Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
