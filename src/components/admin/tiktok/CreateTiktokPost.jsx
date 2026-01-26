"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
    Loader2, Video, Calendar as CalendarIcon, Clock, Send, X, Plus,
    ImageIcon, Film, Play, ChevronUp, ChevronDown, BarChart3, Check
} from "lucide-react";
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import GalleryModal from "@/components/gallery/GalleryModal";
import TiktokPreview from "./TiktokPreview";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";
import { createTiktokPost } from "@/app/actions/social/tiktok/createPost";
import { updateTiktokPost } from "@/app/actions/social/tiktok/tiktokPostsActions";
import { getUserTikTokAccounts } from "@/app/actions/social/tiktok/getAccounts";
import { getDateTime } from "@/lib/utils";

export default function CreateTiktokPost({ initialData = null, onSuccess = null }) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!initialData?.id;
    const isReadOnly = initialData?.status === 'published';

    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(initialData?.accountId || null);

    const [postContent, setPostContent] = useState({
        text: initialData?.content?.text || "",
        media: initialData?.content?.media || []
    });

    const [scheduling, setScheduling] = useState({
        schedule: !!initialData?.scheduledAt || false,
        date: initialData?.scheduledAt ? new Date(initialData.scheduledAt) : new Date(),
        time: initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "HH:mm") : "12:00"
    });

    const [galleryOpen, setGalleryOpen] = useState(false);
    const selectionScrollRef = useRef(null);

    useEffect(() => {
        async function loadData() {
            const accRes = await getUserTikTokAccounts();

            if (accRes.success && accRes.accounts.length > 0) {
                setAccounts(accRes.accounts);
            }
        }
        loadData();
    }, [selectedAccount]);

    const handleGallerySelect = (selectedItems) => {
        const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
        // TikTok implementation currently focuses on one main video
        const newMedia = items.map(item => ({
            url: item.fileUrl,
            name: item.fileName,
            type: item.mediaType || (item.fileType?.startsWith('video') ? 'video' : 'image'),
            mimeType: item.fileType,
            storagePath: item.storagePath // Pass storagePath for server-side processing
        })).filter(item => item.type === 'video');

        if (newMedia.length === 0) {
            toast.error("Please select a video file. TikTok posts must be videos.");
            return;
        }

        setPostContent(prev => ({ ...prev, media: [newMedia[0]] }));
        setGalleryOpen(false);
    };

    const removeMedia = () => {
        setPostContent(prev => ({ ...prev, media: [] }));
    };

    const handleSubmit = async () => {
        if (!selectedAccount) return toast.error("Please select a TikTok account");
        if (postContent.media.length === 0) return toast.error("Please select a video for your TikTok post");

        const scheduledTime = scheduling.schedule ? getDateTime(scheduling.date, scheduling.time) : null;

        startTransition(async () => {
            try {
                let result;
                if (isEditing) {
                    result = await updateTiktokPost({
                        postId: initialData.id,
                        accountId: selectedAccount,
                        text: postContent.text,
                        media: postContent.media,
                        scheduling: scheduledTime ? scheduledTime.toISOString() : null
                    });
                } else {
                    result = await createTiktokPost({
                        pageId: selectedAccount,
                        text: postContent.text,
                        media: postContent.media,
                        scheduling: scheduledTime ? scheduledTime.toISOString() : null
                    });
                }

                if (result.success) {
                    toast.success(result.message || (isEditing ? "Post updated!" : "Post created!"));
                    onSuccess?.();
                } else {
                    toast.error(result.message || "Failed to submit post");
                }
            } catch (error) {
                toast.error("An error occurred while submitting the post");
            }
        });
    };

    const account = accounts.find(a => a.accountId === selectedAccount) || {};

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 lg:p-8 space-y-6 lg:space-y-10">
                    {/* Account Selection - Threads Style */}
                    <div className="space-y-3 px-2">
                        <div className="flex items-center gap-2 opacity-50">
                            <TiktokLogo className="h-2.5 w-2.5 text-black" />
                            <h3 className="text-[9px] font-black text-gray-900 uppercase tracking-[0.3em]">Channel Selection</h3>
                        </div>
                        <div className="flex flex-wrap gap-5 items-center">
                            {accounts.map((acc) => {
                                const isSelected = selectedAccount === acc.accountId;
                                return (
                                    <div
                                        key={acc.id}
                                        onClick={() => !isReadOnly && setSelectedAccount(acc.accountId)}
                                        className={cn(
                                            "group relative cursor-pointer transition-all duration-300 flex items-center justify-center rounded-full border p-1 bg-white",
                                            isSelected ? "border-black bg-white shadow-xl shadow-gray-100" : "w-12 h-12 border-gray-100 opacity-60 hover:opacity-100 scale-95 hover:scale-100",
                                            isReadOnly && "cursor-default opacity-100"
                                        )}
                                    >
                                        <div className="w-10 h-10 relative">
                                            <div className={cn("w-full h-full rounded-full bg-black p-[2.5px]", isSelected && "animate-spin-slow shadow-[0_0_15px_rgba(0,0,0,0.1)]")}>
                                                <div className="w-full h-full rounded-full bg-white p-[2px]">
                                                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black overflow-hidden shadow-inner font-black text-[10px]">
                                                        {acc.profilePicture ? <img src={acc.profilePicture} alt="" className="w-full h-full object-cover" /> : acc.username?.charAt(0)}
                                                    </div>
                                                </div>
                                            </div>
                                            {isSelected && <div className="absolute -top-1 -right-1 bg-black text-white rounded-full p-1.5 border-2 border-white shadow-md"><Check className="h-2 w-2 stroke-[3]" /></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 lg:gap-10 items-start">
                        {/* Editor area - 7fr */}
                        <div className="space-y-6">
                            {/* Smart Scheduler Styling */}
                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-gray-50 rounded-lg"><Clock className="h-3.5 w-3.5 text-black" /></div>
                                        <h3 className="text-[11px] font-black text-gray-900 leading-none tracking-widest uppercase">Smart Scheduler</h3>
                                    </div>
                                    <Switch
                                        disabled={isReadOnly}
                                        checked={scheduling.schedule}
                                        onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))}
                                        className="data-[state=checked]:bg-black scale-75"
                                    />
                                </div>
                                {scheduling.schedule && (
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button disabled={isReadOnly} variant="outline" className="w-full h-9 rounded-xl text-[10px] uppercase font-black justify-start px-3 tracking-widest leading-none border-gray-100 hover:bg-gray-50">
                                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-black" />
                                                    {scheduling.date ? format(scheduling.date, "MMM dd, yyyy") : "Date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-0 rounded-3xl overflow-hidden shadow-2xl" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={scheduling.date}
                                                    onSelect={(date) => date && setScheduling(prev => ({ ...prev, date }))}
                                                    disabled={{ before: new Date() }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <Input
                                            disabled={isReadOnly}
                                            type="time"
                                            value={scheduling.time}
                                            onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value }))}
                                            className="h-9 rounded-xl text-xs font-bold border-gray-100 bg-gray-50/20 px-3"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Content & Media area */}
                            <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm space-y-6">
                                <SocialCaptionEditor
                                    disabled={isReadOnly}
                                    value={postContent.text}
                                    onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                                    placeholder="Write your TikTok description here... #trending"
                                    platform="tiktok"
                                    className="rounded-2xl border-gray-100 bg-gray-50/10 p-4 font-sans text-[15px] text-gray-800 leading-relaxed min-h-[150px] focus:bg-white focus:ring-4 focus:ring-gray-50 transition-all"
                                />

                                <Separator className="bg-gray-50/50" />

                                <div className="space-y-4">
                                    <Label className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Media Selection</Label>
                                    {postContent.media.length > 0 ? (
                                        <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border-2 border-dashed border-gray-100 group">
                                            <video src={postContent.media[0].url} className="w-full h-full object-cover" muted />
                                            {!isReadOnly && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 gap-3">
                                                    <Button variant="secondary" onClick={() => setGalleryOpen(true)} className="rounded-xl h-10 px-6 font-bold">Replace</Button>
                                                    <Button variant="destructive" onClick={removeMedia} className="rounded-xl h-10 px-6 font-bold">Remove</Button>
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                <Film className="h-3.5 w-3.5 text-white" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-wider line-clamp-1 max-w-[150px]">{postContent.media[0].name}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            disabled={isReadOnly}
                                            variant="outline"
                                            onClick={() => setGalleryOpen(true)}
                                            className="h-40 w-full rounded-2xl border-2 border-dashed border-gray-100 hover:border-black hover:bg-gray-50/50 flex flex-col gap-3 group transition-all duration-300"
                                        >
                                            <div className="p-3 bg-gray-50 group-hover:bg-black group-hover:text-white rounded-2xl transition-all duration-300">
                                                <Video className="h-6 w-6" />
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] group-hover:text-black">Upload Video</span>
                                                <span className="text-[9px] text-gray-400 font-medium mt-1">Selectmp4 or mov from gallery</span>
                                            </div>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Preview Area - 3fr */}
                        <div className="lg:sticky top-0 flex gap-4">
                            <div className="flex-1 min-w-0">
                                <TiktokPreview
                                    content={postContent}
                                    account={account}
                                />
                            </div>

                            {/* Media Tray - TikTok logic typically 1 video, but keeping tray for consistency */}
                            {postContent.media.length > 0 && (
                                <div className="hidden lg:flex flex-col items-center py-4 bg-white rounded-2xl border border-gray-100 shadow-sm w-20 shrink-0 h-fit">
                                    <div className="flex flex-col gap-3 px-2">
                                        <div className="relative group shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 border-black ring-2 ring-gray-100 scale-105 shadow-md">
                                            <video src={postContent.media[0].url} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <Play className="h-4 w-4 text-white fill-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 px-8 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
                <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900" onClick={() => onSuccess?.()}>
                    {isReadOnly ? "Close" : "Cancel"}
                </Button>

                {isReadOnly && (
                    <>
                        <Button
                            variant="outline"
                            className="h-11 px-6 rounded-xl border-gray-100 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                            onClick={() => {
                                // Assume parent handles analytics opening via onSuccess callback or similar
                                onSuccess?.('analytics');
                            }}
                        >
                            <BarChart3 className="h-3.5 w-3.5" />
                            View Analytics
                        </Button>
                        <Button
                            variant="outline"
                            className="h-11 px-6 rounded-xl border-gray-100 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                            onClick={() => {
                                if (initialData?.permalink) window.open(initialData.permalink, '_blank');
                            }}
                        >
                            <TiktokLogo className="h-3.5 w-3.5" />
                            View Post
                        </Button>
                    </>
                )}

                {!isReadOnly && (
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="h-14 px-8 rounded-xl bg-black hover:bg-gray-800 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-100 transition-all active:scale-95"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                {scheduling.schedule ? (isEditing ? "Update Schedule" : "Schedule Video") : (isEditing ? "Save Changes" : "Post Now")}
                            </div>
                        )}
                    </Button>
                )}
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
