"use client";

import { useState, useRef, useTransition, useEffect, useCallback } from "react";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Tabs, TabsList, TabsTrigger, TabsContent
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";
import GalleryModal from "@/components/gallery/GalleryModal";

// Icons
import {
  Search, TrendingUp, Heart, MessageCircle, Eye, ChevronRight, ExternalLink,
  Trash2, MoreVertical, X, Filter, Layers, ImageIcon, Film, Play, Edit,
  List, Grid, Calendar as CalendarIcon, Plus, Video, Grid3X3, Upload,
  Music, Instagram, Zap, Clock, Users, ChevronUp, ChevronDown, Loader2, Check,
  ArrowLeft, Send, History
} from "lucide-react";

// Server Actions
import {
  getPublishedPosts, getPublishedPostsStats
} from "@/app/actions/social/instagram/getPosts";
import { fetchInstagramAccounts } from "@/app/actions/social/instagram/getPages";
import { updateInstagramPost } from "@/app/actions/social/instagram/updatePost";
import { deleteInstagramPost } from "@/app/actions/social/instagram/deletePost";
import { publishInstagramPostNow } from "@/app/actions/social/instagram/publishPost";
import { getDateTime } from "@/lib/utils";

// Internal Components (formerly separate files)
import CalendarViewComponent from "@/components/admin/instagram/CalendarViewComponent";
import InstagramViewComponent from "@/components/admin/instagram/InstagramViewComponent";
import ListingViewComponent from "@/components/admin/instagram/ListingViewComponent";
import InstagramPreview from "@/components/admin/instagram/InstagramPreview";
import InstagramAnalyticsModal from "@/components/admin/instagram/InstagramAnalyticsModal";
// Note: Keeping InstagramPreview import assuming it's complex enough to stay separate, or should it be merged too? 
// User said "CreatePost module in this file". InstagramPreview is a child of CreatePost. I will import it for now.

// -----------------------------------------------------------------------------
// CREATE POST FORM (Formerly CreatePost.jsx)
// -----------------------------------------------------------------------------
function CreatePostForm({ initialData = null, onSuccess = null }) {
  const [isPending, startTransition] = useTransition();
  const getInitialPostType = (type) => {
    if (!type) return "feed";
    if (type === "video" || type === "reels" || type === "reel") return "reels";
    if (type === "story") return "story";
    return "feed";
  };
  const [postType, setPostType] = useState(getInitialPostType(initialData?.postType));
  const isReadOnly = initialData?.readOnly || false;
  const isEditing = !!initialData?.id;

  const [postContent, setPostContent] = useState({
    caption: initialData?.content?.caption || initialData?.caption || "",
    media: initialData?.content?.media ?
      (Array.isArray(initialData.content.media) ? initialData.content.media : [initialData.content.media]) :
      (initialData?.content?.image ? [{ ...initialData.content.image, type: 'image' }] :
        (initialData?.content?.video ? [{ ...initialData.content.video, type: 'video' }] :
          (initialData?.media || (initialData?.images?.length ? initialData.images.map(img => ({ ...img, type: 'image' })) : (initialData?.video ? [{ ...initialData.video, type: 'video' }] : []))))),
    audio: initialData?.audio || null,
    coverImage: initialData?.coverImage || null,
  });
  const [scheduling, setScheduling] = useState({
    schedule: initialData?.scheduling?.schedule || (initialData?.status === 'scheduled'),
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

  const [posts, setPosts] = useState([]); // unused but part of original
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(initialData?.pageId || null);

  const [creatorOpen, setCreatorOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryMediaType, setGalleryMediaType] = useState(["image"]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const selectionScrollRef = useRef(null);

  // Sync gallery media type with post type tab
  useEffect(() => {
    if (postType === 'feed') {
      setGalleryMediaType(["image", "video"]);
    } else if (postType === 'reels' || postType === 'story') {
      setGalleryMediaType(["video"]);
    }
  }, [postType]);

  useEffect(() => {
    async function loadPages() {
      const res = await fetchInstagramAccounts();
      if (res.success) {
        setPages(res.accounts || []);
      }
    }
    loadPages();
  }, []);

  const openGallery = (type) => {
    if (type) {
      setGalleryMediaType(Array.isArray(type) ? type : [type]);
    } else {
      setGalleryMediaType((postType === 'reels' || postType === 'story') ? ["video"] : ["image", "video"]);
    }
    setGalleryOpen(true);
  };

  const handleGallerySelect = (selectedItems) => {
    const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
    const newMedia = items.map(item => ({
      url: item.fileUrl, name: item.fileName, size: item.fileSize,
      type: item.mediaType || (item.fileType?.startsWith('video') ? 'video' : 'image'),
      mimeType: item.fileType, file: null
    }));

    if (galleryMediaType.includes("video") || postType === "reels" || postType === "story") {
      setPostContent(prev => ({
        ...prev,
        media: [newMedia[0]]
      }));
      setGalleryOpen(false);
      setCurrentSlide(0);
      return;
    }

    const totalMedia = postContent.media.length + newMedia.length;
    if (totalMedia > maxMedia) {
      toast.error(`You can upload maximum ${maxMedia} item${maxMedia !== 1 ? 's' : ''} for ${postType} posts`);
      return;
    }
    setPostContent(prev => ({
      ...prev,
      media: [...prev.media, ...newMedia].slice(0, maxMedia)
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
    if (!selectedPage) return toast.error("Please select an Instagram account first");
    if (!postContent.caption.trim()) return toast.error("Please add a caption for your post");
    if (postContent.media.length === 0) return toast.error("Please add at least one image or video");

    startTransition(async () => {
      try {
        let result;

        if (isEditing) {
          // Handle Update
          const payload = {
            caption: postContent.caption,
            media: postContent.media,
          };
          if (scheduling.schedule) {
            payload.scheduledAt = getDateTime(scheduling.date, scheduling.time);
          }
          result = await updateInstagramPost(initialData.id, payload);
          if (result.success) {
            toast.success(result.message);
            if (onSuccess) onSuccess(result);
          } else {
            toast.error(result.error || "Failed to update post");
          }
          return;
        }

        const payload = {
          pageId: selectedPage, caption: postContent.caption, scheduling, media: postContent.media
        };
        const { createInstagramImagePost, createInstagramCarouselPost, createInstagramVideoPost, createInstagramStory, createInstagramReel } =
          await import("@/app/actions/social/instagram/createPost");

        switch (postType) {
          case "feed":
            if (postContent.media.length > 1) {
              result = await createInstagramCarouselPost({ ...payload });
            } else {
              const item = postContent.media[0];
              result = item.type === 'video' ? await createInstagramVideoPost({ ...payload, video: item }) : await createInstagramImagePost({ ...payload, image: item });
            }
            break;
          case "story":
            result = await createInstagramStory({ pageId: selectedPage, media: postContent.media[0], caption: postContent.caption, scheduling });
            break;
          case "reels":
            result = await createInstagramReel({ ...payload, video: postContent.media[0] });
            break;
        }

        if (result.success) {
          toast.success(isEditing ? "Post updated!" : (scheduling.schedule ? "Post scheduled!" : "Post published!"));
          if (!isEditing) setPostContent({ caption: "", media: [], audio: null, coverImage: null });
          if (onSuccess) onSuccess(result);
        } else {
          toast.error(result.message || result.error || `Failed to ${isEditing ? 'update' : 'create'} post`);
        }
      } catch (error) {
        console.error("Submit error:", error);
        toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} post`);
      }
    });
  };

  const characterCount = postContent.caption.length;
  const maxCharacters = 2200;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
          {/* Account Selection */}
          <div className="space-y-3 px-2">
            <div className="flex items-center gap-2 opacity-40">
              <Users className="h-2.5 w-2.5 text-pink-500" />
              <h3 className="text-[8px] font-black text-gray-900 uppercase tracking-[0.3em]"> Channel Selection </h3>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              {pages.map((page) => {
                const isSelected = selectedPage === page.igUserId;
                return (
                  <div key={page.igUserId} onClick={() => !isReadOnly && setSelectedPage(page.igUserId)} className={cn("group relative cursor-pointer transition-all duration-300 flex items-center justify-center rounded-full border p-1 bg-white", isSelected ? "border-pink-500 bg-pink-50 shadow-lg" : "w-12 h-12 border-gray-100 opacity-60", isReadOnly && "cursor-default")}>
                    <div className="w-10 h-10 relative">
                      <div className={cn("w-full h-full rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-[2px]", isSelected && "animate-spin-slow")}>
                        <div className="w-full h-full rounded-full bg-white p-[2px]">
                          <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black overflow-hidden">
                            {page.picture?.data?.url ? <img src={page.picture.data.url} alt="" className="w-full h-full object-cover" /> : page.displayName.charAt(0)}
                          </div>
                        </div>
                      </div>
                      {isSelected && <div className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full p-1"><Check className="h-2 w-2" /></div>}
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
                    <Clock className="h-3.5 w-3.5 text-pink-600" />
                    <h3 className="text-xs font-black text-gray-900 leading-none">Smart Scheduler</h3>
                  </div>
                  <Switch disabled={isReadOnly} checked={scheduling.schedule} onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))} className="data-[state=checked]:bg-pink-600 scale-75" />
                </div>
                {scheduling.schedule && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-50">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button disabled={isReadOnly} variant="outline" className="w-full h-8 rounded-lg text-xs justify-start px-2"><CalendarIcon className="mr-1.5 h-3 w-3 text-pink-500" /> {scheduling.date ? format(scheduling.date, "MMM dd, yyyy") : "Date"}</Button>
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
                  <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
                    {["feed", "reels", "story"].map(type => (
                      <button
                        key={type}
                        disabled={isReadOnly || isEditing}
                        onClick={() => { setPostType(type); setPostContent(prev => ({ ...prev, media: [] })); }}
                        className={cn(
                          "px-4 py-1.5 rounded-md text-[9px] font-black uppercase transition-all",
                          postType === type
                            ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5 opacity-100"
                            : "text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <SocialCaptionEditor disabled={isReadOnly} value={postContent.caption} onChange={(e) => setPostContent(prev => ({ ...prev, caption: e.target.value }))} placeholder="Craft your caption..." platform="instagram" className="rounded-xl border-gray-50 bg-gray-50/50 p-4 font-medium text-sm text-gray-800" />
                <div className="flex justify-end"><span className={cn("text-[10px] font-black uppercase", characterCount > maxCharacters ? "text-red-500" : "text-gray-300")}>{characterCount} / {maxCharacters}</span></div>

                <Separator className="bg-gray-50" />
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-gray-900">Media</Label>
                  <Button
                    disabled={isReadOnly}
                    variant="outline"
                    onClick={() => openGallery()}
                    className="h-24 w-full rounded-2xl border-2 border-dashed border-gray-100 hover:border-pink-500 hover:bg-pink-50 flex flex-col gap-2"
                  >
                    {postType === 'feed' ? (
                      <div className="flex items-center gap-3">
                        <ImageIcon className="h-5 w-5 text-pink-600" />
                        <Video className="h-5 w-5 text-purple-600" />
                      </div>
                    ) : (
                      <Video className="h-5 w-5 text-pink-600" />
                    )}
                    <span className="text-xs font-black uppercase text-gray-600">
                      {postType === 'feed' ? "Select Media" : "Select Video"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview & Media Tray */}
            <div className="lg:sticky top-0 flex gap-4">
              <div className="flex-1 min-w-0">
                <InstagramPreview postType={postType} content={postContent} account={pages.find(p => p.igUserId === selectedPage)} currentSlide={currentSlide} />
              </div>

              {/* Media Selection Tray (Vertical Slide) */}
              {postContent.media.length > 0 && (
                <div className="hidden lg:flex flex-col items-center py-2 bg-white rounded-2xl border border-gray-100 shadow-sm w-20 shrink-0 h-fit">
                  <Button variant="ghost" size="icon" onClick={() => scrollSelection('up')} className="h-6 w-6 text-gray-400 hover:text-pink-600 mb-2">
                    <ChevronUp className="h-4 w-4" />
                  </Button>

                  <div
                    ref={selectionScrollRef}
                    className="flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[450px] px-2"
                  >
                    {postContent.media.map((item, index) => (
                      <div
                        key={index}
                        className={cn(
                          "relative group shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer",
                          currentSlide === index
                            ? "border-pink-500 ring-2 ring-pink-100 scale-105 shadow-md"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMedia(index);
                            }}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[1px]"
                          >
                            <Trash2 className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => scrollSelection('down')} className="h-6 w-6 text-gray-400 hover:text-pink-600 mt-2">
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
          <Button disabled={isPending} onClick={handleSubmit} className="bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl px-12 h-11">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEditing ? <Edit className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />)}
            {isEditing ? "Save Changes" : (scheduling.schedule ? "Schedule Post" : "Publish Now")}
          </Button>
        </div>
      )}
      <GalleryModal
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={handleGallerySelect}
        allowedTypes={galleryMediaType}
        allowMultiple={postType === 'feed'}
        maxSelection={postType === 'feed' ? 10 : 1}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT (Formerly ManageInstagramPosts page)
// -----------------------------------------------------------------------------
export default function PublishedPosts({ pageId: initialPageId, viewMode = "grid", initialStatus = "all" }) {
  const [activeTab, setActiveTab] = useState("calendar");
  const [isCreating, setIsCreating] = useState(false);
  // calendarPosts state removed - handled in CalendarViewComponent
  const [createInitialData, setCreateInitialData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });
  const [analyticsModal, setAnalyticsModal] = useState({ open: false, post: null });
  const [accounts, setAccounts] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(initialPageId || "all");

  useEffect(() => {
    async function loadAccounts() {
      const res = await fetchInstagramAccounts();
      if (res.success) {
        setAccounts(res.accounts || []);
      }
    }
    loadAccounts();
  }, []);

  const handleDelete = async (postId) => {
    try {
      const result = await deleteInstagramPost(postId);
      if (result.success) {
        toast.success(result.message);
        setRefreshTrigger(prev => prev + 1); // Trigger refresh for all views
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleDateClick = (date) => {
    setCreateInitialData({
      scheduling: {
        schedule: true,
        date: date,
        time: "12:00",
        timezone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"
      }
    });
    setIsCreating(true);
  };

  const handlePostClick = (post, action = 'edit') => {
    if (action === 'delete') {
      setDeleteDialog({ open: true, postId: post.id, postStatus: post.status });
      return;
    }
    if (action === 'analytics') {
      setAnalyticsModal({ open: true, post });
      return;
    }
    // Map post to initialData format
    const isScheduled = post.status === 'scheduled';
    const initialData = {
      ...post,
      readOnly: !isScheduled,
    };
    setCreateInitialData(initialData);
    setIsCreating(true);
  };

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Premium Compact Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg shadow-pink-50/20 p-5 lg:p-6">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-gradient-to-br from-pink-200/10 to-purple-200/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-100 text-pink-600">
              <Instagram className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-wider">Instagram Business Academy</span>
            </div>

            <div className="space-y-0.5">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Content Studio
              </h1>
              <p className="text-gray-500 max-w-md text-xs font-medium leading-relaxed">
                Elevate your social presence with precision scheduling and analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {accounts.length > 0 && (
              <div className="hidden lg:flex flex-row items-center -space-x-2 mr-2">
                {accounts.slice(0, 3).map((account, i) => (
                  <div
                    key={account.igUserId}
                    onClick={() => setSelectedPageId(prev => prev === account.igUserId ? "all" : account.igUserId)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm cursor-pointer transition-all hover:scale-110 relative",
                      selectedPageId === account.igUserId ? "z-30 ring-2 ring-pink-600 ring-offset-2" : `z-${10 - i}`
                    )}
                    title={account.username || account.displayName}
                  >
                    {account.picture?.data?.url ? (
                      <img src={account.picture.data.url} alt={account.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-[10px] font-bold text-gray-500">
                        {(account.username || account.displayName)?.charAt(0).toUpperCase() || "I"}
                      </div>
                    )}
                    {selectedPageId === account.igUserId && (
                      <div className="absolute inset-0 bg-pink-600/10 flex items-center justify-center">
                        <div className="bg-white rounded-full p-0.5 shadow-sm">
                          <Check className="h-2 w-2 text-pink-600 stroke-[4]" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {accounts.length > 3 && (
                  <div
                    onClick={() => setSelectedPageId("all")}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 border-white bg-black flex items-center justify-center shadow-sm z-10 cursor-pointer hover:scale-110",
                      selectedPageId === "all" && "ring-2 ring-pink-600 ring-offset-2"
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
              className="group relative px-6 h-11 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-black rounded-xl shadow-xl shadow-pink-100 transition-all duration-300 hover:scale-[1.02] active:scale-95"
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
          <TabsTrigger value="instagram" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-pink-50 data-[state=active]:text-pink-600 font-bold text-gray-500 gap-2">
            <Grid className="h-4 w-4" /> Instagram View
          </TabsTrigger>
          <TabsTrigger value="listing" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 font-bold text-gray-500 gap-2">
            <List className="h-4 w-4" /> Listing View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CalendarViewComponent
            onDateClick={handleDateClick}
            onPostClick={handlePostClick}
            onRefresh={handleRefresh}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="instagram" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <InstagramViewComponent
            accountId={selectedPageId === "all" ? null : selectedPageId}
            initialStatus="all"
            refreshTrigger={refreshTrigger}
            onEdit={handlePostClick}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="listing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ListingViewComponent
            pageId={selectedPageId === "all" ? null : selectedPageId}
            initialStatus="all"
            refreshTrigger={refreshTrigger}
            onEdit={handlePostClick}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>

      <Dialog
        open={isCreating}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setCreateInitialData(null);
          }
        }}
      >
        <DialogContent className="!w-[80vw] !max-w-[80vw] h-[90vh] overflow-hidden p-0 border-0 bg-transparent shadow-none" showCloseButton={false}>
          {isCreating && (
            <div className="bg-white w-full h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center justify-between font-sans shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg shadow-md"><Instagram className="h-3.5 w-3.5 text-white" /></div>
                  <div><DialogTitle className="text-sm font-black text-gray-900 leading-none">Post Creator</DialogTitle></div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full hover:bg-gray-100"><X className="h-5 w-5 text-gray-400" /></Button>
              </div>
              <CreatePostForm
                initialData={createInitialData}
                onSuccess={() => {
                  setIsCreating(false);
                  setCreateInitialData(null);
                  setRefreshTrigger(prev => prev + 1);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog for Calendar View */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the post from our records.
              {deleteDialog.postStatus === 'published' && " Note: This will not delete the post from Instagram."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteDialog.postId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Analytics Modal */}
      <InstagramAnalyticsModal
        open={analyticsModal.open}
        onOpenChange={(open) => setAnalyticsModal(prev => ({ ...prev, open }))}
        post={analyticsModal.post}
      />
    </div >
  );
}