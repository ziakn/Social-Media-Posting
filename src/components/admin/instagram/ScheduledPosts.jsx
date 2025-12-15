"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Edit3,
  Trash2,
  MoreHorizontal,
  Play,
  Plus,
  FileText,
  Video,
  Image as ImageIcon,
  Layers,
  Link,
  Instagram,
  ChevronRight,
  ExternalLink,
  X,
  RefreshCw,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { getScheduledInstagramPosts } from "@/app/actions/social/instagram/getPosts";
import { deleteInstagramPost } from "@/app/actions/social/instagram/deletePost";

const postTypeConfig = {
  image: { icon: ImageIcon, color: "bg-pink-100 text-pink-800 border-pink-200", label: "Image" },
  video: { icon: Video, color: "bg-purple-100 text-purple-800 border-purple-200", label: "Reel/Video" },
  carousel: { icon: Layers, color: "bg-orange-100 text-orange-800 border-orange-200", label: "Carousel" },
  story: { icon: Clock, color: "bg-blue-100 text-blue-800 border-blue-200", label: "Story" },
};

export default function ScheduledPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [pagination, setPagination] = useState({
    hasMore: false,
    lastVisible: null,
    pageSize: 12,
  });

  // Dialog states
  const [viewDialog, setViewDialog] = useState({ open: false, post: null, currentSlide: 0 });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });

  // Placeholder handlers for actions not yet implemented in backend for Instagram specifically (Edit/Reschedule/Delete)
  // We will wire these up if the actions exist, or leave placeholders.
  // Assuming delete/reschedule might need specific Instagram actions or generic ones.
  // For now, I'll keep the logic simple, focusing on Display and Preview as requested.

  const handleDelete = async (postId) => {
    try {
      const result = await deleteInstagramPost(postId);

      if (result.success) {
        toast.success(result.message);
        // Remove from local state
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete post");
    }
  };

  const loadPosts = async (reset = false, lastDocId = null) => {
    try {
      setLoading(true);
      const result = await getScheduledInstagramPosts({
        pagination: {
          pageSize: pagination.pageSize,
          lastPostId: reset ? null : lastDocId
        }
      });

      if (result.success) {
        if (reset || !lastDocId) {
          setPosts(result.posts || []);
        } else {
          setPosts(prev => [...prev, ...result.posts]);
        }

        setPagination(prev => ({
          ...prev,
          hasMore: result.hasMore || false,
          lastVisible: result.lastPostId || null,
        }));
      } else {
        toast.error(result.message || "Failed to load scheduled posts");
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Error loading scheduled posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(true);
  }, []);

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const newTimeRemaining = {};

      posts.forEach(post => {
        if (!post.scheduledAt) return;

        const scheduledTime = new Date(post.scheduledAt);
        const diff = scheduledTime - now;

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          newTimeRemaining[post.id] = { days, hours };
        } else {
          newTimeRemaining[post.id] = { days: 0, hours: 0 }; // Past due?
        }
      });

      setTimeRemaining(newTimeRemaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [posts]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && pagination.lastVisible) {
      loadPosts(false, pagination.lastVisible);
    }
  };


  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-pink-50 via-white to-purple-50 border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-50 via-white to-purple-50 border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Scheduled Posts
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 pl-13">
                Manage your upcoming Instagram content
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
                <Plus className="h-4 w-4 mr-2" />
                Schedule New Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2 border-muted">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Instagram className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No scheduled posts</h3>
            <p className="text-muted-foreground">Schedule content to see it appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="group relative border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white aspect-square flex flex-col"
              >
                <div className="absolute inset-0 z-0 bg-gray-50 cursor-pointer" onClick={() => setViewDialog({ open: true, post, currentSlide: 0 })}>
                  {post.mediaUrl || (post.carouselMedia && post.carouselMedia.length > 0) ? (
                    <>
                      {post.postType === 'video' || (post.mediaType === 'video') ? (
                        <div className="w-full h-full bg-black relative">
                          <video src={post.mediaUrl} className="w-full h-full object-cover opacity-90" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/30 backdrop-blur-md p-3 rounded-full shadow-lg">
                              <Play className="h-6 w-6 text-white fill-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={post.mediaUrl || (post.carouselMedia?.[0]?.url)}
                          alt="Post"
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${post.postType === 'story' ? 'scale-90 object-contain bg-gray-900' : ''}`}
                        />
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4 text-center">
                      <FileText className="h-8 w-8 text-gray-300 mb-2" />
                    </div>
                  )}
                </div>

                {/* Top Actions (Hover) */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-700 border border-gray-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-red-600" onClick={() => setDeleteDialog({ open: true, postId: post.id })}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-20 pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-full px-2 py-1 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-purple-600" />
                    <span className="text-[10px] font-semibold text-gray-700">
                      {timeRemaining[post.id] ? `${timeRemaining[post.id].days}d ${timeRemaining[post.id].hours}h` : "Scheduled"}
                    </span>
                  </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 z-10 pointer-events-none text-white">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold">{post.pageName || "Instagram User"}</span>
                      {(post.postType === 'carousel') && (
                        <span className="text-[10px] bg-black/40 px-1.5 rounded-full backdrop-blur-sm flex items-center gap-0.5">
                          <Layers className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs line-clamp-2 leading-snug font-medium text-gray-100 drop-shadow-md">
                      {post.caption || "No caption"}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-300 pt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.scheduledAt)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {/* Load More */}
          {pagination.hasMore && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Posts"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* View Post Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[1100px] p-0 overflow-hidden bg-white" showCloseButton={false}>
          <div className="flex flex-col md:flex-row h-[85vh] md:h-[650px]">
            {/* Media Section */}
            <div className="w-full md:w-[65%] bg-zinc-950 flex items-center justify-center relative">
              {(() => {
                const post = viewDialog.post;
                if (!post) return null;

                let mediaList = [];
                if (post.carouselMedia && post.carouselMedia.length > 0) {
                  mediaList = post.carouselMedia;
                } else if (post.mediaUrl) {
                  mediaList = [{ url: post.mediaUrl, type: post.postType === 'video' ? 'video' : 'image' }];
                }

                const currentMedia = mediaList[viewDialog.currentSlide || 0];

                if (!currentMedia) {
                  return <div className="text-white">No media</div>;
                }

                const isVideo = currentMedia.type === 'video' || post.postType === 'video';

                return (
                  <div className="relative w-full h-full flex items-center justify-center group">
                    {isVideo ? (
                      <video src={currentMedia.url} controls className="max-w-full max-h-full" />
                    ) : (
                      <img
                        src={currentMedia.url}
                        alt="Swipe"
                        className={`max-w-full max-h-full object-contain ${post.postType === 'story' ? 'scale-90' : ''}`}
                      />
                    )}

                    {/* Navigation */}
                    {mediaList.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewDialog(prev => ({ ...prev, currentSlide: Math.max(0, prev.currentSlide - 1) }));
                          }}
                          disabled={viewDialog.currentSlide === 0}
                        >
                          <ChevronRight className="h-8 w-8 rotate-180" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewDialog(prev => ({ ...prev, currentSlide: Math.min(mediaList.length - 1, prev.currentSlide + 1) }));
                          }}
                          disabled={viewDialog.currentSlide === mediaList.length - 1}
                        >
                          <ChevronRight className="h-8 w-8" />
                        </Button>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Details Section */}
            <div className="w-full md:w-[35%] flex flex-col h-full bg-white border-l">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={viewDialog.post?.pageProfilePicture} />
                    <AvatarFallback>{viewDialog.post?.pageName?.[0] || "I"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-sm">{viewDialog.post?.pageName || "Instagram User"}</div>
                    <div className="text-xs text-amber-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Scheduled for {viewDialog.post && formatDate(viewDialog.post.scheduledAt)}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setViewDialog({ open: false, post: null })}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{viewDialog.post?.caption}</p>
              </div>
              <div className="p-4 border-t bg-gray-50 flex gap-2">
                <Button className="w-full" disabled variant="secondary">
                  Actions Coming Soon
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scheduled Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scheduled post? This action cannot be undone.
              The post will be removed from the schedule and will not be published.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.postId) {
                  handleDelete(deleteDialog.postId);
                  setDeleteDialog({ open: false, postId: null });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}