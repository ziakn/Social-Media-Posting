// src/components/admin/instagram/ManageInstagramPosts.jsx
"use client";

import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// Import all Instagram components
import CreatePost from "@/components/admin/instagram/CreatePost";
import PublishedPosts from "@/components/admin/instagram/PublishedPosts";
import ScheduledPosts from "@/components/admin/instagram/ScheduledPosts";
import DraftPosts from "@/components/admin/instagram/DraftPosts";
import Stories from "@/components/admin/instagram/Stories";
import Reels from "@/components/admin/instagram/Reels";

export default function ManageInstagramPosts() {
  const [status, setStatus] = useState("create");

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Instagram Management
        </h1>
        <p className="text-gray-600 mt-2">
          Create and manage your Instagram posts, stories, and reels
        </p>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="mb-6 grid grid-cols-6">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <span>📝</span>
            Create Post
          </TabsTrigger>
          <TabsTrigger value="published" className="flex items-center gap-2">
            <span>✅</span>
            Published
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <span>📅</span>
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="draft" className="flex items-center gap-2">
            <span>📄</span>
            Drafts
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <span>🎬</span>
            Stories
          </TabsTrigger>
          <TabsTrigger value="reels" className="flex items-center gap-2">
            <span>🎥</span>
            Reels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <CreatePost />
        </TabsContent>

        <TabsContent value="published">
          <PublishedPosts />
        </TabsContent>

        <TabsContent value="scheduled">
          <ScheduledPosts />
        </TabsContent>

        <TabsContent value="draft">
          <DraftPosts />
        </TabsContent>

        <TabsContent value="stories">
          <Stories />
        </TabsContent>

        <TabsContent value="reels">
          <Reels />
        </TabsContent>
      </Tabs>
    </div>
  );
}