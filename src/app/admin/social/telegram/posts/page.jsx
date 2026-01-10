"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateTelegramPost from "@/components/admin/telegram/CreatePost";
import PublishedTelegramPosts from "@/components/admin/telegram/PublishedPosts";
import ScheduledTelegramPosts from "@/components/admin/telegram/ScheduledPosts";

export default function TelegramPostsPage() {
    const [status, setStatus] = useState("published");

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <Tabs value={status} onValueChange={setStatus}>
                <TabsList className="mb-6 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="create" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Create</TabsTrigger>
                    <TabsTrigger value="published" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Published</TabsTrigger>
                    <TabsTrigger value="scheduled" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Scheduled</TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                    <CreateTelegramPost />
                </TabsContent>

                <TabsContent value="published">
                    <PublishedTelegramPosts />
                </TabsContent>

                <TabsContent value="scheduled">
                    <ScheduledTelegramPosts />
                </TabsContent>
            </Tabs>
        </div>
    );
}
