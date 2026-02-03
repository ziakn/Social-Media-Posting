// src/components/portal/instagram/Stories.jsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stories = [
  {
    id: 1,
    type: "image",
    caption: "Behind the scenes!",
    views: 1234,
    createdAt: "2024-01-15T10:00:00",
    expiresAt: "2024-01-16T10:00:00",
    image: "/api/placeholder/200/400"
  },
  {
    id: 2,
    type: "video",
    caption: "Quick tutorial!",
    views: 2456,
    createdAt: "2024-01-15T14:00:00",
    expiresAt: "2024-01-16T14:00:00",
    image: "/api/placeholder/200/400"
  }
];

export default function Stories() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Stories</h2>
        <p className="text-gray-600">Manage your 24-hour stories</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stories.map((story) => (
          <Card key={story.id} className="min-w-[200px]">
            <CardContent className="p-0">
              <div className="aspect-[9/16] bg-gray-100 relative">
                <img 
                  src={story.image} 
                  alt="Story" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-sm truncate">{story.caption}</p>
                  <div className="flex justify-between text-white/80 text-xs mt-1">
                    <span>👁️ {story.views}</span>
                    <span>⏰ 12h left</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Create New Story Card */}
        <Card className="min-w-[200px] border-dashed">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full aspect-[9/16]">
            <div className="text-4xl mb-2">+</div>
            <p className="text-sm text-gray-600 text-center">Create New Story</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}