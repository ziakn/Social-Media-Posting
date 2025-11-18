"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

// Dummy data for scheduled posts
const dummyScheduledPosts = [
  {
    id: 1,
    type: "photo",
    platform: "facebook",
    caption: "Flash sale starts tomorrow! 🎉 Get ready for amazing discounts on our entire collection. Don't miss out! #FlashSale #Discount",
    image: "/api/placeholder/400/300",
    scheduledAt: "2024-12-17T09:00:00Z",
    status: "scheduled",
    page: "My Business Page",
    platforms: ["facebook", "instagram"],
    metrics: {
      expectedReach: 15000,
      previousEngagement: 4.2
    }
  },
  {
    id: 2,
    type: "video",
    platform: "facebook",
    caption: "Product tutorial coming your way! Learn how to get the most out of our latest feature. Full video drops tomorrow! 👇",
    image: "/api/placeholder/400/300",
    scheduledAt: "2024-12-16T14:30:00Z",
    status: "scheduled",
    page: "Tech Reviews",
    platforms: ["facebook", "twitter"],
    metrics: {
      expectedReach: 22000,
      previousEngagement: 6.8
    }
  },
  {
    id: 3,
    type: "carousel",
    platform: "facebook",
    caption: "Swipe to see our team's favorite workspace setups! Which one inspires you the most? 🖥️✨",
    image: "/api/placeholder/400/300",
    scheduledAt: "2024-12-18T11:15:00Z",
    status: "scheduled",
    page: "Travel Diaries",
    platforms: ["facebook", "instagram", "linkedin"],
    metrics: {
      expectedReach: 18000,
      previousEngagement: 5.1
    }
  },
  {
    id: 4,
    type: "poll",
    platform: "facebook",
    caption: "Weekly poll: What's your favorite productivity tool? We'll share the results on Friday!",
    image: "/api/placeholder/400/300",
    scheduledAt: "2024-12-15T16:45:00Z",
    status: "scheduled",
    page: "Tech Reviews",
    platforms: ["facebook"],
    metrics: {
      expectedReach: 12000,
      previousEngagement: 8.3
    }
  },
  {
    id: 5,
    type: "event",
    platform: "facebook",
    caption: "Mark your calendars! Our annual webinar is coming up next week. Topic: Future of Social Media Marketing.",
    image: "/api/placeholder/400/300",
    scheduledAt: "2024-12-19T10:00:00Z",
    status: "scheduled",
    page: "My Business Page",
    platforms: ["facebook", "linkedin"],
    metrics: {
      expectedReach: 25000,
      previousEngagement: 7.2
    }
  },
  {
    id: 6,
    type: "link",
    platform: "facebook",
    caption: "New blog post alert! Learn how to optimize your social media strategy for 2024. Link goes live tomorrow!",
    image: "/api/placeholder/400/300",
    scheduledAt: "2024-12-20T13:20:00Z",
    status: "paused",
    page: "Travel Diaries",
    platforms: ["facebook", "twitter"],
    metrics: {
      expectedReach: 14000,
      previousEngagement: 3.9
    }
  }
];

const postTypeColors = {
  photo: "bg-blue-100 text-blue-800 border-blue-200",
  video: "bg-purple-100 text-purple-800 border-purple-200",
  link: "bg-green-100 text-green-800 border-green-200",
  carousel: "bg-orange-100 text-orange-800 border-orange-200",
  event: "bg-red-100 text-red-800 border-red-200",
  poll: "bg-indigo-100 text-indigo-800 border-indigo-200"
};

const platformIcons = {
  facebook: "🔵",
  instagram: "🌈",
  twitter: "🐦",
  linkedin: "💼"
};

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
  draft: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function ScheduledPosts({ posts = dummyScheduledPosts }) {
  const [filter, setFilter] = useState("all");
  const [timeRemaining, setTimeRemaining] = useState({});

  // Calculate time remaining for each post
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const newTimeRemaining = {};
      
      posts.forEach(post => {
        const scheduledTime = new Date(post.scheduledAt);
        const diff = scheduledTime - now;
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          newTimeRemaining[post.id] = { days, hours, minutes };
        } else {
          newTimeRemaining[post.id] = { days: 0, hours: 0, minutes: 0 };
        }
      });
      
      setTimeRemaining(newTimeRemaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [posts]);

  const filteredPosts = posts.filter(post => {
    if (filter === "all") return true;
    return post.status === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleEdit = (postId) => {
    console.log("Edit post:", postId);
    // Implement edit functionality
  };

  const handleDelete = (postId) => {
    console.log("Delete post:", postId);
    // Implement delete functionality
  };

  const handlePauseResume = (postId, currentStatus) => {
    console.log("Toggle pause/resume:", postId, currentStatus);
    // Implement pause/resume functionality
  };

  if (filteredPosts.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Scheduled Posts</h2>
                <p className="text-orange-100">
                  Manage your upcoming content and publishing schedule
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Button className="bg-white text-orange-600 hover:bg-orange-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Post
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <Card className="p-16 text-center border-dashed border-2 border-muted bg-gradient-to-br from-slate-50 to-orange-50">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              No scheduled posts
            </div>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Your scheduled posts will appear here with countdown timers and management options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Your First Post
              </Button>
              <Button variant="outline">
                Learn About Scheduling
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Scheduled Posts</h2>
              <p className="text-orange-100">
                Manage your upcoming content and publishing schedule
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold">{posts.length}</div>
                <div className="text-orange-200 text-sm">Total Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {posts.filter(p => p.status === 'scheduled').length}
                </div>
                <div className="text-orange-200 text-sm">Active</div>
              </div>
              <Button className="bg-white text-orange-600 hover:bg-orange-50">
                <Plus className="h-4 w-4 mr-2" />
                Schedule New Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All Posts
                <Badge variant="secondary" className="ml-1">
                  {posts.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Scheduled
                <Badge variant="secondary" className="ml-1">
                  {posts.filter(p => p.status === 'scheduled').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="paused" className="flex items-center gap-2">
                <Pause className="h-4 w-4" />
                Paused
                <Badge variant="secondary" className="ml-1">
                  {posts.filter(p => p.status === 'paused').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="draft" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Drafts
                <Badge variant="secondary" className="ml-1">
                  {posts.filter(p => p.status === 'draft').length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Scheduled Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={postTypeColors[post.type]}>
                    {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                  </Badge>
                  <Badge variant="outline" className={statusColors[post.status]}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handlePauseResume(post.id, post.status)}
                  >
                    {post.status === 'paused' ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleEdit(post.id)}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{platformIcons[post.platform]}</span>
                  <span className="text-sm font-medium text-gray-900">{post.page}</span>
                </div>
                {post.platforms.length > 1 && (
                  <Badge variant="outline" className="text-xs">
                    +{post.platforms.length - 1} more
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Post Content */}
              <div className="space-y-3">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {post.caption}
                </p>
                
                {post.image && (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={post.image}
                      alt="Scheduled post content"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                )}
              </div>

              {/* Countdown Timer */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Publishing in</span>
                  </div>
                  <div className="text-xs text-blue-700">
                    {formatDate(post.scheduledAt)}
                  </div>
                </div>
                
                {timeRemaining[post.id] && (
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-900">
                        {timeRemaining[post.id].days}
                      </div>
                      <div className="text-xs text-blue-700">Days</div>
                    </div>
                    <div className="text-blue-300">:</div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-900">
                        {timeRemaining[post.id].hours.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-blue-700">Hours</div>
                    </div>
                    <div className="text-blue-300">:</div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-900">
                        {timeRemaining[post.id].minutes.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-blue-700">Minutes</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3 text-gray-500" />
                    <span>Expected Reach</span>
                  </div>
                  <span className="font-medium">{formatNumber(post.metrics.expectedReach)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-3 w-3 text-gray-500" />
                    <span>Previous Engagement</span>
                  </div>
                  <span className="font-medium text-green-600">{post.metrics.previousEngagement}%</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" size="sm" className="text-xs">
                Edit Schedule
              </Button>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <BarChart3 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="px-8">
          Load More Scheduled Posts
        </Button>
      </div>
    </div>
  );
}