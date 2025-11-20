// src/components/admin/instagram/PublishedPosts.jsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for published posts
const publishedPosts = [
  {
    id: 1,
    type: "image",
    caption: "Beautiful sunset at the beach! 🌅 #sunset #beach",
    likes: 245,
    comments: 34,
    date: "2024-01-15",
    image: "/api/placeholder/300/300"
  },
  {
    id: 2,
    type: "carousel",
    caption: "Our new product lineup! Swipe to see more 👉",
    likes: 567,
    comments: 89,
    date: "2024-01-14",
    image: "/api/placeholder/300/300"
  },
  {
    id: 3,
    type: "video",
    caption: "Behind the scenes of our latest shoot!",
    likes: 892,
    comments: 156,
    date: "2024-01-13",
    image: "/api/placeholder/300/300"
  }
];

export default function PublishedPosts() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Published Posts</h2>
        <p className="text-gray-600">Your live Instagram posts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <div className="aspect-square bg-gray-100">
              <img 
                src={post.image} 
                alt="Post" 
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={
                  post.type === "image" ? "default" :
                  post.type === "carousel" ? "secondary" : "outline"
                }>
                  {post.type}
                </Badge>
                <span className="text-sm text-gray-500">{post.date}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                {post.caption}
              </p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}