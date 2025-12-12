"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Edit3,
  Trash2,
  MoreHorizontal,
  Play,
  Pause,
  Users,
  BarChart3,
  Plus,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Video,
  Image as ImageIcon,
  Link2,
  Eye,
  RefreshCw,
  X,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { getScheduledPosts, togglePostStatus, deleteScheduledPost, reschedulePost, updateScheduledPost } from "@/app/actions/social/facebook/getScheduledPosts";

const postTypeConfig = {
  text: { icon: FileText, color: "bg-blue-100 text-blue-800 border-blue-200", label: "Text" },
  photo: { icon: ImageIcon, color: "bg-green-100 text-green-800 border-green-200", label: "Photo" },
  video: { icon: Video, color: "bg-purple-100 text-purple-800 border-purple-200", label: "Video" },
  link: { icon: Link2, color: "bg-amber-100 text-amber-800 border-amber-200", label: "Link" },
  carousel: { icon: ImageIcon, color: "bg-orange-100 text-orange-800 border-orange-200", label: "Carousel" },
};

const statusConfig = {
  scheduled: { icon: CheckCircle2, color: "bg-green-100 text-green-800 border-green-200", label: "Scheduled" },
  paused: { icon: Pause, color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Paused" },
  draft: { icon: Edit3, color: "bg-gray-100 text-gray-800 border-gray-200", label: "Draft" },
};

export default function ScheduledPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [timeRemaining, setTimeRemaining] = useState({});
  const [pagination, setPagination] = useState({
    hasMore: false,
    lastVisible: null,
    pageSize: 12,
  });

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });
  const [rescheduleDialog, setRescheduleDialog] = useState({ open: false, postId: null, newDate: "", newTime: "" });
  const [editDialog, setEditDialog] = useState({ open: false, postId: null, message: "" });

  // Load scheduled posts
  const loadPosts = async (reset = false, lastDocId = null) => {
    try {
      setLoading(true);
      const result = await getScheduledPosts({
        pageSize: pagination.pageSize,
        lastDocId: reset ? null : lastDocId,
        status: filter === "all" ? undefined : filter,
      });

      if (result.success) {
        if (reset || !lastDocId) {
          setPosts(result.posts || []);
        } else {
          setPosts(prev => [...prev, ...result.posts]);
        }

        setPagination(prev => ({
          ...prev,
          hasMore: result.pagination?.hasMore || false,
          lastVisible: result.pagination?.lastVisible || null,
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
  }, [filter]);

  // Calculate time remaining for each post
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
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          newTimeRemaining[post.id] = { days, hours, minutes, seconds };
        } else {
          newTimeRemaining[post.id] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
      });

      setTimeRemaining(newTimeRemaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [posts]);

  // Format date and time
  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Post actions
  const handleToggleStatus = async (postId, currentStatus) => {
    try {
      const result = await togglePostStatus(postId, currentStatus);
      if (result.success) {
        toast.success(result.message);
        // Update local state
        setPosts(prev =>
          prev.map(post =>
            post.id === postId
              ? { ...post, status: result.newStatus }
              : post
          )
        );
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update post status");
    }
  };

  const handleDelete = async (postId) => {
    try {
      const result = await deleteScheduledPost(postId);
      if (result.success) {
        toast.success(result.message);
        // Remove from local state
        setPosts(prev => prev.filter(post => post.id !== postId));
        setDeleteDialog({ open: false, postId: null });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleReschedule = async (postId, newScheduledAt) => {
    try {
      const result = await reschedulePost(postId, newScheduledAt);
      if (result.success) {
        toast.success(result.message);
        // Update local state
        setPosts(prev =>
          prev.map(post =>
            post.id === postId
              ? { ...post, scheduledAt: newScheduledAt }
              : post
          )
        );
        setRescheduleDialog({ open: false, postId: null, newDate: "", newTime: "" });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error rescheduling post:", error);
      toast.error("Failed to reschedule post");
    }
  };

  const handleUpdate = async () => {
    try {
      const { postId, message } = editDialog;
      if (!postId || !message.trim()) return;

      const result = await updateScheduledPost(postId, { message });
      if (result.success) {
        toast.success(result.message);
        // Update local state
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, message: message } : p));
        setEditDialog({ open: false, postId: null, message: "" });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error updating scheduled post:", error);
      toast.error("Failed to update post");
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && pagination.lastVisible) {
      loadPosts(false, pagination.lastVisible);
    }
  };

  const PostTypeBadge = ({ type }) => {
    const config = postTypeConfig[type] || postTypeConfig.text;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Count scheduled posts by status
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const pausedCount = posts.filter(p => p.status === 'paused').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <Card className="bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Scheduled Posts
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-600 pl-13">
                  Loading scheduled posts...
                </CardDescription>
              </div>
              <Button disabled className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Schedule New Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Only show scheduled posts
  const filteredPosts = posts.filter(post => post.status === 'scheduled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Scheduled Posts
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 pl-13">
                Manage your upcoming content and publishing schedule
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Schedule New Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2 border-muted">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              No scheduled posts
            </div>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Schedule your first post to see it appear here with countdown timers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Your First Post
              </Button>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="group relative border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white aspect-square flex flex-col"
              >
                {/* Full Card Media/Background */}
                <div className="absolute inset-0 z-0 bg-gray-50 cursor-pointer" onClick={() => {
                  setEditDialog({
                    open: true,
                    postId: post.id,
                    message: post.message || post.caption || ""
                  });
                }}>
                  {post.mediaUrls?.[0]?.url ? (
                    <>
                      {post.mediaUrls[0].type?.startsWith('video/') ? (
                        <div className="w-full h-full bg-black relative">
                          <video src={post.mediaUrls[0].url} className="w-full h-full object-cover opacity-90" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/30 backdrop-blur-md p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="h-6 w-6 text-white fill-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={post.mediaUrls[0].url}
                          alt="Post media"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}

                      {/* Subtle Gradient Overlay for Content Readability */}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                    </>
                  ) : (
                    // Text Post - Clean Light Style
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-100 p-6 text-center">
                      <FileText className="h-8 w-8 mb-2 text-gray-300" />
                      <p className="text-xs font-medium line-clamp-4 text-gray-600">
                        {post.message || "No content"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Top Actions (Floating - Invisible until hover) */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-700 border border-gray-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditDialog({
                        open: true,
                        postId: post.id,
                        message: post.message || post.caption || ""
                      })}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRescheduleDialog({
                        open: true,
                        postId: post.id,
                        newDate: post.scheduledAt ? format(new Date(post.scheduledAt), "yyyy-MM-dd") : "",
                        newTime: post.scheduledAt ? format(new Date(post.scheduledAt), "HH:mm") : "12:00",
                      })}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, postId: post.id })} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status Flag (Minimal) */}
                <div className="absolute top-3 left-3 z-20 pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-full px-2 py-1 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="text-[10px] font-semibold text-gray-700">
                      {timeRemaining[post.id] ? (
                        timeRemaining[post.id].days > 0 ? `${timeRemaining[post.id].days}d` : `${timeRemaining[post.id].hours}h`
                      ) : "Scheduled"}
                    </span>
                  </div>
                </div>

                {/* Bottom Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 z-10 pointer-events-none text-white">
                  <div className="flex flex-col gap-1">
                    {/* Page Name */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold tracking-wide drop-shadow-sm">
                        {post.pageName || "Page Name"}
                      </span>
                      {post.mediaUrls?.length > 1 && (
                        <span className="text-[10px] bg-black/40 px-1.5 rounded-full backdrop-blur-sm flex items-center gap-0.5">
                          <Layers className="h-3 w-3" /> +{post.mediaUrls.length - 1}
                        </span>
                      )}
                    </div>

                    {/* Caption */}
                    {post.mediaUrls?.[0]?.url && (
                      <p className="text-xs line-clamp-2 leading-snug font-medium text-gray-100 drop-shadow-md">
                        {post.message || "No caption"}
                      </p>
                    )}

                    {/* Scheduled Date Footer */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-300 font-medium pt-1">
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
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Scheduled Posts"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scheduled Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scheduled post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteDialog.postId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog.open} onOpenChange={(open) => setRescheduleDialog({ ...rescheduleDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Post</DialogTitle>
            <DialogDescription>
              Select a new date and time for this post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={rescheduleDialog.newDate}
                onChange={(e) => setRescheduleDialog({ ...rescheduleDialog, newDate: e.target.value })}
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={rescheduleDialog.newTime}
                onChange={(e) => setRescheduleDialog({ ...rescheduleDialog, newTime: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleDialog({ open: false, postId: null, newDate: "", newTime: "" })}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (rescheduleDialog.newDate && rescheduleDialog.newTime) {
                  const newScheduledAt = `${rescheduleDialog.newDate}T${rescheduleDialog.newTime}`;
                  handleReschedule(rescheduleDialog.postId, newScheduledAt);
                }
              }}
              disabled={!rescheduleDialog.newDate || !rescheduleDialog.newTime}
            >
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scheduled Post</DialogTitle>
            <DialogDescription>
              Update the content of your scheduled post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={editDialog.message}
                onChange={(e) => setEditDialog({ ...editDialog, message: e.target.value })}
                placeholder="What's on your mind?"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, postId: null, message: "" })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!editDialog.message.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}