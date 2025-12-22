"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createTwitterPost } from "@/app/actions/social/twitter/createPost";
import {
    MessageCircle,
    Twitter,
    Calendar as CalendarIcon,
    Clock,
    FileText,
    CalendarDays
} from "lucide-react";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";

export default function CreateTwitterPost({ userId }) {
    const [isPending, startTransition] = useTransition();
    const [postType, setPostType] = useState("text");
    const [postContent, setPostContent] = useState({
        text: "",
        images: [],
        video: null,
    });
    const [scheduling, setScheduling] = useState({
        schedule: false,
        date: new Date(),
        time: "12:00",
        timezone: "UTC",
    });

    const validateForm = () => {
        if (!postContent.text.trim()) {
            toast.error("Enter some text for your tweet");
            return false;
        }
        if (postContent.text.length > 280) {
            toast.error("Tweet exceeds 280 characters");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const scheduledTime = scheduling.schedule
            ? new Date(`${format(scheduling.date, "yyyy-MM-dd")}T${scheduling.time}`)
            : null;

        startTransition(async () => {
            try {
                const result = await createTwitterPost({
                    userId,
                    message: postContent.text,
                    scheduledTime,
                    postType,
                });

                if (result.success) {
                    toast.success(scheduledTime
                        ? `Tweet scheduled for ${format(scheduling.date, "PPP")} at ${scheduling.time}`
                        : "Tweet published successfully!"
                    );

                    // Reset form
                    setPostContent({
                        text: "",
                        images: [],
                        video: null,
                    });
                    setScheduling({
                        schedule: false,
                        date: new Date(),
                        time: "12:00",
                        timezone: "UTC"
                    });
                } else {
                    toast.error(result.message || "Failed to post. Try again.");
                }
            } catch (e) {
                console.error("Post error:", e);
                toast.error("Failed to post. Try again.");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-blue-50 via-white to-sky-50 border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                                    <Twitter className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Create Tweet
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600 pl-13">
                                Compose tweets and engage with your followers
                            </CardDescription>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Post Editor */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">Compose Tweet</CardTitle>
                            <CardDescription>
                                What's happening?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Tabs value={postType} onValueChange={setPostType} className="w-full">
                                <TabsList className="grid grid-cols-1 w-full max-w-md">
                                    <TabsTrigger value="text" className="flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        Text
                                    </TabsTrigger>
                                    {/* Media tabs disabled for now */}
                                </TabsList>

                                {/* Text Post */}
                                <TabsContent value="text" className="space-y-4 pt-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="post-text" className="text-base">Tweet Content</Label>
                                        <SocialCaptionEditor
                                            value={postContent.text}
                                            onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                                            placeholder="What's happening?"
                                            platform="twitter"
                                            minHeight="140px"
                                        />
                                        <div className="flex justify-end">
                                            <span className={`text-xs ${postContent.text.length > 280 ? "text-red-500" : "text-muted-foreground"}`}>
                                                {postContent.text.length}/280
                                            </span>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Scheduling Card */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                Scheduling
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="schedule-toggle" className="text-sm font-medium">
                                    Schedule this tweet
                                </Label>
                                <Switch
                                    id="schedule-toggle"
                                    checked={scheduling.schedule}
                                    onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))}
                                />
                            </div>

                            {scheduling.schedule && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start">
                                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                                    {format(scheduling.date, "PPP")}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={scheduling.date}
                                                    onSelect={(date) => date && setScheduling(prev => ({ ...prev, date }))}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm">Time</Label>
                                        <input
                                            type="time"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={scheduling.time}
                                            onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Publish Button */}
                    <Button
                        size="lg"
                        className="w-full h-14 text-base font-semibold bg-black hover:bg-gray-800 shadow-lg"
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {scheduling.schedule ? "Scheduling..." : "Tweeting..."}
                            </div>
                        ) : scheduling.schedule ? (
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Schedule Tweet
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Tweet Now
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
