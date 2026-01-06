// src/components/admin/tiktok/PublishedPosts.jsx
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
    ChevronUp, ChevronDown, Upload, BarChart3, Clock, Video
} from "lucide-react";

// Server Actions
import {
    getTiktokPosts, deleteTiktokPost, getTiktokPostsStats
} from "@/app/actions/social/tiktok/tiktokPostsActions";
import { createTiktokPost } from "@/app/actions/social/tiktok/createPost";
import { getUserTikTokAccounts } from "@/app/actions/social/tiktok/getAccounts";
import { getDateTime } from "@/lib/utils";

// Internal Components
import TiktokViewComponent from "./TiktokViewComponent";
import TiktokListingViewComponent from "./TiktokListingViewComponent";
import TiktokPreview from "./TiktokPreview";
import { TiktokLogo } from "@/components/icons/TiktokLogo";

// -----------------------------------------------------------------------------
// CREATE POST FORM
// -----------------------------------------------------------------------------
function CreateTiktokPostForm({ initialData = null, onSuccess = null }) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!initialData?.id;
    const isReadOnly = initialData?.readOnly || false;

    const [postContent, setPostContent] = useState({
        text: initialData?.content?.text || "",
        media: initialData?.content?.media || [],
    });

    const [scheduling, setScheduling] = useState({
        schedule: !!initialData?.scheduledAt,
        date: initialData?.scheduledAt ? new Date(initialData.scheduledAt) : new Date(),
        time: initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "HH:mm") : "12:00",
    });

    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(initialData?.accountId || null);
    const [galleryOpen, setGalleryOpen] = useState(false);

    useEffect(() => {
        async function loadAccounts() {
            const res = await getUserTikTokAccounts();
            if (res.success) setAccounts(res.accounts || []);
        }
        loadAccounts();
    }, []);

    const handleGallerySelect = (selectedItems) => {
        const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
        const newMedia = items.map(item => ({
            url: item.fileUrl,
            name: item.fileName,
            type: "video" // TikTok is video only
        }));

        setPostContent(prev => ({
            ...prev,
            media: [newMedia[0]] // TikTok usually one video per post in simple API flow
        }));
        setGalleryOpen(false);
    };

    const handleSubmit = async () => {
        if (!selectedAccount) return toast.error("Please select a TikTok account");
        if (postContent.media.length === 0) return toast.error("TikTok post requires a video");

        startTransition(async () => {
            try {
                const scheduledTime = scheduling.schedule ? getDateTime(scheduling.date, scheduling.time) : null;
                const result = await createTiktokPost({
                    pageId: selectedAccount,
                    text: postContent.text,
                    media: postContent.media,
                    scheduling: scheduledTime
                });

                if (result.success) {
                    toast.success(scheduling.schedule ? "TikTok video scheduled!" : "TikTok video published!");
                    onSuccess?.();
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        });
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
                    {/* Left Column: Editor */}
                    <div className="space-y-8">
                        {/* Account Selection */}
                        <section className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Select Account</Label>
                            <div className="flex flex-wrap gap-4">
                                {accounts.map((acc) => (
                                    <button
                                        key={acc.id}
                                        disabled={isReadOnly}
                                        onClick={() => setSelectedAccount(acc.accountId)}
                                        className={cn(
                                            "relative group transition-all p-1 rounded-full border-2",
                                            selectedAccount === acc.accountId ? "border-black scale-110 shadow-lg" : "border-transparent opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
                                        )}
                                    >
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={acc.profilePicture} />
                                            <AvatarFallback>{acc.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                        {selectedAccount === acc.accountId && (
                                            <div className="absolute -top-1 -right-1 bg-black text-white rounded-full p-1 border-2 border-white">
                                                <Check className="h-2.5 w-2.5 stroke-[4]" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Video Upload */}
                        <section className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Content</Label>
                            {postContent.media.length > 0 ? (
                                <div className="relative aspect-[9/16] max-h-[400px] rounded-3xl overflow-hidden bg-black group shadow-2xl">
                                    <video src={postContent.media[0].url} className="w-full h-full object-cover" muted />
                                    <button
                                        onClick={() => setPostContent(p => ({ ...p, media: [] }))}
                                        className="absolute top-4 right-4 h-10 w-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => setGalleryOpen(true)}
                                    className="w-full aspect-video rounded-3xl border-2 border-dashed border-gray-200 flex flex-col gap-4 hover:border-black hover:bg-white transition-all group"
                                >
                                    <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                        <Video className="h-6 w-6" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-black uppercase tracking-widest text-gray-900">Select Video</p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">TikTok posts must be videos</p>
                                    </div>
                                </Button>
                            )}
                        </section>

                        {/* Caption */}
                        <section className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Caption</Label>
                            <SocialCaptionEditor
                                value={postContent.text}
                                onChange={(e) => setPostContent(p => ({ ...p, text: e.target.value }))}
                                placeholder="Describe your video..."
                                platform="tiktok"
                                className="min-h-[120px] rounded-3xl border-gray-100 shadow-inner bg-white/50 focus:bg-white transition-all"
                            />
                        </section>

                        {/* Scheduling */}
                        <section className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-black" />
                                    <span className="text-sm font-black uppercase tracking-widest text-gray-900">Scheduling</span>
                                </div>
                                <Switch
                                    checked={scheduling.schedule}
                                    onCheckedChange={(v) => setScheduling(p => ({ ...p, schedule: v }))}
                                    className="data-[state=checked]:bg-black"
                                />
                            </div>
                            {scheduling.schedule && (
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full h-12 rounded-2xl text-xs font-bold justify-start px-4">
                                                <CalendarIcon className="mr-2 h-4 w-4" /> {format(scheduling.date, "PPP")}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                                            <Calendar mode="single" selected={scheduling.date} onSelect={(d) => d && setScheduling(p => ({ ...p, date: d }))} disabled={{ before: new Date() }} />
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        type="time"
                                        value={scheduling.time}
                                        onChange={(e) => setScheduling(p => ({ ...p, time: e.target.value }))}
                                        className="h-12 rounded-2xl text-sm font-bold border-gray-100"
                                    />
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="hidden lg:block">
                        <div className="sticky top-0 space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Real-time Preview</Label>
                            <TiktokPreview
                                content={postContent}
                                account={accounts.find(a => a.accountId === selectedAccount) || {}}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 p-6 bg-white border-t border-gray-100 flex items-center justify-end gap-4">
                <Button variant="ghost" onClick={onSuccess} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="h-12 px-10 rounded-2xl bg-black hover:bg-gray-800 text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 active:scale-95 transition-all"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (scheduling.schedule ? "Schedule Video" : "Publish Now")}
                </Button>
            </div>

            <GalleryModal
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                onSelect={handleGallerySelect}
                allowedTypes={["video"]}
                allowMultiple={false}
            />
        </div>
    );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
export default function TikTokPublishedPosts({ accountId: initialAccountId }) {
    const [activeTab, setActiveTab] = useState("grid");
    const [isCreating, setIsCreating] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const loadAccounts = async () => {
            const res = await getUserTikTokAccounts();
            if (res.success) setAccounts(res.accounts || []);
        };
        loadAccounts();
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshTrigger(p => p + 1);
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <header className="relative p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                    <TiktokLogo className="h-40 w-40" />
                </div>

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3 text-center md:text-left">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-black text-white rounded-full">
                            <TiktokLogo className="h-3 w-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest">TikTok Studio</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">Post Manager</h1>
                        <p className="text-sm font-medium text-gray-400 max-w-md">Create, schedule and analyze your TikTok video performance in one place.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {accounts.length > 0 && (
                            <div className="flex -space-x-3">
                                {accounts.slice(0, 3).map(acc => (
                                    <Avatar key={acc.id} className="h-10 w-10 border-4 border-white shadow-sm">
                                        <AvatarImage src={acc.profilePicture} />
                                        <AvatarFallback>T</AvatarFallback>
                                    </Avatar>
                                ))}
                                {accounts.length > 3 && (
                                    <div className="h-10 w-10 rounded-full bg-black border-4 border-white flex items-center justify-center text-[10px] font-black text-white z-10 shadow-sm">
                                        +{accounts.length - 3}
                                    </div>
                                )}
                            </div>
                        )}
                        <Button
                            onClick={() => setIsCreating(true)}
                            className="h-14 px-8 rounded-2xl bg-black hover:bg-gray-800 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 active:scale-95 transition-all flex gap-3"
                        >
                            <Plus className="h-5 w-5" /> New Masterpiece
                        </Button>
                    </div>
                </div>
            </header>

            {/* Tabs & Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm h-14">
                    <TabsTrigger value="grid" className="rounded-xl px-8 h-full data-[state=active]:bg-black data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                        <LayoutGrid className="h-4 w-4 mr-2" /> Grid View
                    </TabsTrigger>
                    <TabsTrigger value="listing" className="rounded-xl px-8 h-full data-[state=active]:bg-black data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                        <List className="h-4 w-4 mr-2" /> List View
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="grid" className="mt-0 outline-none">
                    <TiktokViewComponent
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="listing" className="mt-0 outline-none">
                    <TiktokListingViewComponent
                        refreshTrigger={refreshTrigger}
                    />
                </TabsContent>
            </Tabs>

            {/* Create Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="!w-[90vw] !max-w-[1200px] h-[90vh] p-0 border-none bg-transparent overflow-hidden shadow-none" showCloseButton={false}>
                    <div className="bg-white w-full h-full rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
                        <div className="shrink-0 px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center rotate-3 shadow-lg"><TiktokLogo className="h-6 w-6 text-white" /></div>
                                <div>
                                    <DialogTitle className="text-lg font-black tracking-tight text-gray-900">Creation Studio</DialogTitle>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Craft your next viral video</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full hover:bg-gray-50"><X className="h-5 w-5" /></Button>
                        </div>
                        <CreateTiktokPostForm onSuccess={() => { setIsCreating(false); handleRefresh(); }} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
