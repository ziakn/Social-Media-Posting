"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";
import GalleryModal from "@/components/gallery/GalleryModal";

// Icons
import {
    Plus, X, ImageIcon, Play, Edit, Trash2, Send, Loader2, Check,
    ChevronUp, ChevronDown, Clock, Pin, Link as LinkIcon, BarChart3, Calendar as CalendarIcon
} from "lucide-react";

// Server Actions
import {
    getPinterestAccounts,
    getPinterestBoards
} from "@/app/actions/social/pinterest/getAccounts";
import { createPinterestPost } from "@/app/actions/social/pinterest/createPost";
import { updatePinterestPost } from "@/app/actions/social/pinterest/pinterestPostsActions";
import { getDateTime } from "@/lib/utils";
import PinterestLogo from "@/components/icons/PinterestLogo";
import PinterestPreview from "./PinterestPreview";

export default function CreatePinterestPost({ initialData = null, onSuccess = null }) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!initialData?.id;
    const isReadOnly = initialData?.readOnly || false;

    // Pinterest specific fields
    const [postType, setPostType] = useState(initialData?.postType || "standard"); // standard or carousel
    const [title, setTitle] = useState(initialData?.title || "");
    const [link, setLink] = useState(initialData?.link || "");
    const [selectedBoard, setSelectedBoard] = useState(initialData?.boardId || "");
    const [boards, setBoards] = useState([]);

    const [postContent, setPostContent] = useState({
        message: initialData?.message || initialData?.description || "",
        media: initialData?.media || (initialData?.imageUrl ? [{ url: initialData.imageUrl, type: "image" }] : (initialData?.content?.media || [])),
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
            const res = await getPinterestAccounts();
            if (res.success) {
                setAccounts(res.accounts || []);
                // Fix: Do not auto-select first account (User Request)
                if (selectedAccount && !res.accounts.some(acc => acc.accountId === selectedAccount)) {
                    setSelectedAccount(null);
                }
            }
        }
        loadAccounts();
    }, []);

    useEffect(() => {
        if (selectedAccount) {
            async function loadBoards() {
                const res = await getPinterestBoards(selectedAccount);
                if (res.success) {
                    setBoards(res.boards);
                    if (!selectedBoard && res.boards.length > 0) {
                        setSelectedBoard(res.boards[0].id);
                    } else if (selectedBoard && !res.boards.some(board => board.id === selectedBoard)) {
                        // If the initial selected board is no longer available, select the first one
                        setSelectedBoard(res.boards.length > 0 ? res.boards[0].id : null);
                    }
                }
            }
            loadBoards();
        } else {
            setBoards([]);
            setSelectedBoard(null);
        }
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
            media: [...prev.media, ...newMedia].slice(0, 5) // Pinterest up to 5 for carousel
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
        if (!selectedAccount) return toast.error("Please select a Pinterest account");
        if (!selectedBoard) return toast.error("Please select a board");

        // Validation based on Post Type
        if (postType === "standard") {
            if (postContent.media.length === 0) return toast.error("Standard Pins require 1 image or video");
            if (postContent.media.length > 1) return toast.error("Standard Pins only support 1 media item. Switch to Carousel for multiple images.");
        } else if (postType === "carousel") {
            if (postContent.media.length < 2) return toast.error("Carousel Pins require at least 2 images");
            if (postContent.media.length > 5) return toast.error("Pinterest Carousel Pins support a maximum of 5 images");

            const hasVideo = postContent.media.some(m => m.type === 'video');
            if (hasVideo) return toast.error("Pinterest Carousel Pins currently only support images, not video.");
        }


        startTransition(async () => {
            try {
                const scheduledTime = scheduling.schedule ? getDateTime(scheduling.date, scheduling.time) : null;

                let result;
                if (isEditing) {
                    result = await updatePinterestPost({
                        postId: initialData.id,
                        title,
                        message: postContent.message,
                        link,
                        boardId: selectedBoard,
                        media: postContent.media,
                        scheduling: scheduledTime,
                        accountId: selectedAccount
                    });
                } else {
                    result = await createPinterestPost({
                        pageId: selectedAccount,
                        title,
                        message: postContent.message,
                        link,
                        boardId: selectedBoard,
                        media: postContent.media,
                        scheduling: scheduledTime
                    });
                }

                if (result.success) {
                    toast.success(scheduling.schedule ? "Pin scheduled!" : (isEditing ? "Pin updated!" : "Pin published!"));
                    onSuccess?.();
                } else {
                    toast.error(result.message || "Failed to submit Pin");
                }
            } catch (error) {
                toast.error(error.message);
            }
        });
    };

    const characterCount = postContent.message.length;
    const maxCharacters = 500; // Pinterest description limit

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden font-sans">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 lg:p-8 space-y-6 lg:space-y-10">
                    {/* Channel Selection (Threads Style) */}
                    <div className="space-y-3 px-2">
                        <div className="flex items-center gap-2 opacity-50">
                            <PinterestLogo className="h-2.5 w-2.5 fill-black" />
                            <h3 className="text-[9px] font-black text-gray-900 uppercase tracking-[0.3em]"> Channel Selection </h3>
                        </div>
                        <div className="flex flex-wrap gap-5 items-center">
                            {accounts.map((acc) => {
                                const isSelected = selectedAccount === acc.accountId;
                                return (
                                    <div key={acc.id} onClick={() => !isReadOnly && setSelectedAccount(acc.accountId)} className={cn("group relative cursor-pointer transition-all duration-300 flex items-center justify-center rounded-full border p-1 bg-white", isSelected ? "border-[#E60023] bg-white shadow-xl shadow-red-50" : "w-12 h-12 border-gray-100 opacity-60 hover:opacity-100 scale-95 hover:scale-100", isReadOnly && "cursor-default opacity-100")}>
                                        <div className="w-10 h-10 relative">
                                            <div className={cn("w-full h-full rounded-full bg-[#E60023] p-[2.5px]", isSelected && "animate-spin-slow shadow-[0_0_15px_rgba(230,0,35,0.1)]")}>
                                                <div className="w-full h-full rounded-full bg-white p-[2px]">
                                                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black overflow-hidden shadow-inner">
                                                        {acc.profilePicture ? <img src={acc.profilePicture} alt="" className="w-full h-full object-cover" /> : acc.username?.charAt(0)}
                                                    </div>
                                                </div>
                                            </div>
                                            {isSelected && <div className="absolute -top-1 -right-1 bg-[#E60023] text-white rounded-full p-1.5 border-2 border-white shadow-md"><Check className="h-2 w-2 stroke-[3]" /></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 lg:gap-10 items-start">
                        {/* Editor */}
                        <div className="space-y-6">
                            {/* Strategy / Scheduling */}
                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-red-50 rounded-lg"><Clock className="h-3.5 w-3.5 text-[#E60023]" /></div>
                                        <h3 className="text-[11px] font-black text-gray-900 leading-none tracking-widest uppercase">Smart Scheduler</h3>
                                    </div>
                                    <Switch disabled={isReadOnly} checked={scheduling.schedule} onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))} className="data-[state=checked]:bg-[#E60023] scale-75" />
                                </div>
                                {scheduling.schedule && (
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button disabled={isReadOnly} variant="outline" className="w-full h-9 rounded-xl text-[10px] uppercase font-black justify-start px-3 tracking-widest leading-none border-gray-100 hover:bg-gray-50">
                                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-[#E60023]" /> {scheduling.date ? format(scheduling.date, "MMM dd, yyyy") : "Date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-0 rounded-3xl overflow-hidden shadow-2xl" align="start">
                                                <Calendar mode="single" selected={scheduling.date} onSelect={(date) => date && setScheduling(prev => ({ ...prev, date }))} disabled={{ before: new Date() }} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <Input disabled={isReadOnly} type="time" value={scheduling.time} onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value }))} className="h-9 rounded-xl text-xs font-bold border-gray-100 bg-gray-50/20 px-3" />
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] opacity-80 pl-1">Format</h3>
                                    <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
                                        {["standard", "carousel"].map(type => (
                                            <button
                                                key={type}
                                                disabled={isReadOnly || isEditing}
                                                onClick={() => { setPostType(type); }}
                                                className={cn(
                                                    "px-6 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all tracking-[0.2em]",
                                                    postType === type
                                                        ? "bg-white text-[#E60023] shadow-md ring-1 ring-black/5"
                                                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50",
                                                    (isReadOnly || isEditing) && "cursor-not-allowed opacity-50"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Pinterest Fields: Title, Board, Link */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center ml-1">
                                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pin Title</Label>
                                                <span className={cn("text-[8px] font-black uppercase tracking-widest", title.length > 100 ? "text-red-500" : "text-gray-300")}>
                                                    {title.length} / 100
                                                </span>
                                            </div>
                                            <Input
                                                disabled={isReadOnly}
                                                placeholder="Add a title..."
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                                                className={cn(
                                                    "h-11 rounded-xl border-gray-100 bg-gray-50/30 px-4 font-bold text-sm transition-all focus:bg-white",
                                                    title.length > 90 && "border-yellow-200"
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Pin Board</Label>
                                            <Select value={selectedBoard} onValueChange={setSelectedBoard} disabled={isReadOnly}>
                                                <SelectTrigger className="h-11 rounded-xl border-gray-100 bg-gray-50/30 px-4 font-bold text-sm">
                                                    <SelectValue placeholder="Select Board" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    {boards.map((board) => (
                                                        <SelectItem key={board.id} value={board.id} className="font-bold text-sm">
                                                            {board.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Destination Link</Label>
                                        <div className="relative">
                                            <Input
                                                disabled={isReadOnly}
                                                placeholder="https://yourlink.com"
                                                value={link}
                                                onChange={(e) => setLink(e.target.value)}
                                                className="h-11 rounded-xl border-gray-100 bg-gray-50/30 pl-10 pr-4 font-bold text-sm"
                                            />
                                            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Pin Description</Label>
                                        <SocialCaptionEditor
                                            disabled={isReadOnly}
                                            value={postContent.message}
                                            onChange={(e) => setPostContent(prev => ({ ...prev, message: e.target.value }))}
                                            placeholder="Tell everyone what your Pin is about..."
                                            platform="pinterest"
                                            className="rounded-2xl border-gray-100 bg-gray-50/10 p-6 font-sans text-[15px] text-gray-800 leading-relaxed min-h-[160px] focus:bg-white focus:ring-4 focus:ring-red-50 transition-all shadow-inner"
                                        />

                                        <div className="flex justify-between items-center px-1">
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest", characterCount > maxCharacters ? "text-red-500" : "text-gray-300 font-bold")}>
                                                {characterCount} <span className="text-gray-200 mx-1">/</span> {maxCharacters}
                                            </span>
                                        </div>
                                    </div>

                                    <Separator className="bg-gray-50/50" />

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Media Assets</Label>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-full border border-gray-100">
                                                <div className={cn("w-1 h-1 rounded-full", postContent.media.length > 0 ? "bg-green-500" : "bg-gray-300")} />
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                                    {postType === 'carousel' ? `${postContent.media.length} / 5` : `${postContent.media.length} / 1`}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            disabled={isReadOnly}
                                            variant="outline"
                                            onClick={() => {
                                                setGalleryMediaType(postType === 'carousel' ? "image" : "any");
                                                setGalleryOpen(true);
                                            }}
                                            className={cn(
                                                "h-28 w-full rounded-2xl border-2 border-dashed border-gray-100 hover:border-[#E60023] hover:bg-red-50/10 flex flex-col gap-2 group transition-all duration-300",
                                                postContent.media.length > 0 && "border-green-100 bg-green-50/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg transition-colors duration-300",
                                                    postContent.media.length > 0 ? "bg-green-50 text-green-600" : "bg-gray-50 group-hover:bg-[#E60023] group-hover:text-white"
                                                )}>
                                                    <ImageIcon className="h-5 w-5" />
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] group-hover:text-black">
                                                {postContent.media.length > 0 ? "Add More Media" : "Select Creative Asset"}
                                            </span>
                                            <span className="text-[9px] text-gray-400 font-medium tracking-wide">
                                                {postType === 'carousel'
                                                    ? "Carousel Pins require 2-5 images"
                                                    : "Standard Pins require 1 image or video"}
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview & Media Tray */}
                        <div className="lg:sticky top-0 flex gap-4 h-fit">
                            <div className="flex-1 min-w-0">
                                <PinterestPreview
                                    content={postContent}
                                    page={accounts.find(a => a.accountId === selectedAccount)}
                                    currentSlide={currentSlide}
                                    title={title}
                                    link={link}
                                    boardName={boards.find(b => b.id === selectedBoard)?.name}
                                />
                            </div>

                            {/* Media Selection Tray (Exact Threads Copy) */}
                            {postContent.media.length > 0 && (
                                <div className="hidden lg:flex flex-col items-center py-2 bg-white rounded-2xl border border-gray-100 shadow-sm w-20 shrink-0 h-fit">
                                    <Button variant="ghost" size="icon" onClick={() => scrollSelection('up')} className="h-6 w-6 text-gray-400 hover:text-black mb-2">
                                        <ChevronUp className="h-4 w-4" />
                                    </Button>

                                    <div ref={selectionScrollRef} className="flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[450px] px-2 font-sans">
                                        {postContent.media.map((item, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "relative group shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer",
                                                    currentSlide === index
                                                        ? "border-[#E60023] ring-2 ring-red-50 scale-105 shadow-md"
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
                                // Close modal and potentially open analytics
                                onSuccess?.();
                            }}
                        >
                            <BarChart3 className="h-3.5 w-3.5 text-[#E60023]" />
                            View Analytics
                        </Button>
                        <Button
                            variant="outline"
                            className="h-11 px-6 rounded-xl border-gray-100 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                            onClick={() => {
                                if (initialData?.permalink) window.open(initialData.permalink, '_blank');
                            }}
                        >
                            <PinterestLogo className="h-3.5 w-3.5 fill-[#E60023]" />
                            View on Pinterest
                        </Button>
                    </>
                )}

                {!isReadOnly && (
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="h-11 px-8 rounded-xl bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-gray-100 transition-all active:scale-95"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            scheduling.schedule ? (isEditing ? "Update Schedule" : "Schedule Pin") : (isEditing ? "Save Changes" : "Publish Now")
                        )}
                    </Button>
                )}
            </div>
            <GalleryModal open={galleryOpen} onOpenChange={setGalleryOpen} onSelect={handleGallerySelect} allowedTypes={galleryMediaType} allowMultiple={true} maxSelection={5} />
        </div>
    );
}
