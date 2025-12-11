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
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { toast } from "sonner";
import { getScheduledPosts, togglePostStatus, deleteScheduledPost, reschedulePost } from "@/app/actions/social/facebook/getScheduledPosts";

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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <PostTypeBadge type={post.postType} />
                      <StatusBadge status={post.status} />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setRescheduleDialog({
                          open: true,
                          postId: post.id,
                          newDate: post.scheduledAt ? format(new Date(post.scheduledAt), "yyyy-MM-dd") : "",
                          newTime: post.scheduledAt ? format(new Date(post.scheduledAt), "HH:mm") : "12:00",
                        })}
                        title="Reschedule"
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteDialog({ open: true, postId: post.id })}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-900">{post.pageName}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(post.scheduledAt)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Post Content */}
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {post.message || post.caption || "No caption provided"}
                    </p>

                    {post.mediaUrls?.[0]?.url && (
                      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={post.mediaUrls[0].url}
                          alt="Scheduled post content"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Countdown Timer */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Publishing in
                        </span>
                      </div>
                    </div>

                    {timeRemaining[post.id] && (
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-900">
                            {timeRemaining[post.id].days}
                          </div>
                          <div className="text-xs text-blue-700">Days</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-900">
                            {timeRemaining[post.id].hours.toString().padStart(2, "0")}
                          </div>
                          <div className="text-xs text-blue-700">Hours</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-900">
                            {timeRemaining[post.id].minutes.toString().padStart(2, "0")}
                          </div>
                          <div className="text-xs text-blue-700">Minutes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-900">
                            {timeRemaining[post.id].seconds.toString().padStart(2, "0")}
                          </div>
                          <div className="text-xs text-blue-700">Seconds</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span>Expected Reach</span>
                      </div>
                      <span className="font-medium">
                        {formatNumber(post.metrics?.expectedReach || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-3 w-3 text-gray-500" />
                        <span>Avg. Engagement</span>
                      </div>
                      <span className="font-medium text-green-600">
                        {(post.metrics?.previousEngagement || 0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to edit page or open edit modal
                      console.log("Edit post:", post.id);
                    }}
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" title="Preview">
                    <Eye className="h-3 w-3" />
                  </Button>
                </CardFooter>
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
    </div>
  );
}