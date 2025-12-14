"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getPublishedPosts,
  getPublishedPostsStats
} from "@/app/actions/social/instagram/getPosts";
import { fetchInstagramAccounts } from "@/app/actions/social/instagram/getPages";
import { updateInstagramPost } from "@/app/actions/social/instagram/updatePost";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";
import {
  Search,
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
  ChevronRight,
  ExternalLink,
  Trash2,
  MoreVertical,
  X,
  Filter,
  Layers,
  Image as ImageIcon,
  Film,
  Play,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PublishedPosts({ pageId: initialPageId }) {
  // State management
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);

  // View Dialog State
  const [viewDialog, setViewDialog] = useState({
    open: false,
    post: null
  });


  // Edit Dialog State
  const [editDialog, setEditDialog] = useState({
    open: false,
    postId: null,
    caption: "",
    updating: false
  });

  // Filter state
  const [filters, setFilters] = useState({
    postType: "all",
    pageId: initialPageId || "all",
    searchQuery: "",
    dateFrom: null,
    dateTo: null,
    sortBy: "date",
    sortOrder: "desc"
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    pageSize: 12,
    hasMore: false,
    lastPostId: null
  });

  // Load accounts
  useEffect(() => {
    const loadAccounts = async () => {
      if (initialPageId) return; // If a specific page is passed, we might not need to load all accounts for filtering, or we might want to just show that one.
      // However, to match Facebook logic where we can filter by "All Pages", we should load them.
      const result = await fetchInstagramAccounts();
      if (result.success) {
        setAccounts(result.accounts);
      }
    };
    loadAccounts();
  }, [initialPageId]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      // Pass null if "all" to get aggregate stats, but action might not support it yet if it strictly expects pageId.
      // Looking at getPublishedPostsStats in getPosts.js, it uses: if (pageId) constraints.push(...)
      // So passing null/undefined is safe for "all".
      const targetPageId = filters.pageId === "all" ? null : filters.pageId;
      const result = await getPublishedPostsStats({ pageId: targetPageId });
      if (result.success) {
        setStats(result.stats);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, [filters.pageId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Load posts
  const loadPosts = useCallback(async (reset = false, lastId = null) => {
    try {
      setLoading(true);

      const targetPageId = filters.pageId === "all" ? null : filters.pageId;

      const result = await getPublishedPosts({
        pageId: targetPageId,
        filters: {
          postType: filters.postType,
          searchQuery: filters.searchQuery,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        },
        sorting: {
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        },
        pagination: {
          pageSize: pagination.pageSize,
          lastPostId: reset ? null : lastId
        }
      });

      if (result.success) {
        if (reset) {
          setPosts(result.posts);
        } else {
          setPosts(prev => [...prev, ...result.posts]);
        }

        setPagination(prev => ({
          ...prev,
          hasMore: result.hasMore,
          lastPostId: result.lastPostId
        }));
      } else {
        toast.error(result.message || "Failed to load posts");
      }
    } catch (err) {
      toast.error("An error occurred while loading posts");
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.pageSize]);

  // Initial load and filter changes
  useEffect(() => {
    loadPosts(true);
  }, [loadPosts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split("-");
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const clearFilters = () => {
    setFilters({
      postType: "all",
      pageId: initialPageId || "all",
      searchQuery: "",
      dateFrom: null,
      dateTo: null,
      sortBy: "date",
      sortOrder: "desc"
    });
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && pagination.lastPostId) {
      loadPosts(false, pagination.lastPostId);
    }
  };

  const handleViewOnInstagram = (instagramPostId) => {
    if (instagramPostId) {
      window.open(`https://www.instagram.com/p/${instagramPostId}`, "_blank");
    } else {
      toast.error("Instagram post ID not available");
    }
  };

  // Handle Edit Click
  const onEditClick = (post) => {
    setEditDialog({
      open: true,
      postId: post.id,
      caption: post.caption || "",
      updating: false
    });
  };

  // Handle Update
  const handleUpdate = async () => {
    try {
      if (!editDialog.postId) return;

      setEditDialog(prev => ({ ...prev, updating: true }));

      const result = await updateInstagramPost(editDialog.postId, editDialog.caption);

      if (result.success) {
        toast.success(result.message);

        // Update local state
        setPosts(prev => prev.map(p =>
          p.id === editDialog.postId
            ? { ...p, caption: editDialog.caption }
            : p
        ));

        setEditDialog({ open: false, postId: null, caption: "", updating: false });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update post");
    } finally {
      setEditDialog(prev => ({ ...prev, updating: false }));
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Loading skeleton
  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
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
      <Card className="bg-gradient-to-r from-pink-50 via-white to-purple-50 border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-600">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Published Posts
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 pl-13">
                Track performance and engagement across your Instagram posts
              </CardDescription>
            </div>

            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-w-[400px]">
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Layers className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold text-gray-900">
                        {stats.totalPosts || 0}
                      </div>
                      <div className="text-xs text-gray-500">Total Posts</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold text-gray-900">
                        {formatNumber(stats.totalEngagement || 0)}
                      </div>
                      <div className="text-xs text-gray-500">Engagements</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold text-gray-900">
                        {formatNumber(stats.totalComments || 0)}
                      </div>
                      <div className="text-xs text-gray-500">Comments</div>
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
                        {stats.avgEngagement || 0}
                      </div>
                      <div className="text-xs text-gray-500">Avg. Eng.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                    placeholder="Search posts by caption..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
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
              </div>
            </div>

            {/* Filter Tabs and Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1 flex flex-wrap gap-3">
                <Select value={filters.postType} onValueChange={(value) => handleFilterChange("postType", value)}>
                  <SelectTrigger className="w-full lg:w-[150px]">
                    <SelectValue placeholder="Post Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.pageId} onValueChange={(value) => handleFilterChange("pageId", value)}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Instagram Page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.igUserId} value={account.igUserId}>
                        <div className="flex items-center gap-2">
                          <span className="truncate">{account.username || account.displayName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="likes-desc">Most Liked</SelectItem>
                    <SelectItem value="comments-desc">Most Commented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.postType !== "all" || filters.pageId !== "all" || filters.searchQuery) && (
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
                    Page: {accounts.find(p => p.igUserId === filters.pageId)?.username || filters.pageId}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("pageId", "all")}
                    />
                  </Badge>
                )}
                {filters.searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {filters.searchQuery}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("searchQuery", "")}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {posts.length === 0 && !loading ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {filters.searchQuery ? "No matching posts found" : "No posts available"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filters.searchQuery ? "Try adjusting your search or filters" : "Start creating Instagram posts to see them here"}
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="group relative border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white aspect-square flex flex-col cursor-pointer"
              onClick={() => setViewDialog({ open: true, post, currentSlide: 0 })}
            >
              {/* Media/Background */}
              <div className="absolute inset-0 z-0 bg-gray-50">
                {post.mediaUrl ? (
                  <>
                    {post.postType === 'video' ? (
                      <div className="w-full h-full bg-black relative">
                        <video src={post.mediaUrl} className="w-full h-full object-cover opacity-90" muted />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-white/30 backdrop-blur-md p-3 rounded-full shadow-lg">
                            <Play className="h-6 w-6 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400">No Media</span>
                  </div>
                )}
              </div>

              {/* Top Actions (Hover) */}
              <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-700 border border-gray-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewOnInstagram(post.instagramPostId)}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Instagram
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditClick(post)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status/Type Badges */}
              <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col items-start gap-1">
                {post.postType && (
                  <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-full px-2 py-1 flex items-center gap-1.5">
                    {post.postType === 'video' && <Film className="h-3 w-3 text-purple-600" />}
                    {post.postType === 'image' && <ImageIcon className="h-3 w-3 text-blue-600" />}
                    {post.postType === 'carousel' && <Layers className="h-3 w-3 text-orange-600" />}
                    <span className="text-[10px] font-semibold text-gray-700 capitalize">
                      {post.postType}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Content */}
              <div className="absolute inset-x-0 bottom-0 p-3 z-10 pointer-events-none text-white">
                <div className="flex flex-col gap-1">
                  {/* Caption */}
                  <p className="text-xs line-clamp-2 leading-snug font-medium text-gray-100 drop-shadow-md">
                    {post.caption || "No caption"}
                  </p>

                  {/* Metrics */}
                  <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-gray-200">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-white/20" />
                      {formatNumber(post.metrics.likes)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3 fill-white/20" />
                      {formatNumber(post.metrics.comments)}
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-xs text-white/80">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {pagination.hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
          >
            {loading ? "Loading..." : "Load More Posts"}
            {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* View Post Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-white" showCloseButton={false}>
          <div className="flex flex-col md:flex-row h-[80vh] md:h-[600px]">
            {/* Media Section */}
            <div className="w-full md:w-[60%] bg-black flex items-center justify-center relative bg-gray-950">
              {viewDialog.post?.postType === 'carousel' && viewDialog.post?.carouselMedia?.length > 0 ? (
                <div className="relative w-full h-full flex items-center justify-center group">
                  <img
                    src={viewDialog.post.carouselMedia[viewDialog.currentSlide || 0].url}
                    alt={`Slide ${(viewDialog.currentSlide || 0) + 1}`}
                    className="w-full h-full object-contain"
                  />

                  {/* Carousel Controls */}
                  {viewDialog.post.carouselMedia.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewDialog(prev => ({
                            ...prev,
                            currentSlide: Math.max(0, (prev.currentSlide || 0) - 1)
                          }));
                        }}
                        disabled={(viewDialog.currentSlide || 0) === 0}
                      >
                        <ChevronRight className="h-6 w-6 rotate-180" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewDialog(prev => ({
                            ...prev,
                            currentSlide: Math.min(viewDialog.post.carouselMedia.length - 1, (prev.currentSlide || 0) + 1)
                          }));
                        }}
                        disabled={(viewDialog.currentSlide || 0) === viewDialog.post.carouselMedia.length - 1}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>

                      {/* Dots Indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {viewDialog.post.carouselMedia.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === (viewDialog.currentSlide || 0) ? 'bg-white' : 'bg-white/40'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : viewDialog.post?.postType === 'video' ? (
                <video
                  src={viewDialog.post?.mediaUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={viewDialog.post?.mediaUrl}
                  alt="Post"
                  className={`w-full h-full object-contain ${viewDialog.post?.postType === 'story' ? 'scale-90' : ''}`}
                />
              )}
            </div>

            {/* Details Section */}
            <div className="w-full md:w-[40%] flex flex-col h-full bg-white border-l border-gray-100">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-[2px]">
                    <div className="bg-white rounded-full w-full h-full overflow-hidden flex items-center justify-center">
                      <Avatar className="h-full w-full">
                        <AvatarFallback className="bg-white">IG</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Instagram Post</div>
                    <div className="text-xs text-gray-500">{viewDialog.post && formatDate(viewDialog.post.createdAt)}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setViewDialog({ open: false, post: null })}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Caption Area (Scrollable) */}
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {viewDialog.post?.caption || "No caption"}
                </p>
              </div>

              {/* Metrics & Actions */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                      <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                      {viewDialog.post && formatNumber(viewDialog.post.metrics?.likes || 0)}
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                      <MessageCircle className="h-4 w-4 text-blue-500 fill-blue-500" />
                      {viewDialog.post && formatNumber(viewDialog.post.metrics?.comments || 0)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => viewDialog.post && handleViewOnInstagram(viewDialog.post.instagramPostId)}
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on Instagram
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update the caption for your Instagram post.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <SocialCaptionEditor
              value={editDialog.caption}
              onChange={(e) => setEditDialog(prev => ({ ...prev, caption: e.target.value }))}
              placeholder="Write a caption..."
              platform="instagram"
              minHeight="150px"
              disabled={editDialog.updating}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog(prev => ({ ...prev, open: false }))}
              disabled={editDialog.updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={editDialog.updating}
            >
              {editDialog.updating ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}