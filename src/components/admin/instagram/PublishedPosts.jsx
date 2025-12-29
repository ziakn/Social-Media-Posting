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
  getPublishedPosts, getPublishedPostsStats, getAllCalendarPosts
} from "@/app/actions/social/instagram/getPosts";
import { fetchInstagramAccounts } from "@/app/actions/social/instagram/getPages";
import { updateInstagramPost } from "@/app/actions/social/instagram/updatePost";
import { deleteInstagramPost } from "@/app/actions/social/instagram/deletePost";
import { publishInstagramPostNow } from "@/app/actions/social/instagram/publishPost";
import { getDateTime } from "@/lib/utils";

// Internal Components (formerly separate files)
import FullCalendar from "@/components/admin/instagram/FullCalendar";
import InstagramPreview from "@/components/admin/instagram/InstagramPreview"; // Assuming this stays or logic is integrated? 
// Note: Keeping InstagramPreview import assuming it's complex enough to stay separate, or should it be merged too? 
// User said "CreatePost module in this file". InstagramPreview is a child of CreatePost. I will import it for now.

// -----------------------------------------------------------------------------
// POST LISTING COMPONENT (Formerly PublishedPosts default export)
// -----------------------------------------------------------------------------
function PostListing({ pageId: initialPageId, viewMode = "grid", initialStatus = "published", refreshTrigger = 0, onEdit = null }) {
  // State management
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });

  // Filter state
  const [filters, setFilters] = useState({
    status: initialStatus,
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
      if (initialPageId) return;
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
          status: filters.status,
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
  }, [loadPosts, refreshTrigger]);

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

  // Handle Edit Click - Now uses parent creator
  const onEditClick = (post) => {
    if (onEdit) onEdit(post);
  };


  // Handle Delete
  const handleDelete = async (postId) => {
    try {
      const result = await deleteInstagramPost(postId);
      if (result.success) {
        toast.success(result.message);
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete post");
    }
  };

  // Handle Publish Now
  const [publishingId, setPublishingId] = useState(null);

  const handlePublishNow = async (e, post) => {
    e.stopPropagation();
    try {
      setPublishingId(post.id);
      const result = await publishInstagramPostNow(post.id);
      if (result.success) {
        toast.success("Post published successfully!");
        setRefreshTrigger(prev => prev + 1); // Trigger refresh
      } else {
        toast.error(result.message || "Failed to publish post");
      }
    } catch (error) {
      toast.error("An error occurred while publishing");
    } finally {
      setPublishingId(null);
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Layers className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold text-gray-900">{stats.totalPosts || 0}</div>
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
                      <div className="text-xl font-bold text-gray-900">{formatNumber(stats.totalEngagement || 0)}</div>
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
                      <div className="text-xl font-bold text-gray-900">{formatNumber(stats.totalComments || 0)}</div>
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
                      <div className="text-xl font-bold text-gray-900">{stats.avgEngagement || 0}</div>
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
                <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" /> Clear Filters
                </Button>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1 flex flex-wrap gap-3">
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger className="w-full lg:w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.pageId} onValueChange={(value) => handleFilterChange("pageId", value)}>
                  <SelectTrigger className="w-full lg:w-[200px]"><SelectValue placeholder="Instagram Page" /></SelectTrigger>
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
              </div>
            </div>
            {/* Active Filters */}
            {(filters.status !== "all" || filters.pageId !== "all" || filters.searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.status !== "all" && <Badge variant="secondary" className="gap-1">Status: {filters.status} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("status", "all")} /></Badge>}
                {filters.pageId !== "all" && <Badge variant="secondary" className="gap-1">Page: {accounts.find(p => p.igUserId === filters.pageId)?.username || filters.pageId} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("pageId", "all")} /></Badge>}
                {filters.searchQuery && <Badge variant="secondary" className="gap-1">Search: {filters.searchQuery} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("searchQuery", "")} /></Badge>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {posts.length === 0 && !loading ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{filters.searchQuery ? "No matching posts found" : "No posts available"}</h3>
            <p className="text-muted-foreground mb-6">{filters.searchQuery ? "Try adjusting your search or filters" : "Start by creating a post"}</p>
            <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div className="rounded-md border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="w-[100px]">Media</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Metrics</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id} className={cn("cursor-pointer hover:bg-gray-50", publishingId === post.id && "opacity-70 pointer-events-none")} onClick={() => onEditClick(post)}>
                  <TableCell>
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200 relative">
                      {post.mediaUrl ? (
                        post.postType === 'video' ? (
                          <div className="w-full h-full bg-black relative">
                            <video src={post.mediaUrl} className="w-full h-full object-cover" muted />
                            <div className="absolute inset-0 flex items-center justify-center"><Play className="h-4 w-4 text-white fill-white" /></div>
                          </div>
                        ) : (<img src={post.mediaUrl} alt="" className="h-full w-full object-cover" />)
                      ) : (<div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No Media</div>)}
                      {publishingId === post.id && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="font-medium text-sm line-clamp-2">{post.caption || "No caption"}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {post.postType && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 capitalize">{post.postType}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className={cn("capitalize", post.status === 'published' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-blue-100 text-blue-700 hover:bg-blue-100")}>{post.status || 'published'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {formatNumber(post.metrics?.likes)}</div>
                      <div className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {formatNumber(post.metrics?.comments)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(post.status === 'scheduled' ? post.scheduledAt : post.createdAt)}
                    <div className="text-[10px] text-gray-400">{format(new Date(post.status === 'scheduled' ? post.scheduledAt : post.createdAt), "h:mm a")}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        {post.status === 'published' ? (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditClick(post); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Post</span>
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditClick(post); }}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Post</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="text-purple-600 focus:text-purple-700 focus:bg-purple-50">
                              <Send className="mr-2 h-4 w-4" />
                              <span>Publish Now</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, postId: post.id }); }}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Post</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <Card key={post.id} className={cn("group relative border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white aspect-square flex flex-col cursor-pointer", publishingId === post.id && "opacity-70 pointer-events-none")} onClick={() => onEditClick(post)}>
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
                      <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50"><span className="text-gray-400">No Media</span></div>
                )}
                {publishingId === post.id && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                )}
              </div>
              <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-700 border border-gray-100"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    {post.status === 'published' ? (
                      <DropdownMenuItem onClick={() => onEditClick(post)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Post</span>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => onEditClick(post)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Post</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="text-purple-600 focus:text-purple-700 focus:bg-purple-50">
                          <Send className="mr-2 h-4 w-4" />
                          <span>Publish Now</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => setDeleteDialog({ open: true, postId: post.id })}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Post</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col items-start gap-1">
                {post.postType && (
                  <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-full px-2 py-1 flex items-center gap-1.5">
                    {post.postType === 'video' && <Film className="h-3 w-3 text-purple-600" />}
                    {post.postType === 'image' && <ImageIcon className="h-3 w-3 text-blue-600" />}
                    {post.postType === 'carousel' && <Layers className="h-3 w-3 text-orange-600" />}
                    {post.postType === 'story' && <History className="h-3 w-3 text-pink-600" />}
                    <span className="text-[10px] font-semibold text-gray-700 capitalize">{post.postType}</span>
                  </div>
                )}
                <div className={cn("backdrop-blur-sm shadow-sm rounded-full px-2 py-1 flex items-center gap-1.5", post.status === 'published' ? "bg-green-100/90 text-green-700" : "bg-blue-100/90 text-blue-700")}>
                  <span className="text-[10px] font-semibold capitalize">{post.status || 'published'}</span>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 z-10 pointer-events-none text-white">
                <div className="flex flex-col gap-1">
                  <p className="text-xs line-clamp-2 leading-snug font-medium text-gray-100 drop-shadow-md">{post.caption || "No caption"}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-gray-200">
                    <div className="flex items-center gap-1"><Heart className="h-3 w-3 fill-white/20" /> {formatNumber(post.metrics.likes)}</div>
                    <div className="flex items-center gap-1"><MessageCircle className="h-3 w-3 fill-white/20" /> {formatNumber(post.metrics.comments)}</div>
                    <div className="flex items-center gap-1 ml-auto"><span className="text-xs text-white/80">{formatDate(post.createdAt)}</span></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {pagination.hasMore && (
        <div className="flex justify-center pt-6">
          <Button onClick={handleLoadMore} disabled={loading} variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
            {loading ? "Loading..." : "Load More Posts"}
            {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Delete and Edit Dialogs */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the post from our records.
              {posts.find(p => p.id === deleteDialog.postId)?.status === 'published' && " Note: This will not delete the post from Instagram."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteDialog.postId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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
    timezone: initialData?.scheduling?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [posts, setPosts] = useState([]); // unused but part of original
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(initialData?.pageId || null);

  const [creatorOpen, setCreatorOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryMediaType, setGalleryMediaType] = useState("image");
  const [currentSlide, setCurrentSlide] = useState(0);
  const selectionScrollRef = useRef(null);

  useEffect(() => {
    async function loadPages() {
      const res = await fetchInstagramAccounts();
      if (res.success) {
        setPages(res.accounts || []);
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
      type: item.mediaType, mimeType: item.fileType, file: null
    }));

    const maxMedia = postType === "feed" ? 10 : 1;

    // If it's a single-media post type (reel/story), replace automatically
    if (maxMedia === 1) {
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
                  <Button disabled={isReadOnly} variant="outline" onClick={() => openGallery(postType === "reels" ? ["video"] : ["image", "video"])} className="h-24 w-full rounded-2xl border-2 border-dashed border-gray-100 hover:border-pink-500 hover:bg-pink-50 flex flex-col gap-2">
                    <div className="flex items-center gap-3"><ImageIcon className="h-5 w-5 text-pink-600" /></div>
                    <span className="text-xs font-black uppercase text-gray-600">Select Media</span>
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
      <GalleryModal open={galleryOpen} onOpenChange={setGalleryOpen} onSelect={handleGallerySelect} allowedTypes={galleryMediaType} allowMultiple={postType === 'feed'} maxSelection={postType === 'feed' ? 10 : 1} />
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT (Formerly ManageInstagramPosts page)
// -----------------------------------------------------------------------------
export default function PublishedPosts({ pageId: initialPageId, viewMode = "grid", initialStatus = "all" }) {
  const [activeTab, setActiveTab] = useState("calendar");
  const [isCreating, setIsCreating] = useState(false);
  const [calendarPosts, setCalendarPosts] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [createInitialData, setCreateInitialData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });

  const handleDelete = async (postId) => {
    try {
      const result = await deleteInstagramPost(postId);
      if (result.success) {
        toast.success(result.message);
        setCalendarPosts(prev => prev.filter(p => p.id !== postId));
        setRefreshTrigger(prev => prev + 1); // Refresh list views
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete post");
    }
  };

  // Fetch calendar posts when that tab is active or date changes
  useEffect(() => {
    if (activeTab === "calendar") {
      setLoadingCalendar(true);
      const startDate = startOfMonth(calendarDate);
      const endDate = endOfMonth(calendarDate);

      getAllCalendarPosts({ startDate, endDate }).then(res => {
        if (res.success) setCalendarPosts(res.posts);
      }).finally(() => setLoadingCalendar(false));
    }
  }, [activeTab, calendarDate, refreshTrigger]);

  const handleDateClick = (date) => {
    setCreateInitialData({
      scheduling: {
        schedule: true,
        date: date,
        time: "12:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });
    setIsCreating(true);
  };

  const handlePostClick = (post, action = 'edit') => {
    if (action === 'delete') {
      setDeleteDialog({ open: true, postId: post.id });
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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] relative">
            {loadingCalendar && (
              <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
                  <p className="text-sm font-medium text-gray-500">Loading...</p>
                </div>
              </div>
            )}
            <FullCalendar posts={calendarPosts} onMonthChange={setCalendarDate} onDateClick={handleDateClick} onPostClick={handlePostClick} />
          </div>
        </TabsContent>

        <TabsContent value="instagram" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <PostListing viewMode="grid" initialStatus="all" pageId={initialPageId} refreshTrigger={refreshTrigger} onEdit={handlePostClick} />
        </TabsContent>

        <TabsContent value="listing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <PostListing viewMode="list" initialStatus="all" pageId={initialPageId} refreshTrigger={refreshTrigger} onEdit={handlePostClick} />
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
              {/* Note: We don't have full post object easily available here without fetching or storing in state on click, 
                  but we can assume it's a standard check. The List view has more context. */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteDialog.postId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}