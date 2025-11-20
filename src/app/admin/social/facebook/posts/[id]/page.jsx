"use client";

import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// Import all components
import CreatePost from "@/components/admin/facebook/CreatePost";
import PublishedPosts from "@/components/admin/facebook/PublishedPosts";
import ScheduledPosts from "@/components/admin/facebook/ScheduledPosts";
import DraftPosts from "@/components/admin/facebook/DraftPosts";
import ExpiringPosts from "@/components/admin/facebook/ExpiringPosts";
import ExpiredPosts from "@/components/admin/facebook/ExpiredPosts";

export default function ManageFacebookPosts() {
  const [status, setStatus] = useState("create");

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="mb-6">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="expiring">Expiring</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
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

        <TabsContent value="expiring">
          <ExpiringPosts />
        </TabsContent>

        <TabsContent value="expired">
          <ExpiredPosts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
