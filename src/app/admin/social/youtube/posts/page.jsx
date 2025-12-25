"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateYoutubePost from "@/components/admin/youtube/CreatePost";
import PublishedPosts from "@/components/admin/youtube/PublishedPosts";
import ScheduledPosts from "@/components/admin/youtube/ScheduledPosts";
import { Youtube, PlusCircle, FileText, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function YoutubePostsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tab = searchParams.get("tab") || "published";
    const [activeTab, setActiveTab] = useState(tab);

    useEffect(() => {
        setActiveTab(tab);
    }, [tab]);

    const handleTabChange = (value) => {
        setActiveTab(value);
        router.push(`/admin/social/youtube/posts?tab=${value}`);
    };

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Youtube className="h-8 w-8 text-red-600" />
                        </div>
                        YouTube Content Manager
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Create, schedule, and track your videos across all connected YouTube channels.
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-8">
                <TabsList className="grid w-full grid-cols-3 md:w-[600px] h-14 p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-2xl border border-gray-200">
                    <TabsTrigger
                        value="create"
                        className="rounded-xl flex items-center gap-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all duration-300"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Create
                    </TabsTrigger>
                    <TabsTrigger
                        value="published"
                        className="rounded-xl flex items-center gap-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all duration-300"
                    >
                        <FileText className="h-4 w-4" />
                        Published
                    </TabsTrigger>
                    <TabsTrigger
                        value="scheduled"
                        className="rounded-xl flex items-center gap-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all duration-300"
                    >
                        <Clock className="h-4 w-4" />
                        Scheduled
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <CreateYoutubePost />
                </TabsContent>

                <TabsContent value="published" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <PublishedPosts />
                </TabsContent>

                <TabsContent value="scheduled" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <ScheduledPosts />
                </TabsContent>
            </Tabs>
        </div>
    );
}
