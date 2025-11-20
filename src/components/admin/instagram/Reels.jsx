// src/components/admin/instagram/Reels.jsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const reels = [
  {
    id: 1,
    title: "Quick Tutorial",
    views: 15432,
    likes: 2345,
    comments: 189,
    duration: "0:30",
    thumbnail: "/api/placeholder/200/350"
  },
  {
    id: 2,
    title: "Behind the Scenes",
    views: 28765,
    likes: 4567,
    comments: 324,
    duration: "0:45",
    thumbnail: "/api/placeholder/200/350"
  }
];

export default function Reels() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Reels</h2>
        <p className="text-gray-600">Your short-form video content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reels.map((reel) => (
          <Card key={reel.id} className="overflow-hidden">
            <div className="aspect-[9/16] bg-gray-100 relative">
              <img 
                src={reel.thumbnail} 
                alt="Reel thumbnail" 
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-2 right-2 bg-black/80">
                {reel.duration}
              </Badge>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white font-semibold">{reel.title}</h3>
                <div className="flex justify-between text-white/80 text-xs mt-2">
                  <span>👁️ {reel.views.toLocaleString()}</span>
                  <span>❤️ {reel.likes.toLocaleString()}</span>
                  <span>💬 {reel.comments}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {/* Create New Reel Card */}
        <Card className="border-dashed">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full aspect-[9/16]">
            <div className="text-4xl mb-2">🎥</div>
            <p className="text-sm text-gray-600 text-center">Create New Reel</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}