"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Calendar,
  MoreHorizontal,
  TrendingUp,
  Users,
  Clock,
  Filter,
  Download,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { getFacebookPosts } from "@/app/actions/social/facebook/getPosts";
import { toast } from "sonner";


const postTypeColors = {
  text: "bg-gray-100 text-gray-800 border-gray-200",
  images: "bg-blue-100 text-blue-800 border-blue-200",
  video: "bg-purple-100 text-purple-800 border-purple-200",
  link: "bg-green-100 text-green-800 border-green-200",
};

const platformIcons = {
  facebook: "🔵",
  instagram: "🌈",
  twitter: "🐦",
  linkedin: "💼"
};

export default function PublishedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const result = await getFacebookPosts();

      if (result.success) {
        setPosts(result.posts);
      } else {
        toast.error("Failed to load posts");
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Error loading posts");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === "all") return true;
    if (filter === "scheduled") return post.scheduledTime && new Date(post.scheduledTime) > new Date();
    return post.postType === filter;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "newest") {
      const dateA = new Date(a.createdAt?.seconds * 1000 || a.createdAt);
      const dateB = new Date(b.createdAt?.seconds * 1000 || b.createdAt);
      return dateB - dateA;
    } else if (sortBy === "engagement") {
      const engA = (a.metrics?.likes || 0) + (a.metrics?.comments || 0) + (a.metrics?.shares || 0);
      const engB = (b.metrics?.likes || 0) + (b.metrics?.comments || 0) + (b.metrics?.shares || 0);
      return engB - engA;
    } else if (sortBy === "reach") {
      return (b.metrics?.reach || 0) - (a.metrics?.reach || 0);
    }
    return 0;
  });

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (timestamp) => {
    let date;
    if (timestamp?.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEngagementRate = (post) => {
    return ((post.metrics.engagements / post.metrics.reach) * 100).toFixed(1);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading posts...</span>
      </div>
    );
  }

  if (sortedPosts.length === 0) {
    return (
      <Card className="p-16 text-center border-dashed border-2 border-muted bg-gradient-to-br from-slate-50 to-blue-50">
        <CardContent className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            No published posts yet
          </div>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Once your posts are published or scheduled, they'll appear here with detailed analytics.
          </p>
          <Button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
            Create Your First Post
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Published Posts</h2>
              <p className="text-blue-100">
                Track performance and engagement across all your posts
              </p>
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold">{posts.length}</div>
                <div className="text-blue-200 text-sm">Total Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatNumber(posts.reduce((sum, post) => sum + post.metrics.reach, 0))}
                </div>
                <div className="text-blue-200 text-sm">Total Reach</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatNumber(posts.reduce((sum, post) => sum + post.metrics.engagements, 0))}
                </div>
                <div className="text-blue-200 text-sm">Total Engagements</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="photo">Photos</TabsTrigger>
                <TabsTrigger value="video">Videos</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="engagement">Top Engagement</SelectItem>
                  <SelectItem value="reach">Highest Reach</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedPosts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={postTypeColors[post.postType || 'text']}>
                    {(post.postType || 'text').charAt(0).toUpperCase() + (post.postType || 'text').slice(1)}
                  </Badge>
                  {post.scheduledTime && new Date(post.scheduledTime) > new Date() && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Scheduled
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{platformIcons['facebook']}</span>
                  <span className="text-sm font-medium text-gray-900">{post.pageName || 'Facebook Page'}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Post Content */}
              <div className="space-y-3">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {post.message || post.caption || 'No caption'}
                </p>

                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={post.mediaUrls[0].url}
                      alt="Post content"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{formatNumber(post.metrics.reach)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{formatNumber(post.metrics.likes)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{formatNumber(post.metrics.comments)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="h-3 w-3" />
                      <span>{formatNumber(post.metrics.shares)}</span>
                    </div>
                  </div>

                  {post.metrics.votes && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{formatNumber(post.metrics.votes)} votes</span>
                    </div>
                  )}
                </div>

                {/* Engagement Rate */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {getEngagementRate(post)}% Engagement
                    </span>
                  </div>
                  {parseFloat(getEngagementRate(post)) > 5 && (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-green-600 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(parseFloat(getEngagementRate(post)) * 2, 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button variant="ghost" size="sm" className="text-xs">
                  View Analytics
                </Button>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <BarChart3 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="px-8">
          Load More Posts
        </Button>
      </div>
    </div>
  );
}

// Select components (you'll need to install these from shadcn/ui)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";