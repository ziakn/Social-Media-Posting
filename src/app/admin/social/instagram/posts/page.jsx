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
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="mb-6">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="reels">Reels</TabsTrigger>
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