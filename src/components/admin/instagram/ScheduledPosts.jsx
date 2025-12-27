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
import FullCalendar from "./FullCalendar";
import CreatePost from "./CreatePost";

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
  const [createDialog, setCreateDialog] = useState({ open: false, initialData: null });

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

  const handleDateClick = (date) => {
    setCreateDialog({
      open: true,
      initialData: {
        scheduling: {
          schedule: true,
          date: date,
          time: format(new Date(), "HH:mm"),
          timezone: "UTC"
        }
      }
    });
  };

  const handlePostClick = (post) => {
    setViewDialog({ open: true, post, currentSlide: 0 });
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
      {/* Header - Simplified as Calendar has its own or we can keep it */}
      <Card className="bg-gradient-to-r from-pink-50 via-white to-purple-50 border border-gray-200 shadow-sm hidden">
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
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                onClick={() => setCreateDialog({ open: true, initialData: null })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule New Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <FullCalendar
        posts={posts}
        onDateClick={handleDateClick}
        onPostClick={handlePostClick}
      />

      {/* Original Grid - Removed or kept as fallback? Let's remove for cleaner redesign */}

      {/* View Post Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="w-full max-w-[95vw] lg:max-w-[1100px] p-0 overflow-hidden bg-white rounded-2xl lg:rounded-3xl shadow-2xl border-0" showCloseButton={false}>
          <div className="flex flex-col lg:flex-row h-auto max-h-[95vh] lg:h-[650px]">
            {/* Media Section */}
            <div className="w-full lg:w-[65%] bg-zinc-950 flex items-center justify-center relative min-h-[300px] lg:min-h-0">
              {(() => {
                const post = viewDialog.post;
                if (!post) return null;

                let mediaList = [];
                if (post.content?.media && post.content.media.length > 0) {
                  mediaList = post.content.media;
                } else if (post.carouselMedia && post.carouselMedia.length > 0) {
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
            <div className="w-full lg:w-[35%] flex flex-col h-full bg-white border-l">
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
      {/* Create Post Dialog */}
      <Dialog open={createDialog.open} onOpenChange={(open) => setCreateDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[1200px] h-[90vh] p-0 overflow-y-auto bg-gray-50">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-6 w-6 text-purple-600" />
                Schedule Post
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setCreateDialog({ open: false, initialData: null })}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <CreatePost
              initialData={createDialog.initialData}
              onSuccess={() => {
                setCreateDialog({ open: false, initialData: null });
                loadPosts(true); // Refresh the list
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}