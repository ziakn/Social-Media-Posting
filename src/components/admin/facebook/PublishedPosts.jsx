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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  getUserFacebookPages
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
    return true;
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
    setSelectedPost(post);
    setDialogOpen(true);
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

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={exporting || posts.length === 0}
                  className="gap-2"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <DownloadIcon className="h-4 w-4" />
                  )}
                  Export CSV
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      More Filters
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2 space-y-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Engagement Rate</Label>
                        <Select
                          value={filters.minEngagementRate}
                          onValueChange={(value) => handleFilterChange("minEngagementRate", value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Min Engagement %" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any</SelectItem>
                            <SelectItem value="5">5%+</SelectItem>
                            <SelectItem value="10">10%+</SelectItem>
                            <SelectItem value="15">15%+</SelectItem>
                            <SelectItem value="20">20%+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Date Range</Label>
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange("startDate", e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange("endDate", e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Filter Tabs and Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <Tabs value={filters.status} onValueChange={(value) => handleFilterChange("status", value)} className="w-full lg:w-auto">
                <TabsList className="flex-wrap h-auto">
                  <TabsTrigger value="all">All Posts</TabsTrigger>
                  <TabsTrigger value="published" className="flex items-center gap-1">
                    <EyeOn className="h-3 w-3" /> Published
                  </TabsTrigger>
                  <TabsTrigger value="scheduled" className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> Scheduled
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Drafts
                  </TabsTrigger>
                </TabsList>
              </Tabs>

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
      {filteredAndSortedPosts.length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPosts.map((post) => (
              <Card
                key={post.id}
                className="group hover:shadow-lg transition-all duration-300 border"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <PostTypeBadge type={post.postType} />
                      <StatusBadge status={post.status} />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePostClick(post)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Post
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(post.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {post.status === 'published' && (
                          <DropdownMenuItem onClick={() => setScheduleDialog({
                            open: true,
                            postId: post.id,
                            date: new Date(),
                            time: "12:00"
                          })}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Reschedule
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteDialog({ open: true, postId: post.id })}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.pageProfilePicture} />
                        <AvatarFallback>{post.pageName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {post.pageName || 'Facebook Page'}
                        </span>
                        <span className="text-xs text-gray-500 truncate block">
                          {post.pageCategory || 'Business Page'} • {formatNumber(post.pageFans || 0)} fans
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {post.status === 'scheduled' ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Scheduled: {formatDate(post.scheduledAt)}
                        </div>
                      ) : (
                        `Posted: ${formatDate(post.createdAt)}`
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Post Content Preview */}
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {post.message || post.caption || 'No caption provided'}
                    </p>

                    {post.mediaUrls?.[0]?.url && (
                      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer" onClick={() => handlePostClick(post)}>
                        <img
                          src={post.mediaUrls[0].url}
                          alt="Post content"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x225?text=No+Image";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {post.mediaUrls.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            +{post.mediaUrls.length - 1}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metrics Summary */}
                  <div className="space-y-3 pt-3 border-t">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Eye className="h-3 w-3 text-blue-600" />
                          <span className="font-semibold">{formatNumber(post.metrics?.reach || 0)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Reach</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Heart className="h-3 w-3 text-red-500" />
                          <span className="font-semibold">{formatNumber(post.metrics?.likes || 0)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Likes</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <MessageCircle className="h-3 w-3 text-green-600" />
                          <span className="font-semibold">{formatNumber(post.metrics?.comments || 0)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Comments</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Share2 className="h-3 w-3 text-purple-600" />
                          <span className="font-semibold">{formatNumber(post.metrics?.shares || 0)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Shares</div>
                      </div>
                    </div>

                    {/* Engagement Rate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Engagement Rate</span>
                        </div>
                        <span className="text-sm font-semibold">
                          {getEngagementRate(post)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(parseFloat(getEngagementRate(post)) * 10, 100)}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handlePostClick(post)}
                  >
                    View Analytics
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        if (post.postId) {
                          window.open(`https://facebook.com/${post.postId}`, '_blank');
                        }
                      }}
                      disabled={!post.postId}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleDuplicate(post.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-muted-foreground">
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
      )}

      {/* Post Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedPost.pageProfilePicture} />
                    <AvatarFallback>{selectedPost.pageName?.[0]}</AvatarFallback>
                  </Avatar>
                  Post Details
                </DialogTitle>
                <DialogDescription>
                  {selectedPost.status === 'scheduled'
                    ? `Scheduled for ${formatDate(selectedPost.scheduledAt)}`
                    : `Posted ${formatDate(selectedPost.createdAt)}`
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Post Content */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-semibold">{selectedPost.pageName}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedPost.pageCategory || 'Business Page'} • {formatNumber(selectedPost.pageFans || 0)} fans
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PostTypeBadge type={selectedPost.postType} />
                      <StatusBadge status={selectedPost.status} />
                    </div>
                  </div>

                  <p className="text-base">{selectedPost.message || selectedPost.caption}</p>

                  {selectedPost.mediaUrls && selectedPost.mediaUrls.length > 0 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedPost.mediaUrls.slice(0, 6).map((media, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                            <img
                              src={media.url}
                              alt={`Media ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      {selectedPost.mediaUrls.length > 6 && (
                        <div className="text-sm text-muted-foreground">
                          +{selectedPost.mediaUrls.length - 6} more media files
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(selectedPost.metrics?.reach || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Reach
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-600">
                        {formatNumber(selectedPost.metrics?.likes || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Heart className="h-3 w-3" /> Likes
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(selectedPost.metrics?.comments || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> Comments
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatNumber(selectedPost.metrics?.shares || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Share2 className="h-3 w-3" /> Shares
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Engagement Rate */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold">Engagement Rate</div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber((selectedPost.metrics?.likes || 0) + (selectedPost.metrics?.comments || 0) + (selectedPost.metrics?.shares || 0))} engagements
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {getEngagementRate(selectedPost)}%
                      </div>
                    </div>
                    <Progress
                      value={Math.min(parseFloat(getEngagementRate(selectedPost)) * 10, 100)}
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1" asChild>
                    <a
                      href={`https://facebook.com/${selectedPost.facebookPostId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      disabled={!selectedPost.facebookPostId}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Facebook
                    </a>
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleDuplicate(selectedPost.id)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setScheduleDialog({
                        open: true,
                        postId: selectedPost.id,
                        date: new Date(selectedPost.scheduledAt || selectedPost.createdAt || new Date()),
                        time: format(new Date(selectedPost.scheduledAt || selectedPost.createdAt || new Date()), "HH:mm")
                      })}
                    >
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
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
    </div>
  );
}