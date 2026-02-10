"use client";

import { useState, useEffect, useRef } from "react";
import {
    Check,
    Zap,
    X,
    ImageIcon,
    Sparkles,
    Trash2,
    SendHorizontal,
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    Send,
    MessageCircle,
    MessageSquare,
    Twitter,
    Smile
} from "lucide-react";
import { XLogo } from "@/components/icons/XLogo";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import PinterestLogo from "@/components/icons/PinterestLogo";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createAiPost } from "@/app/actions/social/ai/createAiPost";
import { storage } from "@/lib/firebase";
import GalleryModal from "@/components/gallery/GalleryModal";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";

const PLATFORM_ICONS = {
    facebook: { icon: Facebook, color: "text-[#1877F2]" },
    instagram: { icon: Instagram, color: "text-[#E4405F]" },
    linkedin: { icon: Linkedin, color: "text-[#0A66C2]" },
    twitter: { icon: XLogo, color: "text-slate-900" },
    threads: { icon: ThreadsLogo, color: "text-slate-900" },
    tiktok: { icon: TiktokLogo, color: "text-slate-900" },
    youtube: { icon: Youtube, color: "text-[#FF0000]" },
    pinterest: { icon: PinterestLogo, color: "text-[#E60023]" },
    bluesky: { icon: BlueSkyLogo, color: "text-[#0085ff]" },
    whatsapp: { icon: MessageCircle, color: "text-[#25D366]" },
    telegram: { icon: Send, color: "text-[#0088cc]" },
    reddit: { icon: MessageSquare, color: "text-[#FF4500]" },
};

export default function AIComposerModal({ open, onOpenChange, selectedAccounts = [], onSuccess }) {
    const [postContent, setPostContent] = useState("");
    const [mediaUrls, setMediaUrls] = useState([]);
    const [isPosting, setIsPosting] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const textareaRef = useRef(null);

    const [selectedTargets, setSelectedTargets] = useState({}); // { connectionId: [pageId1, pageId2] }

    // Initialize selected targets when accounts change
    useEffect(() => {
        if (open) {
            const initialTargets = {};
            selectedAccounts.forEach(acc => {
                // If account has pages, select all by default
                if (Array.isArray(acc.pages) && acc.pages.length > 0) {
                    initialTargets[acc.id] = acc.pages.map(p => p.id || p.pageId);
                } else {
                    // For profiles (Twitter, Instagram), use the account ID itself
                    initialTargets[acc.id] = [acc.id];
                }
            });
            setSelectedTargets(initialTargets);
        }
    }, [open, selectedAccounts]);

    // Focus management - focus textarea when modal opens
    useEffect(() => {
        if (open && textareaRef.current) {
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
        }
    }, [open]);

    const toggleTarget = (connectionId, targetId) => {
        setSelectedTargets(prev => {
            const currentTargets = prev[connectionId] || [];
            const isSelected = currentTargets.includes(targetId);

            if (isSelected) {
                return { ...prev, [connectionId]: currentTargets.filter(id => id !== targetId) };
            } else {
                return { ...prev, [connectionId]: [...currentTargets, targetId] };
            }
        });
    };

    const toggleAllTargets = (connectionId, allTargets, shouldSelect) => {
        setSelectedTargets(prev => ({
            ...prev,
            [connectionId]: shouldSelect ? allTargets : []
        }));
    };


    const handleGallerySelect = (selectedItems) => {
        const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];

        if (items.length + mediaUrls.length > 4) {
            toast.error("Maximum 4 files allowed");
            return;
        }

        const newUrls = items.map(item => item.fileUrl);
        setMediaUrls(prev => [...prev, ...newUrls]);
        setGalleryOpen(false);
        toast.success(`Added ${items.length} file(s) from gallery`);
    };

    const handlePost = async () => {
        if (selectedAccounts.length === 0) {
            toast.error("Please select at least one account");
            return;
        }

        // Validate that at least one target is selected for each connection
        const activeTargets = [];
        Object.entries(selectedTargets).forEach(([connectionId, targets]) => {
            if (targets.length > 0) {
                activeTargets.push(...targets);
            }
        });

        if (activeTargets.length === 0) {
            toast.error("Please select at least one destination (Page or Profile)");
            return;
        }

        if (!postContent.trim() && mediaUrls.length === 0) {
            toast.error("Post content cannot be empty");
            return;
        }

        setIsPosting(true);
        try {
            const res = await createAiPost({
                accountIds: selectedAccounts.map(acc => acc.id), // Parent connection IDs
                targetIds: activeTargets, // Specific Page/Profile IDs
                content: postContent,
                mediaUrls: mediaUrls
            });

            if (res.success) {
                toast.success("Multiverse post launched successfully!");
                setPostContent("");
                setMediaUrls([]);
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.error || "Failed to launch post");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsPosting(false);
        }
    };

    // Character limit
    const charLimit = 5000;
    const isOverLimit = postContent.length > charLimit;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[95vw] md:w-[90vw] md:max-w-[1200px] bg-white border-slate-200 rounded-2xl overflow-hidden p-0 shadow-xl"
                aria-describedby="composer-description"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600" />

                <div className="p-6 sm:p-8">
                    <DialogHeader className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-lg shadow-sm">
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                Smart Composer
                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    {/* Target Platforms - Flat Circular Grid */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                Destinations
                            </Label>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">
                                Tap to toggle specific publishing targets
                            </span>
                        </div>

                        {/* Wrapping Circular Grid */}
                        <div className="flex flex-wrap items-start gap-4 sm:gap-6 justify-start">
                            {(() => {
                                // Flatten accounts and pages into a single list of destinations
                                const flattenedDestinations = [];
                                selectedAccounts.forEach(acc => {
                                    if (Array.isArray(acc.pages) && acc.pages.length > 0) {
                                        // It's a container with pages (Facebook, LinkedIn)
                                        acc.pages.forEach(page => {
                                            const pageId = page.id || page.pageId;
                                            flattenedDestinations.push({
                                                id: pageId,
                                                parentId: acc.id,
                                                name: page.name || page.pageName,
                                                platform: acc.platform,
                                                type: 'page',
                                                image: page.picture || page.imageUrl || page.image || null,
                                                category: page.category
                                            });
                                        });
                                    } else {
                                        // It's a profile (Instagram, Twitter, etc.)
                                        flattenedDestinations.push({
                                            id: acc.id,
                                            parentId: acc.id,
                                            name: acc.displayName || acc.name || 'Profile',
                                            platform: acc.platform,
                                            type: 'profile',
                                            image: acc.profilePicture || acc.picture || acc.avatarUrl || acc.image || null
                                        });
                                    }
                                });

                                return flattenedDestinations.sort((a, b) => a.platform.localeCompare(b.platform));
                            })().map(dest => {
                                const platform = dest.platform?.toLowerCase() || 'other';
                                const PlatformInfo = PLATFORM_ICONS[platform] || { icon: Send, color: "text-slate-600", bg: "bg-slate-100" };
                                const PlatformIcon = PlatformInfo.icon;

                                const targets = selectedTargets[dest.parentId] || [];
                                const isActive = targets.includes(dest.id);

                                return (
                                    <div
                                        key={`${dest.parentId}-${dest.id}`}
                                        onClick={() => toggleTarget(dest.parentId, dest.id)}
                                        className="group flex flex-col items-center gap-2 cursor-pointer w-16 sm:w-20"
                                        title={dest.name}
                                    >
                                        <div className={`
                                            relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-300
                                            ${isActive
                                                ? 'bg-gradient-to-tr from-primary to-blue-400 shadow-lg scale-105'
                                                : 'bg-slate-200 hover:bg-slate-300'
                                            }
                                        `}>
                                            <div className={`
                                                w-full h-full rounded-full border-[3px] border-white bg-slate-100 flex items-center justify-center overflow-hidden relative
                                                ${!isActive && 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all'}
                                            `}>
                                                {/* Profile/Page Image or Fallback Letter */}
                                                {dest.image ? (
                                                    <img
                                                        src={dest.image}
                                                        alt={dest.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`
                                                    w-full h-full items-center justify-center
                                                    ${dest.image ? 'hidden' : 'flex'}
                                                `}>
                                                    <span className={`text-lg sm:text-xl font-bold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                                                        {dest.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Platform Badge Overlay */}
                                            <div className={`
                                                absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm
                                                ${PlatformInfo.bg || 'bg-slate-100'}
                                            `}>
                                                <PlatformIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${PlatformInfo.color}`} />
                                            </div>

                                            {/* Selection Check */}
                                            {isActive && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full border-2 border-white flex items-center justify-center shadow-sm animate-in zoom-in">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Label - Shows target name (Page or Profile name) */}
                                        <div className="flex flex-col items-center w-full px-1">
                                            <span className={`
                                                text-[10px] sm:text-[11px] font-bold text-center truncate w-full transition-colors
                                                ${isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}
                                            `}>
                                                {dest.name}
                                            </span>
                                            <span className="text-[8px] text-slate-400 uppercase tracking-tighter font-medium truncate w-full text-center">
                                                {dest.type === 'page' ? 'Page' : 'Profile'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Composer Area - Full Width */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="relative">
                            <SocialCaptionEditor
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                placeholder="What's on your mind? Share your thoughts with your audience..."
                                platform={selectedAccounts[0]?.platform?.toLowerCase() || "default"}
                                minHeight="280px"
                                className={isOverLimit ? 'border-red-300' : ''}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Media</Label>
                                <span className="text-[10px] font-medium text-slate-400">
                                    {mediaUrls.length}/4 items
                                </span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setGalleryOpen(true)}
                                    className="w-full h-14 border-dashed border-2 hover:border-primary hover:bg-primary/5 rounded-xl group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                                            <ImageIcon className="w-5 h-5 text-slate-600 group-hover:text-primary" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold text-slate-900">Select From Gallery</div>
                                            <div className="text-[10px] text-slate-500">Pick from your library</div>
                                        </div>
                                    </div>
                                </Button>
                            </div>

                            {/* Media Previews Grid - Compact */}
                            {mediaUrls.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    {mediaUrls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square group rounded-lg overflow-hidden border border-slate-200 bg-white">
                                            <img
                                                src={url}
                                                alt={`Selected media ${idx + 1}`}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setMediaUrls(prev => prev.filter((_, i) => i !== idx));
                                                    }}
                                                    className="bg-red-500 rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                                                    aria-label={`Remove media ${idx + 1}`}
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <GalleryModal
                        open={galleryOpen}
                        onOpenChange={setGalleryOpen}
                        onSelect={handleGallerySelect}
                        allowMultiple={true}
                        maxSelection={4 - mediaUrls.length}
                        allowedTypes={["image", "video"]}
                        title="Select Media Store"
                    />

                    <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200 pt-4 sm:pt-6">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-slate-600 hover:text-slate-900 rounded-lg font-semibold w-full sm:w-auto"
                            disabled={isPosting}
                        >
                            Discard Draft
                        </Button>

                        <Button
                            className="bg-primary hover:bg-blue-600 rounded-lg px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base font-bold shadow-sm w-full sm:w-auto"
                            onClick={handlePost}
                            disabled={isPosting || isOverLimit}
                            aria-label={`Launch post to ${selectedAccounts.length} platform${selectedAccounts.length !== 1 ? 's' : ''}`}
                        >
                            {isPosting ? (
                                <>
                                    <Spinner className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <SendHorizontal className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    <span>Launch Post</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
