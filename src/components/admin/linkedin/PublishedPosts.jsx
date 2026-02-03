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
    FileText, Film, Link2, Users
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
        timezone: initialData?.scheduling?.timezone || "UTC"
    });

    useEffect(() => {
        if (!initialData?.scheduling?.timezone && !initialData?.scheduledAt) {
            setScheduling(prev => ({
                ...prev,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }));
        }
    }, [initialData]);

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

        setPostContent(prev => ({ ...prev, media: [newMedia[0]] }));
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

    const selectedAccountObj = accounts.find(a => a.id === selectedAccount);

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
                    {/* Account Selection */}
                    <div className="space-y-3 px-2">
                        <div className="flex items-center gap-2 opacity-40">
                            <Users className="h-2.5 w-2.5 text-[#0077b5]" />
                            <h3 className="text-[8px] font-black text-gray-900 uppercase tracking-[0.3em]"> Channel Selection </h3>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                            {accounts.map((acc) => {
                                const isSelected = selectedAccount === acc.id;
                                return (
                                    <div key={acc.id} onClick={() => !isReadOnly && setSelectedAccount(acc.id)} className={cn("group relative cursor-pointer transition-all duration-300 flex items-center justify-center rounded-full border p-1 bg-white", isSelected ? "border-[#0077b5] bg-blue-50 shadow-lg" : "w-12 h-12 border-gray-100 opacity-60", isReadOnly && "cursor-default")}>
                                        <div className="w-10 h-10 relative">
                                            <div className={cn("w-full h-full rounded-full bg-gradient-to-tr from-[#0077b5] to-blue-600 p-[2px]", isSelected && "animate-spin-slow")}>
                                                <div className="w-full h-full rounded-full bg-white p-[2px]">
                                                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black overflow-hidden">
                                                        {acc.profilePicture ? <img src={acc.profilePicture} alt="" className="w-full h-full object-cover" /> : acc.displayName.charAt(0)}
                                                    </div>
                                                </div>
                                            </div>
                                            {isSelected && <div className="absolute -top-1 -right-1 bg-[#0077b5] text-white rounded-full p-1"><Check className="h-2 w-2" /></div>}
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
                                        <Clock className="h-3.5 w-3.5 text-[#0077b5]" />
                                        <h3 className="text-xs font-black text-gray-900 leading-none">Smart Scheduler</h3>
                                    </div>
                                    <Switch disabled={isReadOnly} checked={scheduling.schedule} onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))} className="data-[state=checked]:bg-[#0077b5] scale-75" />
                                </div>
                                {scheduling.schedule && (
                                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-50">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button disabled={isReadOnly} variant="outline" className="w-full h-8 rounded-lg text-xs justify-start px-2"><CalendarIcon className="mr-1.5 h-3 w-3 text-[#0077b5]" /> {scheduling.date ? format(scheduling.date, "MMM dd, yyyy") : "Date"}</Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-0 rounded-3xl" align="start"><Calendar mode="single" selected={scheduling.date} onSelect={(date) => date && setScheduling(prev => ({ ...prev, date }))} disabled={{ before: new Date() }} initialFocus /></PopoverContent>
                                        </Popover>
                                        <Input disabled={isReadOnly} type="time" value={scheduling.time} onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value }))} className="h-8 rounded-lg text-xs" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-gray-900 uppercase">Format</h3>
                                    <Tabs value={postType} onValueChange={setPostType} className="w-auto">
                                        <TabsList className="bg-gray-50/50 p-1 rounded-lg h-auto">
                                            {[
                                                { id: "text", icon: FileText, label: "Text" },
                                                { id: "images", icon: ImageIcon, label: "Image" },
                                                { id: "video", icon: Film, label: "Video" },
                                                { id: "link", icon: Link2, label: "Link" }
                                            ].map(type => (
                                                <TabsTrigger
                                                    key={type.id}
                                                    value={type.id}
                                                    disabled={isReadOnly || isEditing}
                                                    className="rounded-md text-[10px] uppercase font-black px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-[#0077b5] data-[state=active]:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() => {
                                                        if (type.id !== 'text' && type.id !== 'link') {
                                                            setPostContent(prev => ({ ...prev, media: [] }));
                                                        }
                                                    }}
                                                >
                                                    <type.icon className="h-3 w-3 mr-1.5" /> {type.label}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </Tabs>
                                </div>

                                <Separator className="bg-gray-50" />

                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase text-gray-500">Post Content</Label>
                                    <SocialCaptionEditor
                                        disabled={isReadOnly}
                                        value={postContent.message}
                                        onChange={(e) => setPostContent(prev => ({ ...prev, message: e.target.value }))}
                                        placeholder="What do you want to share with your professional network?"
                                        platform="linkedin"
                                        className="rounded-xl border-gray-50 bg-gray-50/50 p-4 font-medium text-sm text-gray-800 min-h-[150px]"
                                    />
                                </div>

                                {(postType === "images" || postType === "video") && (
                                    <div className="space-y-4 animate-in slide-in-from-top-2">
                                        <Label className="text-xs font-black uppercase text-gray-500">Media</Label>
                                        {postContent.media.length > 0 ? (
                                            <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-sm group bg-black">
                                                {postContent.media[0].type === 'video' ? (
                                                    <video src={postContent.media[0].url} className="w-full h-full object-contain" controls />
                                                ) : (
                                                    <img src={postContent.media[0].url} className="w-full h-full object-cover" />
                                                )}
                                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setPostContent(prev => ({ ...prev, media: [] }))}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                disabled={isReadOnly}
                                                variant="outline"
                                                onClick={() => {
                                                    setGalleryMediaType(postType === "video" ? "video" : "image");
                                                    setGalleryOpen(true);
                                                }}
                                                className="h-24 w-full rounded-2xl border-2 border-dashed border-gray-100 hover:border-[#0077b5] hover:bg-blue-50 flex flex-col gap-2 transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {postType === "video" ? <Film className="h-6 w-6 text-[#0077b5]" /> : <ImageIcon className="h-6 w-6 text-[#0077b5]" />}
                                                </div>
                                                <span className="text-xs font-black uppercase text-gray-600">Select {postType === "video" ? "Video" : "Image"}</span>
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {postType === "link" && (
                                    <div className="space-y-3 animate-in slide-in-from-top-2">
                                        <Label className="text-xs font-black uppercase text-gray-500">Link URL</Label>
                                        <div className="relative">
                                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                className="pl-9 rounded-xl h-11 bg-gray-50/50 border-gray-100"
                                                placeholder="https://example.com/article"
                                                value={postContent.link}
                                                onChange={(e) => setPostContent(prev => ({ ...prev, link: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preview & Media Tray */}
                        <div className="lg:sticky top-0 flex gap-4">
                            <div className="flex-1 min-w-0">
                                <Label className="block mb-4 text-xs font-black uppercase text-gray-400 text-center tracking-widest">Live Preview</Label>
                                <LinkedinPreview
                                    content={{
                                        ...postContent,
                                        message: postType === 'link' && postContent.link ? `${postContent.message}\n\n${postContent.link}` : postContent.message
                                    }}
                                    page={selectedAccountObj}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-white shrink-0 flex justify-end gap-3 px-8">
                <Button variant="ghost" onClick={() => onSuccess?.()} className="rounded-xl">{isReadOnly ? "Close" : "Cancel"}</Button>

                {isReadOnly ? (
                    initialData?.permalink && (
                        <Button
                            onClick={() => window.open(initialData.permalink, '_blank')}
                            className="bg-white hover:bg-gray-50 text-[#0077b5] border border-gray-200 font-bold rounded-xl px-6 h-11 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <LinkedinLogo className="h-4 w-4" />
                            View Native
                        </Button>
                    )
                ) : (
                    <Button disabled={isPending || !selectedAccount} onClick={handleSubmit} className="bg-[#0077b5] hover:bg-[#006097] text-white font-bold rounded-xl px-12 h-11 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEditing ? <Edit className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />)}
                        {scheduling.schedule ? "Schedule Post" : "Publish Masterpiece"}
                    </Button>
                )}
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
    const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId || "all");

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
            {/* Premium Header - Professional Content Studio style */}
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
                                    <div
                                        key={account.id}
                                        onClick={() => setSelectedAccountId(prev => prev === account.accountId ? "all" : account.accountId)}
                                        className={cn(
                                            "w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm cursor-pointer transition-all hover:scale-110 relative",
                                            String(selectedAccountId) === String(account.accountId) ? "z-30 ring-2 ring-[#0077b5] ring-offset-2" : `z-${10 - i}`
                                        )}
                                        title={account.displayName}
                                    >
                                        {account.profilePicture ? (
                                            <img src={account.profilePicture} alt={account.displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-[10px] font-bold text-gray-500">
                                                {account.displayName?.charAt(0).toUpperCase() || "L"}
                                            </div>
                                        )}
                                        {String(selectedAccountId) === String(account.accountId) && (
                                            <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                                                <div className="bg-white rounded-full p-0.5 shadow-sm">
                                                    <Check className="h-2 w-2 text-[#0077b5] stroke-[4]" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {accounts.length > 3 && (
                                    <div
                                        onClick={() => setSelectedAccountId("all")}
                                        className={cn(
                                            "w-8 h-8 rounded-full border-2 border-white bg-black flex items-center justify-center shadow-sm z-10 cursor-pointer hover:scale-110",
                                            selectedAccountId === "all" && "ring-2 ring-[#0077b5] ring-offset-2"
                                        )}
                                    >
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
                        accountId={selectedAccountId}
                        refreshTrigger={refreshTrigger}
                        onEdit={handleEdit}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="listing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <LinkedinListingViewComponent
                        accountId={selectedAccountId}
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
