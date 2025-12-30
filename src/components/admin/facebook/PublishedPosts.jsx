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
  getFacebookPosts, deleteFacebookPost, updatePostSchedule, publishFacebookPostNow, getUserFacebookPages
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

  const [postType, setPostType] = useState(initialData?.postType || "text");
  const [postContent, setPostContent] = useState({
    message: initialData?.message || "",
    media: initialData?.mediaUrls || [],
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
        if (!selectedPage && res.pages.length > 0) {
          setSelectedPage(res.pages[0].pageId);
        }
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
          // Simplified update: Facebook usually just allows updating the message or schedule
          if (scheduling.schedule !== !!initialData?.scheduledAt || scheduling.time !== format(new Date(initialData.scheduledAt), "HH:mm")) {
            result = await updatePostSchedule(initialData.id, scheduledTime);
          }
          // Also handle message update
          if (postContent.message !== initialData.message) {
            result = await import("@/app/actions/social/facebook/facebookPostsActions").then(m => m.updateFacebookPost(initialData.id, postContent.message));
          }

          if (result?.success) {
            toast.success("Post updated successfully!");
            if (onSuccess) onSuccess(result);
          } else if (result) {
            toast.error(result.message || "Failed to update post");
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
            <div className="flex items-center gap-2 opacity-50">
              <Facebook className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest"> Facebook Pages </h3>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              {pages.map((page) => {
                const isSelected = selectedPage === page.pageId;
                return (
                  <div key={page.pageId} onClick={() => !isReadOnly && setSelectedPage(page.pageId)} className={cn("group relative cursor-pointer transition-all duration-300 flex items-center justify-center rounded-full border p-1 bg-white", isSelected ? "border-blue-500 bg-blue-50 shadow-lg" : "w-12 h-12 border-gray-100 opacity-60")}>
                    <div className="w-10 h-10 relative">
                      <Avatar className="w-full h-full">
                        <AvatarImage src={page.profilePicture} />
                        <AvatarFallback className="bg-blue-600 text-white font-bold">{page.pageName[0]}</AvatarFallback>
                      </Avatar>
                      {isSelected && <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 border-2 border-white"><Check className="h-2 w-2" /></div>}
                    </div>
                    <div className={cn("absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50", isSelected && "opacity-100")}>
                      {page.pageName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 lg:gap-8 items-start">
            <div className="space-y-6">
              {/* Scheduling */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-black text-gray-900 leading-none">Smart Scheduler</h3>
                  </div>
                  <Switch disabled={isReadOnly} checked={scheduling.schedule} onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))} className="data-[state=checked]:bg-blue-600" />
                </div>
                {scheduling.schedule && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button disabled={isReadOnly} variant="outline" className="w-full h-10 rounded-lg text-sm justify-start px-3 font-medium"><CalendarIcon className="mr-2 h-4 w-4 text-blue-500" /> {scheduling.date ? format(scheduling.date, "MMM dd, yyyy") : "Date"}</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-0 rounded-2xl" align="start"><Calendar mode="single" selected={scheduling.date} onSelect={(date) => date && setScheduling(prev => ({ ...prev, date }))} disabled={{ before: new Date() }} initialFocus /></PopoverContent>
                    </Popover>
                    <Input disabled={isReadOnly} type="time" value={scheduling.time} onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value }))} className="h-10 rounded-lg text-sm" />
                  </div>
                )}
              </div>

              {/* Content Editor */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Post Format</h3>
                  <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
                    {["text", "images", "video", "link"].map(type => (
                      <button
                        key={type}
                        disabled={isReadOnly || isEditing}
                        onClick={() => { setPostType(type); setPostContent(prev => ({ ...prev, media: [] })); }}
                        className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", postType === type ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <SocialCaptionEditor disabled={isReadOnly} value={postContent.message} onChange={(e) => setPostContent(prev => ({ ...prev, message: e.target.value }))} placeholder="What's the story today?" platform="facebook" className="min-h-[160px] rounded-2xl bg-gray-50/50 border-none p-6 text-base font-medium" />

                {postType === "link" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-gray-400">Target URL</Label>
                    <Input disabled={isReadOnly} placeholder="https://..." value={postContent.link} onChange={(e) => setPostContent(prev => ({ ...prev, link: e.target.value }))} className="rounded-xl h-12 bg-gray-50/50 border-none px-4" />
                  </div>
                )}

                {(postType === "images" || postType === "carousel" || postType === "video") && (
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase text-gray-400">Media Assets</Label>
                    <Button disabled={isReadOnly} variant="outline" onClick={() => openGallery(postType === "video" ? ["video"] : ["image", "video"])} className="h-32 w-full rounded-2xl border-2 border-dashed border-gray-100 hover:border-blue-500 hover:bg-blue-50 flex flex-col gap-3 transition-all group">
                      <div className="p-3 bg-gray-50 rounded-full group-hover:bg-blue-100 transition-colors"><ImageIcon className="h-6 w-6 text-blue-600" /></div>
                      <span className="text-xs font-black uppercase text-gray-600 tracking-widest">Select From Gallery</span>
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
                <div className="hidden lg:flex flex-col items-center py-4 bg-white rounded-2xl border border-gray-100 shadow-sm w-20 shrink-0 h-fit">
                  <Button variant="ghost" size="icon" onClick={() => scrollSelection('up')} className="h-6 w-6 text-gray-300 hover:text-blue-600 mb-2">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div ref={selectionScrollRef} className="flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[400px] px-2">
                    {postContent.media.map((item, index) => (
                      <div key={index} className={cn("relative group shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer", currentSlide === index ? "border-blue-500 ring-4 ring-blue-50 scale-105" : "border-transparent opacity-60 hover:opacity-100")} onClick={() => setCurrentSlide(index)}>
                        {item.type?.startsWith('video') ? <div className="w-full h-full bg-black flex items-center justify-center"><Play className="h-4 w-4 text-white fill-white" /></div> : <img src={item.url} className="w-full h-full object-cover" alt="" />}
                        {!isReadOnly && (
                          <div onClick={(e) => { e.stopPropagation(); removeMedia(index); }} className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-5 w-5 text-white" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => scrollSelection('down')} className="h-6 w-6 text-gray-300 hover:text-blue-600 mt-2">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div className="p-6 border-t bg-white flex justify-end gap-3 px-8 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <Button disabled={isPending} onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-12 h-12 shadow-lg shadow-blue-100 transition-all active:scale-95">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEditing ? <Edit className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />)}
            {isEditing ? "Save Changes" : (scheduling.schedule ? "Schedule for later" : "Post to Facebook Now")}
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen pb-20">
      {/* Dynamic Shell Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-2xl p-6 md:p-10">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-gradient-to-tr from-cyan-100/10 to-blue-200/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 shadow-sm animate-bounce-subtle">
              <Facebook className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Meta Business Suite 2.0</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-gray-900 leading-none">
                Content <span className="text-blue-600">Studio</span>
              </h1>
              <p className="text-gray-500 max-w-md text-sm font-medium leading-relaxed italic opacity-80">
                Orchestrate your Facebook identity with world-class publishing tools.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={() => {
                setCreateInitialData(null);
                setIsCreating(true);
              }}
              className="group relative px-8 h-14 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.25)] transition-all duration-300 hover:scale-[1.05] active:scale-95 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-base tracking-tight">Compose Masterpiece</span>
            </Button>
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
              <History className="h-3 w-3" />
              <span>Last sync: Just now</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/50 backdrop-blur-md border border-gray-100 p-1.5 rounded-[1.25rem] shadow-sm mb-10 h-auto inline-flex gap-1">
          <TabsTrigger value="calendar" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg font-black text-gray-400 gap-2 transition-all">
            <CalendarIcon className="h-4 w-4" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="facebook" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg font-black text-gray-400 gap-2 transition-all">
            <Grid className="h-4 w-4" /> Facebook View
          </TabsTrigger>
          <TabsTrigger value="listing" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg font-black text-gray-400 gap-2 transition-all">
            <List className="h-4 w-4" /> Listing View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="outline-none">
          <FacebookCalendarViewComponent
            onDateClick={handleDateClick}
            onPostClick={handlePostClick}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="facebook" className="outline-none">
          <FacebookViewComponent
            pageId={initialPageId}
            initialStatus="all"
            refreshTrigger={refreshTrigger}
            onEdit={handlePostClick}
          />
        </TabsContent>

        <TabsContent value="listing" className="outline-none">
          <FacebookListingViewComponent
            pageId={initialPageId}
            initialStatus="all"
            refreshTrigger={refreshTrigger}
            onEdit={handlePostClick}
          />
        </TabsContent>
      </Tabs>

      {/* Editor Modal */}
      <Dialog
        open={isCreating}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setCreateInitialData(null);
          }
        }}
      >
        <DialogContent className="!w-[90vw] !max-w-[1240px] h-[90vh] overflow-hidden p-0 border-none bg-transparent shadow-none" showCloseButton={false}>
          {isCreating && (
            <div className="bg-white w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
              <div className="px-8 py-4 bg-white border-b border-gray-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100"><Facebook className="h-5 w-5 text-white" /></div>
                  <div>
                    <DialogTitle className="text-xl font-black text-gray-900 leading-none tracking-tight">Post Designer</DialogTitle>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Creative Mode</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full h-10 w-10 hover:bg-red-50 hover:text-red-500 transition-colors"><X className="h-5 w-5" /></Button>
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
            <AlertDialogAction onClick={() => handleDelete(deleteDialog.postId)} className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl h-12 px-8 shadow-lg shadow-red-100">Delete Permanently</AlertDialogAction>
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