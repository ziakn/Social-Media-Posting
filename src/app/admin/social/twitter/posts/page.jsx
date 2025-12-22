"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateTwitterPost from "@/components/admin/twitter/CreatePost";
import PublishedTwitterPosts from "@/components/admin/twitter/PublishedPosts";
import ScheduledTwitterPosts from "@/components/admin/twitter/ScheduledPosts";

export default function TwitterPostsPage() {
    const [status, setStatus] = useState("published");

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <Tabs value={status} onValueChange={setStatus}>
                <TabsList className="mb-6">
                    <TabsTrigger value="create">Create</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    {/* <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="expiring">Expiring</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger> */}
                </TabsList>

                <TabsContent value="create">
                    <CreateTwitterPost />
                </TabsContent>

                <TabsContent value="published">
                    <PublishedTwitterPosts />
                </TabsContent>

                <TabsContent value="scheduled">
                    <ScheduledTwitterPosts />
                </TabsContent>
            </Tabs>
        </div>
    );
}
