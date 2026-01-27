"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, Layers, LayoutList, LayoutGrid, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Server Actions
import { getUnifiedScheduledPosts, getCurrentUser } from "@/app/actions/scheduled/scheduledActions";

// Icons for platforms
import { Facebook, Instagram, Twitter, Linkedin, Video, Pin, MessageCircle, Cloud } from "lucide-react";

export default function ScheduledPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'

    // Filters
    const [date, setDate] = useState();
    const [platform, setPlatform] = useState("all");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Fetch current user details to check role
        async function fetchUser() {
            try {
                const user = await getCurrentUser();
                setCurrentUser(user);
            } catch (e) {
                console.error(e);
            }
        }
        fetchUser();
        fetchPosts();
    }, [date, platform]);

    async function fetchPosts() {
        setLoading(true);
        try {
            const res = await getUnifiedScheduledPosts({
                platform,
                startDate: date?.from ? date.from.toISOString() : null,
                endDate: date?.to ? date.to.toISOString() : null
            });
            if (res.success) {
                setPosts(res.posts);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to load scheduled posts");
        } finally {
            setLoading(false);
        }
    }

    const PlatformIcon = ({ platform, className }) => {
        switch (platform) {
            case 'facebook': return <Facebook className={className} />;
            case 'instagram': return <Instagram className={className} />;
            case 'twitter': return <Twitter className={className} />;
            case 'linkedin': return <Linkedin className={className} />;
            case 'tiktok': return <Video className={className} />;
            case 'pinterest': return <Pin className={className} />;
            case 'threads': return <MessageCircle className={className} />; // Placeholder
            case 'bluesky': return <Cloud className={className} />; // Placeholder
            default: return <Layers className={className} />;
        }
    };

    const getPlatformColor = (platform) => {
        switch (platform) {
            case 'facebook': return "text-blue-600 bg-blue-50 border-blue-100";
            case 'instagram': return "text-pink-600 bg-pink-50 border-pink-100";
            case 'twitter': return "text-sky-500 bg-sky-50 border-sky-100";
            case 'linkedin': return "text-blue-700 bg-blue-50 border-blue-100";
            case 'tiktok': return "text-black bg-gray-100 border-gray-200";
            case 'pinterest': return "text-red-600 bg-red-50 border-red-100";
            case 'threads': return "text-black bg-gray-100 border-gray-200";
            case 'bluesky': return "text-blue-500 bg-blue-50 border-blue-100";
            default: return "text-gray-600 bg-gray-50 border-gray-100";
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Scheduled Posts</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage upcoming content across all channels.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger className="w-[180px] h-11 bg-white border-gray-200 rounded-xl font-medium">
                            <SelectValue placeholder="All Platforms" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Platforms</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="twitter">X (Twitter)</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="pinterest">Pinterest</SelectItem>
                            <SelectItem value="threads">Threads</SelectItem>
                            <SelectItem value="bluesky">Bluesky</SelectItem>
                        </SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("h-11 px-4 justify-start text-left font-normal rounded-xl border-gray-200 bg-white", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Date Range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                className="p-4"
                            />
                        </PopoverContent>
                    </Popover>

                    <div className="bg-white border border-gray-200 rounded-xl p-1 flex">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className={cn("h-9 rounded-lg px-3 transition-all", viewMode === "list" ? "bg-gray-100 text-black shadow-sm" : "text-gray-500 hover:text-black")}
                        >
                            <LayoutList className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode("calendar")}
                            className={cn("h-9 rounded-lg px-3 transition-all", viewMode === "calendar" ? "bg-gray-100 text-black shadow-sm" : "text-gray-500 hover:text-black")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-64 rounded-2xl" />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <Card className="border-dashed border-2 bg-gray-50/50">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <Layers className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No scheduled posts found</h3>
                            <p className="text-gray-500 mt-1 max-w-sm">
                                There are no content scheduled for the selected filters. Change your filters or schedule new posts.
                            </p>
                        </CardContent>
                    </Card>
                ) : viewMode === "list" ? (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <Card key={`${post.platform}-${post.id}`} className="group hover:shadow-md transition-all duration-300 border-gray-100 overflow-hidden">
                                <div className="flex flex-col md:flex-row gap-6 p-6">
                                    {/* Media Preview */}
                                    <div className="w-full md:w-48 aspect-video md:aspect-square shrink-0 rounded-xl bg-gray-100 overflow-hidden relative">
                                        {post.media && post.media.length > 0 ? (
                                            post.media[0].type?.startsWith('video') ? (
                                                <div className="w-full h-full flex items-center justify-center bg-black/5">
                                                    <Video className="h-8 w-8 text-gray-400" />
                                                </div>
                                            ) : (
                                                <img
                                                    src={post.media[0].url}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400"><ImageIcon class="h-6 w-6" /></div>'; }}
                                                />
                                            )
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-xs p-4 text-center">
                                                No Media
                                            </div>
                                        )}
                                        <div className={cn("absolute top-3 left-3 p-2 rounded-lg shadow-sm border backdrop-blur-md", getPlatformColor(post.platform))}>
                                            <PlatformIcon platform={post.platform} className="h-4 w-4" />
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100">
                                                    <Clock className="h-3 w-3 mr-1.5" />
                                                    {format(new Date(post.scheduledAt), "MMM d, yyyy • h:mm a")}
                                                </Badge>
                                                {/* Author for Admins */}
                                                {post.author && (
                                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={post.author.avatar} />
                                                            <AvatarFallback className="text-[9px]">{post.author.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="truncate max-w-[150px]">{post.author.name}</span>
                                                    </div>
                                                )}
                                            </div>

                                        </div>

                                        <p className="text-gray-900 font-medium text-sm leading-relaxed line-clamp-2 md:line-clamp-3 mb-4 flex-1">
                                            {post.caption || <span className="text-gray-400 italic">No caption text...</span>}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="capitalize font-semibold">{post.platform}</span>
                                                <span>•</span>
                                                <span>ID: {post.id?.substring(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                        <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">Calendar view coming soon</h3>
                        <p className="text-gray-500 mt-2">We are currently implementing the unified calendar view. Please use the list view for now.</p>
                        <Button
                            variant="outline"
                            className="mt-6"
                            onClick={() => setViewMode("list")}
                        >
                            Switch to List View
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
