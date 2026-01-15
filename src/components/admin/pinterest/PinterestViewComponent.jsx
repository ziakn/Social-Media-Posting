"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PinterestLogo from "@/components/icons/PinterestLogo";
import CreatePinterestPost from "./CreatePinterestPost";
import PublishedPinterestPosts from "./PublishedPinterestPosts";
import ScheduledPinterestPosts from "./ScheduledPinterestPosts";
import PinterestCalendarViewComponent from "./PinterestCalendarViewComponent";
import PinterestListingViewComponent from "./PinterestListingViewComponent";
import { Pin, Calendar, List, PlusCircle, LayoutGrid } from "lucide-react";

export default function PinterestViewComponent() {
    const [activeTab, setActiveTab] = useState("published");
    const [viewMode, setViewMode] = useState("grid"); // grid, list, calendar

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-red-50 via-white to-red-50 border border-red-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E60023] text-white">
                                    <PinterestLogo className="h-6 w-6 fill-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Pinterest Dashboard
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600">
                                Manage your pins, boards, and scheduled content.
                            </CardDescription>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="published" className="gap-2">
                            <Pin className="w-4 h-4" /> Published
                        </TabsTrigger>
                        <TabsTrigger value="scheduled" className="gap-2">
                            <Calendar className="w-4 h-4" /> Scheduled
                        </TabsTrigger>
                        <TabsTrigger value="create" className="gap-2">
                            <PlusCircle className="w-4 h-4" /> Create
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {activeTab === "published" && (
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 gap-2 rounded-lg"
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="w-4 h-4" /> Grid
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 gap-2 rounded-lg"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="w-4 h-4" /> List
                        </Button>
                        <Button
                            variant={viewMode === "calendar" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 gap-2 rounded-lg"
                            onClick={() => setViewMode("calendar")}
                        >
                            <Calendar className="w-4 h-4" /> Calendar
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-2">
                <TabsContent value="published" className="mt-0">
                    {viewMode === "grid" && <PublishedPinterestPosts />}
                    {viewMode === "list" && <PinterestListingViewComponent initialStatus="published" />}
                    {viewMode === "calendar" && <PinterestCalendarViewComponent />}
                </TabsContent>
                <TabsContent value="scheduled" className="mt-0">
                    <ScheduledPinterestPosts />
                </TabsContent>
                <TabsContent value="create" className="mt-0">
                    <CreatePinterestPost />
                </TabsContent>
            </div>
        </div>
    );
}
