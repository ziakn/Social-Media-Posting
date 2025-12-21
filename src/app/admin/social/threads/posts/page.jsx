"use client";

import { useState } from "react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import CreateThreadsPost from "@/components/admin/threads/CreateThreadsPost";
import PublishedThreadsPosts from "@/components/admin/threads/PublishedThreadsPosts";
import ScheduledThreadsPosts from "@/components/admin/threads/ScheduledThreadsPosts";

export default function ManageThreadsPosts() {
    const [status, setStatus] = useState("create");

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-neutral-800">Threads Content Manager</h1>
                <p className="text-muted-foreground mt-2">Create, schedule, and manage your Threads posts.</p>
            </div>

            <Tabs value={status} onValueChange={setStatus}>
                <TabsList className="mb-6 bg-neutral-100 p-1 rounded-xl">
                    <TabsTrigger value="create" className="rounded-lg">Create</TabsTrigger>
                    <TabsTrigger value="published" className="rounded-lg">Published</TabsTrigger>
                    <TabsTrigger value="scheduled" className="rounded-lg">Scheduled</TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                    <CreateThreadsPost />
                </TabsContent>

                <TabsContent value="published">
                    <PublishedThreadsPosts />
                </TabsContent>

                <TabsContent value="scheduled">
                    <ScheduledThreadsPosts />
                </TabsContent>
            </Tabs>
        </div>
    );
}
