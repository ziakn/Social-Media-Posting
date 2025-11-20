// src/components/admin/instagram/ScheduledPosts.jsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const scheduledPosts = [
  {
    id: 1,
    type: "image",
    caption: "Monday motivation! Let's crush this week 💪",
    scheduledDate: "2024-01-16T09:00:00",
    image: "/api/placeholder/300/300"
  },
  {
    id: 2,
    type: "carousel",
    caption: "Weekly favorites! Swipe to see our top picks 👇",
    scheduledDate: "2024-01-17T12:00:00",
    image: "/api/placeholder/300/300"
  }
];

export default function ScheduledPosts() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Scheduled Posts</h2>
        <p className="text-gray-600">Posts waiting to be published</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scheduledPosts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline">Scheduled</Badge>
                <span className="text-sm text-gray-500">
                  {new Date(post.scheduledDate).toLocaleString()}
                </span>
              </div>
              
              <div className="aspect-square bg-gray-100 rounded-lg mb-4">
                <img 
                  src={post.image} 
                  alt="Scheduled post" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                {post.caption}
              </p>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}