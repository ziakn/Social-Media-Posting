"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { format, parseISO } from "date-fns";
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
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Calendar as CalendarIcon,
  MoreHorizontal,
  TrendingUp,
  Users,
  Clock,
  Filter,
  Download,
  Loader2,
  Search,
  ChevronRight,
  Image as ImageIcon,
  Film,
  Link,
  FileText,
  AlertCircle,
  Facebook,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  CalendarDays,
  RefreshCw,
  Layers,
  Download as DownloadIcon,
  EyeOff,
  Eye as EyeOn,
  Pause,
  Play,
  FileDown,
  ChevronDown,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import {
  getFacebookPosts,
  deleteFacebookPost,
  updatePostSchedule,
  duplicateFacebookPost,
  exportPostsToCSV,
  getPostsStatistics,
  getUserFacebookPages,
  updateFacebookPost
} from "@/app/actions/social/facebook/facebookPostsActions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const postTypeConfig = {
  text: { icon: FileText, color: "bg-gray-100 text-gray-800 border-gray-200", label: "Text" },
  image: { icon: ImageIcon, color: "bg-blue-100 text-blue-800 border-blue-200", label: "Image" },
  video: { icon: Film, color: "bg-purple-100 text-purple-800 border-purple-200", label: "Video" },
  link: { icon: Link, color: "bg-green-100 text-green-800 border-green-200", label: "Link" },
  carousel: { icon: Layers, color: "bg-orange-100 text-orange-800 border-orange-200", label: "Carousel" },
};

const statusConfig = {
  published: { icon: EyeOn, color: "bg-green-100 text-green-800 border-green-200", label: "Published" },
  scheduled: { icon: CalendarDays, color: "bg-blue-100 text-blue-800 border-blue-200", label: "Scheduled" },
  draft: { icon: FileText, color: "bg-gray-100 text-gray-800 border-gray-200", label: "Draft" },
  paused: { icon: Pause, color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Paused" },
};

export default function PublishedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    postType: "all",
    pageId: "all",
    startDate: "",
    endDate: "",
    minEngagementRate: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPost, setSelectedPost] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [facebookPages, setFacebookPages] = useState([]);
  const [exporting, setExporting] = useState(false);

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });
  const [editDialog, setEditDialog] = useState({ open: false, postId: null, message: "" });
  const [viewDialog, setViewDialog] = useState({ open: false, post: null, currentSlide: 0 }); // Added viewDialog
  const [scheduleDialog, setScheduleDialog] = useState({ open: false, postId: null, date: new Date(), time: "12:00" });
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

  const [pagination, setPagination] = useState({
    hasMore: false,
    lastVisible: null,
    pageSize: 12,
    totalCount: 0
  });

  // Load Facebook pages for filter
  useEffect(() => {
    const loadFacebookPages = async () => {
      try {
        const result = await getUserFacebookPages();
        if (result.success) {
          setFacebookPages(result.pages);
        }
      } catch (error) {
        console.error("Error loading Facebook pages:", error);
      }
    };
    loadFacebookPages();
  }, []);

  // Load posts with pagination
  const loadPosts = useCallback(async (reset = false, lastDocId = null) => {
    try {
      setLoading(true);

      const result = await getFacebookPosts({
        pageSize: pagination.pageSize,
        lastDocId: reset ? null : lastDocId,
        filters,
        sortBy
      });

      if (result.success) {
        if (reset || !lastDocId) {
          setPosts(result.posts || []);
        } else {
          setPosts(prev => [...prev, ...result.posts]);
        }

        setStatistics(result.statistics);
        setPagination(prev => ({
          ...prev,
          hasMore: result.pagination?.hasMore || false,
          lastVisible: result.pagination?.lastVisible || null,
          totalCount: result.pagination?.total || 0
        }));
      } else {
        toast.error(result.message || "Failed to load posts");
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Error loading posts");
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, filters, sortBy]);

  // Load statistics
  const loadStatistics = async () => {
    try {
      const result = await getPostsStatistics();
      if (result.success) {
        setStatistics(result.statistics);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  useEffect(() => {
    loadPosts(true);
    loadStatistics();
  }, [filters, sortBy]);

  // Apply search filter
  const filteredAndSortedPosts = posts.filter(post => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (post.message?.toLowerCase().includes(query)) ||
        (post.caption?.toLowerCase().includes(query)) ||
        (post.pageName?.toLowerCase().includes(query))
      );
    }
    return post.status === "published";
  });

  // Helper functions
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

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = parseISO(timestamp);
      return format(date, "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return "N/A";
    }
  };

  const getEngagementRate = (post) => {
    if (!post.metrics) return "0";
    return post.metrics.engagementRate?.toFixed(1) || "0";
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && pagination.lastVisible) {
      loadPosts(false, pagination.lastVisible);
    }
  };

  const handlePostClick = (post) => {
    setViewDialog({ open: true, post, currentSlide: 0 });
  };

  // Post actions
  const handleDelete = async (postId) => {
    try {
      const result = await deleteFacebookPost(postId);
      if (result.success) {
        toast.success(result.message);
        setPosts(prev => prev.filter(post => post.id !== postId));
        loadStatistics(); // Refresh statistics
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleDuplicate = async (postId) => {
    try {
      const result = await duplicateFacebookPost(postId);
      if (result.success) {
        toast.success(result.message);
        loadPosts(true); // Refresh list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error duplicating post:", error);
      toast.error("Failed to duplicate post");
    }
  };

  const handleScheduleUpdate = async (postId, newDate, newTime) => {
    try {
      const scheduledAt = new Date(`${format(newDate, "yyyy-MM-dd")}T${newTime}`);
      const result = await updatePostSchedule(postId, scheduledAt.toISOString());
      if (result.success) {
        toast.success(result.message);
        loadPosts(true); // Refresh list
        setScheduleDialog({ open: false, postId: null, date: new Date(), time: "12:00" });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast.error("Failed to schedule post");
    }
  };

  const handleUpdate = async () => {
    try {
      const { postId, message } = editDialog;
      if (!postId || !message.trim()) return;

      const result = await updateFacebookPost(postId, message);
      if (result.success) {
        toast.success(result.message);
        // Update local state
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, message: message } : p));
        setEditDialog({ open: false, postId: null, message: "" });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const result = await exportPostsToCSV(filters);
      if (result.success) {
        // Create download link
        const blob = new Blob([result.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Posts exported successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error exporting posts:", error);
      toast.error("Failed to export posts");
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      postType: "all",
      pageId: "all",
      startDate: "",
      endDate: "",
      minEngagementRate: "",
    });
    setSearchQuery("");
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
    const config = statusConfig[status] || statusConfig.published;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Loading skeleton
  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Published Posts
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 pl-13">
                Track performance and engagement across all your social media posts
              </CardDescription>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-w-[400px]">
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-gray-900">
                      {statistics?.totalPosts || 0}
                    </div>
                    <div className="text-xs text-gray-500">Total Posts</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-gray-900">
                      {formatNumber(statistics?.totalReach || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Total Reach</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-gray-900">
                      {formatNumber(statistics?.totalEngagements || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Engagements</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-gray-900">
                      {statistics?.avgEngagementRate || 0}%
                    </div>
                    <div className="text-xs text-gray-500">Avg. Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Search and Quick Actions */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search posts by caption, page name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full lg:w-96"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
                {/* Removed Export and More Filters dropdown */}
              </div>
            </div>

            {/* Filter Tabs and Controls */}
            {/* Removed status tabs, only showing published posts */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Only show published posts, no tabs */}
              <div className="hidden" />
              <div className="flex-1 flex flex-wrap gap-3">
                <Select value={filters.postType} onValueChange={(value) => handleFilterChange("postType", value)}>
                  <SelectTrigger className="w-full lg:w-[150px]">
                    <SelectValue placeholder="Post Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.pageId} onValueChange={(value) => handleFilterChange("pageId", value)}>
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Facebook Page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages</SelectItem>
                    {facebookPages.map((page) => (
                      <SelectItem key={page.pageId} value={page.pageId}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={page.profilePicture} />
                            <AvatarFallback>{page.pageName?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{page.pageName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="engagement_high">Engagement (High to Low)</SelectItem>
                    <SelectItem value="engagement_low">Engagement (Low to High)</SelectItem>
                    <SelectItem value="reach_high">Reach (High to Low)</SelectItem>
                    <SelectItem value="reach_low">Reach (Low to High)</SelectItem>
                    <SelectItem value="scheduled">Scheduled Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.postType !== "all" || filters.pageId !== "all" || filters.minEngagementRate || filters.startDate || filters.endDate) && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.postType !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {filters.postType}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("postType", "all")}
                    />
                  </Badge>
                )}
                {filters.pageId !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Page: {facebookPages.find(p => p.pageId === filters.pageId)?.pageName || filters.pageId}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("pageId", "all")}
                    />
                  </Badge>
                )}
                {filters.minEngagementRate && (
                  <Badge variant="secondary" className="gap-1">
                    Engagement: {filters.minEngagementRate}%+
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("minEngagementRate", "")}
                    />
                  </Badge>
                )}
                {filters.startDate && (
                  <Badge variant="secondary" className="gap-1">
                    From: {format(new Date(filters.startDate), "MMM dd")}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("startDate", "")}
                    />
                  </Badge>
                )}
                {filters.endDate && (
                  <Badge variant="secondary" className="gap-1">
                    To: {format(new Date(filters.endDate), "MMM dd")}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("endDate", "")}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>



      {/* Posts Grid */}
      {
        filteredAndSortedPosts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No matching posts found" : "No posts available"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? "Try adjusting your search or filters" : "Create your first post to get started"}
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {filteredAndSortedPosts.map((post) => (
                <Card
                  key={post.id}
                  className="group relative border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white aspect-square flex flex-col"
                >
                  {/* Full Card Media/Background */}
                  <div className="absolute inset-0 z-0 bg-gray-50 cursor-pointer" onClick={() => handlePostClick(post)}>
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
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/400x225?text=No+Image";
                            }}
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
                        <DropdownMenuItem onClick={() => handlePostClick(post)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditDialog({
                          open: true,
                          postId: post.id,
                          message: post.message || post.caption || ""
                        })}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={() => handleDuplicate(post.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem> */}
                        {post.status === 'published' && (
                          <DropdownMenuItem onClick={() => setScheduleDialog({
                            open: true,
                            postId: post.id,
                            date: new Date(),
                            time: "12:00"
                          })}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Reschedule
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, postId: post.id })} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status Flag (Minimal) */}
                  <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col items-start gap-1">
                    {post.status !== 'published' && (
                      <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-full px-2 py-1 flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-yellow-600" />
                        <span className="text-[10px] font-semibold text-gray-700 capitalize">
                          {post.status}
                        </span>
                      </div>
                    )}
                    {post.metrics?.engagementRate > 0 && (
                      <div className="bg-emerald-500/90 backdrop-blur-sm shadow-sm rounded-full px-2 py-0.5 text-white flex items-center gap-1">
                        <span className="text-[9px] font-bold">
                          {post.metrics.engagementRate.toFixed(1)}%
                        </span>
                      </div>
                    )}
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

                      {/* Footer Metadata */}
                      <div className="flex items-center justify-between text-[10px] text-gray-300 font-medium pt-1">
                        <div className="flex gap-2.5">
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-white" /> {formatNumber(post.metrics?.likes || 0)}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-white" /> {formatNumber(post.metrics?.reach || 0)}</span>
                        </div>
                        <span>{formatDate(post.createdAt || post.scheduledAt).split(' at')[0]}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-6 border-t font-medium text-sm text-gray-500">
              <div>
                Showing {filteredAndSortedPosts.length} of {pagination.totalCount} posts
              </div>

              {pagination.hasMore && (
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Load More
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )
      }

      {/* Post Detail Dialog (Professional Split View) */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[1100px] p-0 overflow-hidden bg-white" showCloseButton={false}>
          <div className="flex flex-col md:flex-row h-[85vh] md:h-[650px]">
            {/* Media Section (Left - 65%) */}
            <div className="w-full md:w-[65%] bg-black flex items-center justify-center relative bg-gray-950">
              {/* Media Renderer */}
              {(() => {
                const post = viewDialog.post;
                if (!post) return null;

                const media = post.mediaUrls || (post.mediaUrl ? [{ url: post.mediaUrl, type: post.postType }] : []);
                const currentMedia = media[viewDialog.currentSlide || 0];

                if (!currentMedia) {
                  // Fallback for text-only
                  return (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                      <FileText className="h-16 w-16 mb-4 opacity-50" />
                      <p>No media available</p>
                    </div>
                  );
                }

                const isVideo = currentMedia.type?.includes('video') || post.postType === 'video';

                return (
                  <div className="relative w-full h-full flex items-center justify-center group">
                    {isVideo ? (
                      <video
                        src={currentMedia.url}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={currentMedia.url}
                        alt={`Slide ${viewDialog.currentSlide + 1}`}
                        className="w-full h-full object-contain"
                      />
                    )}

                    {/* Navigation Controls (if multiple) */}
                    {media.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewDialog(prev => ({
                              ...prev,
                              currentSlide: Math.max(0, (prev.currentSlide || 0) - 1)
                            }));
                          }}
                          disabled={(viewDialog.currentSlide || 0) === 0}
                        >
                          <ChevronRight className="h-8 w-8 rotate-180" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewDialog(prev => ({
                              ...prev,
                              currentSlide: Math.min(media.length - 1, (prev.currentSlide || 0) + 1)
                            }));
                          }}
                          disabled={(viewDialog.currentSlide || 0) === media.length - 1}
                        >
                          <ChevronRight className="h-8 w-8" />
                        </Button>

                        {/* Slide Counter */}
                        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-md">
                          {(viewDialog.currentSlide || 0) + 1} / {media.length}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Details Section (Right - 35%) */}
            <div className="w-full md:w-[35%] flex flex-col h-full bg-white border-l border-gray-100">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border border-gray-200 p-0.5">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={viewDialog.post?.pageProfilePicture} />
                      <AvatarFallback>{viewDialog.post?.pageName?.[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{viewDialog.post?.pageName || "Facebook Page"}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {viewDialog.post && formatDate(viewDialog.post.createdAt || viewDialog.post.scheduledAt)}
                      <span>•</span>
                      <Facebook className="h-3 w-3 text-blue-600" />
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setViewDialog({ open: false, post: null })}>
                  <X className="h-5 w-5 text-gray-500" />
                </Button>
              </div>

              {/* Caption Area (Scrollable) */}
              <div className="flex-1 p-5 overflow-y-auto">
                <p className="text-[15px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {viewDialog.post?.message || viewDialog.post?.caption || "No caption"}
                </p>
              </div>

              {/* Metrics & Actions (Fixed Bottom) */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-4 shrink-0">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                    <div className="text-lg font-bold text-blue-600">{formatNumber(viewDialog.post?.metrics?.reach || 0)}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Reach</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                    <div className="text-lg font-bold text-red-500">{formatNumber(viewDialog.post?.metrics?.likes || 0)}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Likes</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                    <div className="text-lg font-bold text-green-500">{formatNumber(viewDialog.post?.metrics?.comments || 0)}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Comments</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    asChild
                  >
                    <a href={`https://facebook.com/${viewDialog.post?.facebookPostId}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3 w-3 mr-2" />
                      View on Facebook
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
              The post will be permanently removed from Facebook as well.
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

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialog.open} onOpenChange={(open) => setScheduleDialog({ ...scheduleDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
            <DialogDescription>
              Choose a new date and time for this post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(scheduleDialog.date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduleDialog.date}
                    onSelect={(date) => date && setScheduleDialog({ ...scheduleDialog, date })}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                type="time"
                value={scheduleDialog.time}
                onChange={(e) => setScheduleDialog({ ...scheduleDialog, time: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleDialog({ open: false, postId: null, date: new Date(), time: "12:00" })}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleScheduleUpdate(scheduleDialog.postId, scheduleDialog.date, scheduleDialog.time)}
            >
              Schedule Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update the content of your post.
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
    </div >
  );
}