"use client";

import { useState } from "react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import CreateTwitterPost from "@/components/admin/twitter/CreatePost";
import PublishedTwitterPosts from "@/components/admin/twitter/PublishedPosts";

export default function TwitterDashboardClient({ userId }) {
    const [status, setStatus] = useState("create");

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Twitter Manager</h1>

            <Tabs value={status} onValueChange={setStatus}>
                <TabsList className="mb-6">
                    <TabsTrigger value="create">Create Tweet</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                    <CreateTwitterPost userId={userId} />
                </TabsContent>

                <TabsContent value="published">
                    <PublishedTwitterPosts />
                </TabsContent>
            </Tabs>
        </div>
    );
}
