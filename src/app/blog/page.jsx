"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Clock, Eye, Share2, Search, BookOpen, TrendingUp, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");

  // Sample blog posts data
  const featuredPosts = [
    {
      id: 1,
      title: "10 Social Media Strategies That Actually Work in 2024",
      excerpt: "Discover the most effective social media strategies that are driving results for businesses this year.",
      author: "Sarah Chen",
      date: "Dec 15, 2024",
      readTime: "8 min read",
      category: "Strategy",
      image: "/api/placeholder/600/400",
      views: "2.4K",
      comments: 42,
      featured: true
    },
    {
      id: 2,
      title: "The Complete Guide to Instagram Algorithm Updates",
      excerpt: "Everything you need to know about the latest Instagram algorithm changes and how to adapt your content.",
      author: "Mike Rodriguez",
      date: "Dec 12, 2024",
      readTime: "12 min read",
      category: "Instagram",
      image: "/api/placeholder/600/400",
      views: "1.8K",
      comments: 28,
      featured: true
    }
  ];

  const blogPosts = [
    {
      id: 3,
      title: "How to Create Engaging Video Content for TikTok",
      excerpt: "Learn the secrets to creating viral TikTok content that captures attention and drives engagement.",
      author: "Emily Davis",
      date: "Dec 10, 2024",
      readTime: "6 min read",
      category: "TikTok",
      image: "/api/placeholder/400/250",
      views: "3.2K",
      comments: 56
    },
    {
      id: 4,
      title: "Mastering LinkedIn for B2B Lead Generation",
      excerpt: "Proven techniques to generate high-quality leads using LinkedIn's powerful networking features.",
      author: "Alex Johnson",
      date: "Dec 8, 2024",
      readTime: "10 min read",
      category: "LinkedIn",
      image: "/api/placeholder/400/250",
      views: "1.5K",
      comments: 34
    },
    {
      id: 5,
      title: "The Power of Social Media Analytics",
      excerpt: "How to use analytics to measure ROI and make data-driven decisions for your social media strategy.",
      author: "Sarah Chen",
      date: "Dec 5, 2024",
      readTime: "7 min read",
      category: "Analytics",
      image: "/api/placeholder/400/250",
      views: "2.1K",
      comments: 29
    },
    {
      id: 6,
      title: "Building a Content Calendar That Works",
      excerpt: "Step-by-step guide to creating and maintaining an effective social media content calendar.",
      author: "Mike Rodriguez",
      date: "Dec 3, 2024",
      readTime: "9 min read",
      category: "Planning",
      image: "/api/placeholder/400/250",
      views: "1.9K",
      comments: 41
    },
    {
      id: 7,
      title: "Twitter Spaces: The New Frontier for Community Building",
      excerpt: "How to leverage Twitter Spaces to build engaged communities and establish thought leadership.",
      author: "Emily Davis",
      date: "Nov 30, 2024",
      readTime: "5 min read",
      category: "Twitter",
      image: "/api/placeholder/400/250",
      views: "1.2K",
      comments: 23
    },
    {
      id: 8,
      title: "The Future of Social Commerce",
      excerpt: "Exploring the latest trends in social commerce and how brands can capitalize on shopping features.",
      author: "Alex Johnson",
      date: "Nov 28, 2024",
      readTime: "11 min read",
      category: "Commerce",
      image: "/api/placeholder/400/250",
      views: "2.8K",
      comments: 67
    }
  ];

  const categories = [
    { name: "All", count: 24 },
    { name: "Strategy", count: 8 },
    { name: "Instagram", count: 5 },
    { name: "TikTok", count: 3 },
    { name: "LinkedIn", count: 4 },
    { name: "Analytics", count: 6 },
    { name: "Planning", count: 7 },
    { name: "Twitter", count: 3 },
    { name: "Commerce", count: 4 }
  ];

  const popularPosts = [
    {
      id: 1,
      title: "10 Social Media Strategies That Actually Work",
      views: "2.4K"
    },
    {
      id: 8,
      title: "The Future of Social Commerce",
      views: "2.8K"
    },
    {
      id: 3,
      title: "How to Create Engaging Video Content for TikTok",
      views: "3.2K"
    },
    {
      id: 5,
      title: "The Power of Social Media Analytics",
      views: "2.1K"
    }
  ];

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SocialHub Blog
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Social Media Insights &{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Strategies
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Expert tips, latest trends, and actionable strategies to help you master social media marketing and grow your online presence.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search articles, topics, or keywords..."
                className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Posts */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Featured Posts</h2>
                  <Badge variant="secondary" className="text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Trending
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <Card key={post.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                      <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                        <Badge className="absolute top-4 left-4 bg-white text-gray-900 hover:bg-white">
                          {post.category}
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{post.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.comments}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* All Posts */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
                  <div className="text-sm text-gray-500">
                    Showing {filteredPosts.length} of {blogPosts.length} articles
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Eye className="h-4 w-4" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{post.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            Read More
                          </Button>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                              <MessageCircle className="h-4 w-4" />
                              <span className="ml-1">{post.comments}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More Button */}
                {filteredPosts.length > 0 && (
                  <div className="text-center mt-8">
                    <Button variant="outline" size="lg">
                      Load More Articles
                    </Button>
                  </div>
                )}

                {/* No Results */}
                {filteredPosts.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search terms or browse by category.</p>
                    <Button onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Categories */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.name}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <span className="text-gray-700">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Popular Posts */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Popular Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {popularPosts.map((post) => (
                    <div key={post.id} className="group cursor-pointer">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Eye className="h-3 w-3" />
                        <span>{post.views} views</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardContent className="p-6">
                  <BookOpen className="h-8 w-8 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Stay Updated</h3>
                  <p className="text-blue-100 text-sm mb-4">
                    Get the latest social media tips and strategies delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <Input
                      placeholder="Enter your email"
                      className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                    />
                    <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-3">
                    {["Twitter", "LinkedIn", "Facebook", "Instagram"].map((platform) => (
                      <Button
                        key={platform}
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-gray-50"
                      >
                        {platform}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}