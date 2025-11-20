// src/components/admin/instagram/CreatePost.jsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function CreatePost() {
  const [postType, setPostType] = useState("feed");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            Create Instagram Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={postType} onValueChange={setPostType}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="feed">Feed Post</TabsTrigger>
              <TabsTrigger value="carousel">Carousel</TabsTrigger>
              <TabsTrigger value="story">Story</TabsTrigger>
            </TabsList>

            <TabsContent value="feed">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-600 mb-4">Upload single image or video</p>
                  <Button>Select Media</Button>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">JPEG/PNG</Badge>
                  <Badge variant="secondary">Max 8MB</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="carousel">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-600 mb-4">Upload 2-10 images for carousel</p>
                  <Button>Select Multiple Images</Button>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">2-10 Images</Badge>
                  <Badge variant="secondary">JPEG/PNG</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="story">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-600 mb-4">Upload image or video for story</p>
                  <Button>Select Story Media</Button>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">9:16 Ratio</Badge>
                  <Badge variant="secondary">24 Hours</Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}