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
import { AlertTriangle, Info } from "lucide-react";
import { createAiPost } from "@/app/actions/social/ai/createAiPost";
import { storage } from "@/lib/firebase";
import GalleryModal from "@/components/gallery/GalleryModal";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";
import { PLATFORM_CAPABILITIES } from "@/constants/platforms.config";

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
    const [mediaItems, setMediaItems] = useState([]); // [{ url, type }]
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

    /**
     * MEDIA VALIDATION LOGIC
     */
    const validatePlatformMedia = (platformKey) => {
        const platform = platformKey?.toLowerCase();
        const config = PLATFORM_CAPABILITIES[platform] || PLATFORM_CAPABILITIES.default;

        if (mediaItems.length === 0) return { valid: true };

        const types = new Set(mediaItems.map(m => m.type));
        const hasImage = types.has('image');
        const hasVideo = types.has('video');

        // 1. Check supported types
        const unsupportedTypes = mediaItems.filter(m => !config.allowedTypes.includes(m.type));
        if (unsupportedTypes.length > 0) {
            return {
                valid: false,
                reason: `${config.label} doesn't support ${unsupportedTypes[0].type}s`
            };
        }

        // 2. Check max items
        if (mediaItems.length > config.maxItems) {
            return {
                valid: false,
                reason: `Max ${config.maxItems} items allowed for ${config.label}`
            };
        }

        // 3. Check mixed media
        if (!config.allowMixed && hasImage && hasVideo) {
            return {
                valid: false,
                reason: `${config.label} doesn't allow mixed image & video`
            };
        }

        // 4. Check caption length
        if (postContent.length > config.maxCaption) {
            return {
                valid: false,
                reason: `${config.label} limit is ${config.maxCaption} characters`
            };
        }

        return { valid: true };
    };

    // Global compatibility state
    const compatibilityReport = (() => {
        const report = {
            hasConflicts: false,
            conflicts: [], // { platform, reason }
            platformStatus: {} // { platformKey: { valid, reason } }
        };

        // Get unique selected platforms
        const selectedPlatformKeys = new Set();
        selectedAccounts.forEach(acc => {
            const targets = selectedTargets[acc.id] || [];
            if (targets.length > 0) {
                selectedPlatformKeys.add(acc.platform?.toLowerCase());
            }
        });

        selectedPlatformKeys.forEach(platform => {
            const result = validatePlatformMedia(platform);
            report.platformStatus[platform] = result;
            if (!result.valid) {
                report.hasConflicts = true;
                report.conflicts.push({ platform, reason: result.reason });
            }
        });

        return report;
    })();

    // Determine what types are allowed when opening gallery based on selected platforms
    // Determined to always allow both types to prevent "video-only" lock-ins
    // We handle compatibility via the visual warnings instead of hard filtering
    const getAllowedGalleryTypes = () => ['image', 'video'];

    const handleGallerySelect = (selectedItems) => {
        const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];

        if (items.length + mediaItems.length > 20) {
            toast.error("Maximum 20 files allowed (Instagram Limit)");
            return;
        }

        const newItems = items.map(item => ({
            url: item.fileUrl,
            type: item.mediaType || (item.fileType?.startsWith('image/') ? 'image' : 'video')
        }));

        setMediaItems(prev => [...prev, ...newItems]);
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

        if (compatibilityReport.hasConflicts) {
            toast.error("Please fix media compatibility issues before launching");
            return;
        }

        if (!postContent.trim() && mediaItems.length === 0) {
            toast.error("Post content cannot be empty");
            return;
        }

        setIsPosting(true);
        try {
            const res = await createAiPost({
                accountIds: selectedAccounts.map(acc => acc.id), // Parent connection IDs
                targetIds: activeTargets, // Specific Page/Profile IDs
                content: postContent,
                mediaUrls: mediaItems.map(m => m.url)
            });

            if (res.success) {
                toast.success("Multiverse post launched successfully!");
                setPostContent("");
                setMediaItems([]);
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

    // Dynamic character limit based on strictest selected platform
    const maxAllowedCaption = (() => {
        const selectedPlatformKeys = new Set();
        selectedAccounts.forEach(acc => {
            const targets = selectedTargets[acc.id] || [];
            if (targets.length > 0) {
                selectedPlatformKeys.add(acc.platform?.toLowerCase());
            }
        });

        if (selectedPlatformKeys.size === 0) return 5000;

        let minLimit = 5000;
        selectedPlatformKeys.forEach(platform => {
            const config = PLATFORM_CAPABILITIES[platform] || PLATFORM_CAPABILITIES.default;
            if (config.maxCaption < minLimit) minLimit = config.maxCaption;
        });
        return minLimit;
    })();

    const isOverLimit = postContent.length > maxAllowedCaption;

    // Calculate total selected targets
    const totalSelectedTargets = Object.values(selectedTargets).reduce((acc, targets) => acc + targets.length, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[95vw] md:w-[90vw] md:max-w-[1200px] bg-white border-slate-200 rounded-2xl overflow-hidden p-0 shadow-xl"
                aria-describedby="composer-description"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600 z-50" />

                <div className="max-h-[90vh] md:max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <div className="p-4 sm:p-6 md:p-8">
                        <DialogHeader className="mb-4 sm:mb-6 md:mb-8">
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-primary rounded-lg shadow-sm shrink-0">
                                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <span className="truncate">Smart Composer</span>
                                </DialogTitle>
                            </div>
                        </DialogHeader>

                        {/* Target Platforms - Flat Circular Grid */}
                        <div className="mb-6 sm:mb-8">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                        Destinations
                                    </Label>
                                    <span className="bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full border border-primary/20 whitespace-nowrap">
                                        {totalSelectedTargets} Selected
                                    </span>
                                </div>
                                {compatibilityReport.hasConflicts ? (
                                    <span className="text-[9px] sm:text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold flex items-center gap-1 border border-red-100 animate-pulse">
                                        <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        Conflicts Found
                                    </span>
                                ) : (
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium hidden md:inline-block">
                                        Tap to toggle specific targets
                                    </span>
                                )}
                            </div>

                            {/* Horizontal Scrolling Circular Grid */}
                            <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-2 px-2 mask-fade-right">
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
                                    const status = compatibilityReport.platformStatus[platform];
                                    const hasConflict = isActive && status && !status.valid;

                                    return (
                                        <div
                                            key={`${dest.parentId}-${dest.id}`}
                                            onClick={() => toggleTarget(dest.parentId, dest.id)}
                                            className="group flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 w-11 sm:w-14 transition-transform active:scale-95"
                                            title={hasConflict ? status.reason : dest.name}
                                        >
                                            <div className={`
                                                relative w-9 h-9 sm:w-12 sm:h-12 rounded-full p-0.5 transition-all duration-300
                                                ${isActive
                                                    ? hasConflict ? 'bg-red-400 shadow-md ring-2 ring-red-100' : 'bg-gradient-to-tr from-primary to-blue-400 shadow-lg scale-105'
                                                    : 'bg-slate-200 hover:bg-slate-300'
                                                }
                                            `}>
                                                <div className={`
                                                    w-full h-full rounded-full border-[2px] border-white bg-slate-100 flex items-center justify-center overflow-hidden relative
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
                                                        <span className={`text-xs sm:text-base font-bold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                                                            {dest.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Platform Badge Overlay */}
                                                <div className={`
                                                    absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] rounded-full border-[1.5px] border-white flex items-center justify-center shadow-sm
                                                    ${PlatformInfo.bg || 'bg-slate-100'}
                                                `}>
                                                    <PlatformIcon className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 ${PlatformInfo.color}`} />
                                                </div>

                                                {/* Conflict Badge */}
                                                {hasConflict && (
                                                    <div className="absolute -top-1 -left-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500 text-white rounded-full border-[1.5px] border-white flex items-center justify-center shadow-md animate-bounce">
                                                        <AlertTriangle className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                                                    </div>
                                                )}

                                                {/* Selection Check */}
                                                {isActive && !hasConflict && (
                                                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-primary text-white rounded-full border-[1.5px] border-white flex items-center justify-center shadow-sm animate-in zoom-in">
                                                        <Check className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Label - Shows target name (Page or Profile name) */}
                                            <div className="flex flex-col items-center w-full px-1">
                                                <span className={`
                                                    text-[7px] sm:text-[9px] font-bold text-center truncate w-full transition-colors
                                                    ${isActive ? hasConflict ? 'text-red-600' : 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}
                                                `}>
                                                    {dest.name}
                                                </span>
                                                <span className={`text-[6px] sm:text-[7px] uppercase tracking-tighter font-medium truncate w-full text-center ${hasConflict ? 'text-red-400' : 'text-slate-400'}`}>
                                                    {hasConflict ? 'Error' : (dest.type === 'page' ? 'Page' : 'Profile')}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Composer Area - Full Width */}
                        <div className="space-y-4 sm:space-y-6 md:space-y-8">
                            <div className="relative">
                                <SocialCaptionEditor
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    placeholder="What's on your mind? Share your thoughts with your audience..."
                                    platform={selectedAccounts[0]?.platform?.toLowerCase() || "default"}
                                    minHeight="clamp(180px, 40vh, 320px)"
                                    className={isOverLimit ? 'border-red-300' : ''}
                                    maxLimit={maxAllowedCaption}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">Media</Label>
                                    <span className={`text-[10px] font-medium ${mediaItems.length > 10 ? 'text-orange-500' : 'text-slate-400'}`}>
                                        {mediaItems.length} items
                                    </span>
                                </div>

                                {/* Media Guard Alert Row */}
                                {compatibilityReport.hasConflicts && (
                                    <div className="bg-red-50 border border-red-100 p-2.5 sm:p-3 rounded-xl flex items-start gap-2 sm:gap-3 animate-in fade-in slide-in-from-top-1">
                                        <div className="bg-red-500 rounded-lg p-1.5 shrink-0">
                                            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] sm:text-xs font-bold text-red-900 leading-tight">Compatibility Issue</p>
                                            <div className="mt-1 space-y-0.5">
                                                {compatibilityReport.conflicts.map((c, i) => (
                                                    <p key={i} className="text-[9px] sm:text-[10px] text-red-700 flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-red-400" />
                                                        {c.reason}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setGalleryOpen(true)}
                                        className="w-full h-12 sm:h-14 border-dashed border-2 hover:border-primary hover:bg-primary/5 rounded-xl group transition-all"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                                                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-primary" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs sm:text-sm font-bold text-slate-900">Select Media</div>
                                                <div className="text-[9px] sm:text-[10px] text-slate-500">Pick from your library</div>
                                            </div>
                                        </div>
                                    </Button>
                                </div>

                                {/* Media Previews Grid - Tiny Squares */}
                                {mediaItems.length > 0 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 sm:gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                        {mediaItems.map((item, idx) => (
                                            <div key={idx} className="relative aspect-square group rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm hover:border-primary/50 transition-colors">
                                                {item.type === 'video' ? (
                                                    <video src={item.url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img
                                                        src={item.url}
                                                        alt={`Selected media ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}

                                                {/* Visible Delete Button (Top Right) */}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setMediaItems(prev => prev.filter((_, i) => i !== idx));
                                                    }}
                                                    className="absolute -top-0.5 -right-0.5 bg-red-500 hover:bg-red-600 text-white rounded-bl-lg rounded-tr-sm p-1 shadow-md transition-all active:scale-95 z-10"
                                                    aria-label={`Remove media ${idx + 1}`}
                                                >
                                                    <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                </button>

                                                {item.type === 'video' && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10">
                                                        <div className="bg-black/60 rounded-full p-0.5 sm:p-1 border border-white/20">
                                                            <div className="w-0 h-0 border-t-[2px] sm:border-t-[3px] border-t-transparent border-l-[4px] sm:border-l-[5px] border-l-white border-b-[2px] sm:border-b-[3px] border-b-transparent ml-0.5" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-200 pt-4 sm:pt-6">
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="text-slate-600 hover:text-slate-900 rounded-lg font-semibold w-full sm:w-auto h-11 sm:h-12"
                                disabled={isPosting}
                            >
                                Discard Draft
                            </Button>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {compatibilityReport.hasConflicts && (
                                    <span className="text-[10px] font-extrabold text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100 text-center uppercase tracking-tight">
                                        Fix {compatibilityReport.conflicts.length} Issue{compatibilityReport.conflicts.length !== 1 ? 's' : ''} to Launch
                                    </span>
                                )}
                                <Button
                                    className={`${compatibilityReport.hasConflicts ? 'bg-slate-200 text-slate-400 hover:bg-slate-200' : 'bg-primary hover:bg-blue-600'} rounded-lg px-6 sm:px-10 h-11 sm:h-12 text-sm sm:text-base font-bold shadow-md w-full sm:w-auto transition-all active:scale-95`}
                                    onClick={handlePost}
                                    disabled={isPosting || isOverLimit || compatibilityReport.hasConflicts}
                                    aria-label="Launch multi-platform post"
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
                    </div>
                </div>

                <GalleryModal
                    open={galleryOpen}
                    onOpenChange={setGalleryOpen}
                    onSelect={handleGallerySelect}
                    allowMultiple={true}
                    maxSelection={20}
                    allowedTypes={getAllowedGalleryTypes()}
                    title="Select Media Store"
                />
            </DialogContent>
        </Dialog>
    );
}
