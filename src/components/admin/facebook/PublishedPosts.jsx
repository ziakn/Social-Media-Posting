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
  Search, TrendingUp, ThumbsUp, MessageCircle, Eye, ChevronRight, ExternalLink,
  Trash2, MoreVertical, X, Filter, Layers, ImageIcon, Film, Play, Edit,
  List, Grid, Calendar as CalendarIcon, Plus, Video, Grid3X3, Upload,
  Facebook, Zap, Clock, Users, ChevronUp, ChevronDown, Loader2, Check,
  ArrowLeft, Send, History, Share2, Globe, FileText, Link2
} from "lucide-react";

// Server Actions
import {
  getFacebookPosts, deleteFacebookPost, updatePostSchedule, publishFacebookPostNow, getUserFacebookPages, updateFacebookPost
} from "@/app/actions/social/facebook/facebookPostsActions";
import {
  createFacebookTextPost,
  createFacebookImagePost,
  createFacebookVideoPost,
  createFacebookLinkPost,
  createFacebookPollPost
} from "@/app/actions/social/facebook/createPost";
import { getDateTime } from "@/lib/utils";

// Internal Components
import FacebookCalendarViewComponent from "@/components/admin/facebook/FacebookCalendarViewComponent";
import FacebookViewComponent from "@/components/admin/facebook/FacebookViewComponent";
import FacebookListingViewComponent from "@/components/admin/facebook/FacebookListingViewComponent";
import FacebookPreview from "@/components/admin/facebook/FacebookPreview";
import FacebookAnalyticsModal from "@/components/admin/facebook/FacebookAnalyticsModal";

// -----------------------------------------------------------------------------
// CREATE POST FORM
// -----------------------------------------------------------------------------
function CreatePostForm({ initialData = null, onSuccess = null }) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData?.id;
  const isReadOnly = initialData?.readOnly || false;

  const getInitialPostType = (type) => {
    if (!type) return "text";
    return type;
  };
  const [postType, setPostType] = useState(getInitialPostType(initialData?.postType));
  const [postContent, setPostContent] = useState({
    message: initialData?.message || initialData?.content?.caption || "",
    media: initialData?.mediaUrls || (initialData?.content?.media ? (Array.isArray(initialData.content.media) ? initialData.content.media : [initialData.content.media]) : []),
    link: initialData?.additionalData?.link || "",
  });

  const [scheduling, setScheduling] = useState({
    schedule: !!initialData?.scheduledAt,
    date: initialData?.scheduledAt ? new Date(initialData.scheduledAt) : new Date(),
    time: initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "HH:mm") : "12:00",
  });

  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(initialData?.pageId || null);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryMediaType, setGalleryMediaType] = useState("image");
  const [currentSlide, setCurrentSlide] = useState(0);
  const selectionScrollRef = useRef(null);

  useEffect(() => {
    async function loadPages() {
      const res = await getUserFacebookPages();
      if (res.success) {
        setPages(res.pages || []);
      }
    }
    loadPages();
  }, []);

  const openGallery = (types) => {
    setGalleryMediaType(types);
    setGalleryOpen(true);
  };

  const handleGallerySelect = (selectedItems) => {
    const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
    const newMedia = items.map(item => ({
      url: item.fileUrl, name: item.fileName, size: item.fileSize,
      type: item.mediaType || (item.fileType?.startsWith('video') ? 'video' : 'image'),
      mimeType: item.fileType, file: null
    }));

    if (postType === "video") {
      setPostContent(prev => ({ ...prev, media: [newMedia[0]] }));
      setGalleryOpen(false);
      setCurrentSlide(0);
      return;
    }

    const maxMedia = 10;
    const totalMedia = postContent.media.length + newMedia.length;
    if (totalMedia > maxMedia) {
      toast.error(`You can upload maximum ${maxMedia} items`);
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
    if (!selectedPage) return toast.error("Please select a Facebook page first");
    if (postType === "text" && !postContent.message.trim()) return toast.error("Please add a message for your post");
    if ((postType === "images" || postType === "carousel") && postContent.media.length === 0) return toast.error("Please add at least one image");
    if (postType === "video" && !postContent.media.length) return toast.error("Please add a video");
    if (postType === "link" && !postContent.link) return toast.error("Please add a link");

    startTransition(async () => {
      try {
        let result;
        const scheduledTime = scheduling.schedule ? getDateTime(scheduling.date, scheduling.time) : null;

        const commonProps = {
          pageId: selectedPage,
          message: postContent.message,
          scheduledTime,
          additionalData: {
            ...(postType === 'link' && { link: postContent.link }),
          },
        };

        if (isEditing) {
          let scheduleChanged = false;
          let messageChanged = false;
          let mediaChanged = false;
          let linkChanged = false;

          // Robust check for schedule change
          const oldTime = initialData?.scheduledAt ? new Date(initialData.scheduledAt).getTime() : null;
          const newTime = scheduledTime ? scheduledTime.getTime() : null;

          if (oldTime !== newTime) {
            scheduleChanged = true;
          }

          if (postContent.message !== initialData.message) {
            messageChanged = true;
          }

          // Check for media changes
          const oldMedia = JSON.stringify(initialData?.mediaUrls || []);
          const newMedia = JSON.stringify(postContent.media || []);
          if (oldMedia !== newMedia) {
            mediaChanged = true;
          }

          // Check for link changes
          if (postType === 'link' && postContent.link !== initialData?.additionalData?.link) {
            linkChanged = true;
          }

          if (!scheduleChanged && !messageChanged && !mediaChanged && !linkChanged) {
            toast.info("No changes detected");
            if (onSuccess) onSuccess();
            return;
          }

          try {
            if (scheduleChanged) {
              result = await updatePostSchedule(initialData.id, scheduledTime);
              if (!result.success) throw new Error(result.message);
            }
            if (messageChanged || mediaChanged || linkChanged) {
              const updatedAdditionalData = linkChanged ? { ...initialData.additionalData, link: postContent.link } : null;
              result = await updateFacebookPost(
                initialData.id,
                postContent.message,
                mediaChanged ? postContent.media : null,
                updatedAdditionalData
              );
              if (!result.success) throw new Error(result.message);
            }

            toast.success("Post updated successfully!");
            if (onSuccess) onSuccess(result);
          } catch (err) {
            toast.error(err.message || "Failed to update post");
          }
          return;
        }

        switch (postType) {
          case "text":
            result = await createFacebookTextPost(commonProps);
            break;
          case "images":
          case "carousel":
            result = await createFacebookImagePost({ ...commonProps, mediaUrls: postContent.media });
            break;
          case "video":
            result = await createFacebookVideoPost({ ...commonProps, mediaUrls: postContent.media });
            break;
          case "link":
            result = await createFacebookLinkPost(commonProps);
            break;
        }

        if (result.success) {
          toast.success(scheduling.schedule ? "Post scheduled!" : "Post published!");
          if (onSuccess) onSuccess(result);
        } else {
          toast.error(result.message || "Failed to create post");
        }
      } catch (error) {
        console.error("Submit error:", error);
        toast.error(error.message || "An unexpected error occurred");
      }
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
          {/* Channel Selection */}
          <div className="space-y-3 px-2">
            <div className="flex items-center gap-2 opacity-40">
              <Facebook className="h-2.5 w-2.5 text-blue-600" />
              <h3 className="text-[8px] font-black text-gray-900 uppercase tracking-[0.3em]"> Channel Selection </h3>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              {pages.map((page) => {
                const isSelected = selectedPage === page.pageId;
                return (
                  <div key={page.pageId} onClick={() => !isReadOnly && setSelectedPage(page.pageId)} className={cn("group relative cursor-pointer transition-all duration-300 flex items-center justify-center rounded-full border p-1 bg-white", isSelected ? "border-blue-500 bg-blue-50 shadow-lg" : "w-12 h-12 border-gray-100 opacity-60", isReadOnly && "cursor-default")}>
                    <div className="w-10 h-10 relative">
                      <div className={cn("w-full h-full rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px]", isSelected && "animate-spin-slow")}>
                        <div className="w-full h-full rounded-full bg-white p-[2px]">
                          <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black overflow-hidden text-xs">
                            {page.profilePicture ? <img src={page.profilePicture} alt="" className="w-full h-full object-cover" /> : page.pageName.charAt(0)}
                          </div>
                        </div>
                      </div>
                      {isSelected && <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1"><Check className="h-2 w-2" /></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 lg:gap-8 items-start">
            <div className="space-y-6">
              {/* Scheduling */}
              <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    <h3 className="text-xs font-black text-gray-900 leading-none">Smart Scheduler</h3>
                  </div>
                  <Switch disabled={isReadOnly} checked={scheduling.schedule} onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))} className="data-[state=checked]:bg-blue-600 scale-75" />
                </div>
                {scheduling.schedule && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-50">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button disabled={isReadOnly} variant="outline" className="w-full h-8 rounded-lg text-xs justify-start px-2"><CalendarIcon className="mr-1.5 h-3 w-3 text-blue-500" /> {scheduling.date ? format(scheduling.date, "MMM dd, yyyy") : "Date"}</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-0 rounded-3xl" align="start"><Calendar mode="single" selected={scheduling.date} onSelect={(date) => date && setScheduling(prev => ({ ...prev, date }))} disabled={{ before: new Date() }} initialFocus /></PopoverContent>
                    </Popover>
                    <Input disabled={isReadOnly} type="time" value={scheduling.time} onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value }))} className="h-8 rounded-lg text-xs" />
                  </div>
                )}
              </div>

              {/* Content Editor */}
              <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-900 uppercase">Format</h3>
                  <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
                    {["text", "images", "video", "link"].map(type => (
                      <button
                        key={type}
                        disabled={isReadOnly || isEditing}
                        onClick={() => { setPostType(type); setPostContent(prev => ({ ...prev, media: [] })); }}
                        className={cn(
                          "px-4 py-1.5 rounded-md text-[9px] font-black uppercase transition-all",
                          postType === type
                            ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5 opacity-100"
                            : "text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <SocialCaptionEditor disabled={isReadOnly} value={postContent.message} onChange={(e) => setPostContent(prev => ({ ...prev, message: e.target.value }))} placeholder="What's the story today?" platform="facebook" className="rounded-xl border-gray-50 bg-gray-50/50 p-4 font-medium text-sm text-gray-800" />
                <div className="flex justify-end">
                  <span className={cn("text-[10px] font-black uppercase", postContent.message.length > 63206 ? "text-red-500" : "text-gray-300")}>
                    {postContent.message.length} / 63206
                  </span>
                </div>

                {postType === "link" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-400">Target URL</Label>
                    <Input disabled={isReadOnly} placeholder="https://..." value={postContent.link} onChange={(e) => setPostContent(prev => ({ ...prev, link: e.target.value }))} className="rounded-xl h-10 bg-gray-50/50 border-none px-4 text-sm" />
                  </div>
                )}

                {(postType === "images" || postType === "carousel" || postType === "video") && (
                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-gray-900">Media</Label>
                    <Button
                      disabled={isReadOnly}
                      variant="outline"
                      onClick={() => openGallery(["image", "video"])}
                      className="h-24 w-full rounded-2xl border-2 border-dashed border-gray-100 hover:border-blue-500 hover:bg-blue-50 flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-3"><ImageIcon className="h-5 w-5 text-blue-600" /></div>
                      <span className="text-xs font-black uppercase text-gray-600">Select Media</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:sticky top-0 flex gap-4">
              <div className="flex-1 min-w-0">
                <FacebookPreview postType={postType} content={postContent} page={pages.find(p => p.pageId === selectedPage)} currentSlide={currentSlide} />
              </div>

              {postContent.media.length > 0 && (
                <div className="hidden lg:flex flex-col items-center py-2 bg-white rounded-2xl border border-gray-100 shadow-sm w-20 shrink-0 h-fit">
                  <Button variant="ghost" size="icon" onClick={() => scrollSelection('up')} className="h-6 w-6 text-gray-400 hover:text-blue-600 mb-2">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div ref={selectionScrollRef} className="flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[450px] px-2">
                    {postContent.media.map((item, index) => (
                      <div key={index} className={cn("relative group shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer", currentSlide === index ? "border-blue-500 ring-2 ring-blue-100 scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-200")} onClick={() => setCurrentSlide(index)}>
                        {item.type?.startsWith('video') ? <div className="w-full h-full bg-black flex items-center justify-center"><Play className="h-4 w-4 text-white fill-white" /></div> : <img src={item.url} className="w-full h-full object-cover" alt="" />}
                        {!isReadOnly && (
                          <div onClick={(e) => { e.stopPropagation(); removeMedia(index); }} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[1px]"><Trash2 className="h-5 w-5 text-white" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => scrollSelection('down')} className="h-6 w-6 text-gray-400 hover:text-blue-600 mt-2">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div className="p-4 border-t bg-white shrink-0 flex justify-end gap-3 px-8">
          <Button disabled={isPending} onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-12 h-11">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEditing ? <Edit className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />)}
            {isEditing ? "Save Changes" : (scheduling.schedule ? "Schedule Post" : "Publish Now")}
          </Button>
        </div>
      )}
      <GalleryModal open={galleryOpen} onOpenChange={setGalleryOpen} onSelect={handleGallerySelect} allowedTypes={galleryMediaType} allowMultiple={postType !== 'video'} maxSelection={10} />
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN ENTRY POINT
// -----------------------------------------------------------------------------
export default function PublishedPosts({ pageId: initialPageId, viewMode = "grid" }) {
  const [activeTab, setActiveTab] = useState("calendar");
  const [isCreating, setIsCreating] = useState(false);
  const [createInitialData, setCreateInitialData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });
  const [analyticsModal, setAnalyticsModal] = useState({ open: false, post: null });

  const handleDelete = async (postId) => {
    try {
      const result = await deleteFacebookPost(postId);
      if (result.success) {
        toast.success("Post deleted successfully!");
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(result.message || "Failed to delete post");
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
    }
  };

  const handleDateClick = (date) => {
    setCreateInitialData({
      scheduledAt: date,
      readOnly: false
    });
    setIsCreating(true);
  };

  const handlePostClick = (post, action = 'edit') => {
    if (action === 'delete') {
      setDeleteDialog({ open: true, postId: post.id });
      return;
    }
    if (action === 'analytics') {
      setAnalyticsModal({ open: true, post });
      return;
    }
    setCreateInitialData({ ...post, readOnly: post.status === 'published' });
    setIsCreating(true);
  };

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Premium Compact Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg shadow-blue-50/20 p-5 lg:p-6">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-gradient-to-br from-blue-200/10 to-indigo-200/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600">
              <Facebook className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-wider">Meta Business Academy</span>
            </div>

            <div className="space-y-0.5">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Content Studio
              </h1>
              <p className="text-gray-500 max-w-md text-xs font-medium leading-relaxed">
                Elevate your social presence with precision scheduling and analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-row items-center -space-x-2 mr-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                  <img src={`https://i.pravatar.cc/150?u=${i + 15}`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                setCreateInitialData(null);
                setIsCreating(true);
              }}
              className="group relative px-6 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-xl shadow-blue-100 transition-all duration-300 hover:scale-[1.02] active:scale-95"
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
          <TabsTrigger value="calendar" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 font-bold text-gray-500 gap-2">
            <CalendarIcon className="h-4 w-4" /> Calendar View
          </TabsTrigger>
          <TabsTrigger value="facebook" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 font-bold text-gray-500 gap-2">
            <Grid className="h-4 w-4" /> Facebook View
          </TabsTrigger>
          <TabsTrigger value="listing" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 font-bold text-gray-500 gap-2">
            <List className="h-4 w-4" /> Listing View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <FacebookCalendarViewComponent
            onDateClick={handleDateClick}
            onPostClick={handlePostClick}
            refreshTrigger={refreshTrigger}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="facebook" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <FacebookViewComponent
            pageId={initialPageId}
            initialStatus="all"
            refreshTrigger={refreshTrigger}
            onEdit={handlePostClick}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="listing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <FacebookListingViewComponent
            pageId={initialPageId}
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
                  <div className="p-1.5 bg-blue-600 rounded-lg shadow-md"><Facebook className="h-3.5 w-3.5 text-white" /></div>
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black tracking-tight text-gray-900">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium pt-2 leading-relaxed">
              This action cannot be undone. This will permanently remove the post from our servers and attempt to delete it from Facebook.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="rounded-xl border-gray-100 font-black tracking-tight h-12 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteDialog.postId)} className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl h-12 px-8 shadow-lg shadow-red-100">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Analytics Modal */}
      <FacebookAnalyticsModal
        open={analyticsModal.open}
        onOpenChange={(open) => setAnalyticsModal(prev => ({ ...prev, open }))}
        post={analyticsModal.post}
      />
    </div>
  );
}