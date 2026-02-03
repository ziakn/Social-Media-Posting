"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { format } from "date-fns";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createYoutubePost } from "@/app/actions/social/youtube/createPost";
import {
    Video, CalendarDays, Globe, Zap, X, Calendar as CalendarIcon, Users,
    Clock, Trash2, Play, FileText, Youtube, Loader2, Info
} from "lucide-react";
import { checkYoutubeConnection } from "@/app/actions/social/youtube/connectAccount";
import GalleryModal from "@/components/gallery/GalleryModal";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";

export default function CreateYoutubePost() {
    const [isPending, startTransition] = useTransition();
    const [selectedAccount, setSelectedAccount] = useState("");
    const [postContent, setPostContent] = useState({
        title: "",
        description: "",
        video: null,
    });
    const [scheduling, setScheduling] = useState({
        schedule: false,
        date: new Date(),
        time: "12:00",
    });
    const [privacyStatus, setPrivacyStatus] = useState("public");
    const [accounts, setAccounts] = useState([]);
    const [galleryOpen, setGalleryOpen] = useState(false);

    useEffect(() => {
        async function loadData() {
            const ytRes = await checkYoutubeConnection();

            if (ytRes.connected) {
                if (ytRes.accounts && ytRes.accounts.length > 0) {
                    setAccounts(ytRes.accounts);
                } else {
                    setAccounts([{
                        id: ytRes.accountId,
                        name: ytRes.displayName,
                        profilePicture: ytRes.profilePicture
                    }]);
                }
            }
        }
        loadData();
    }, []);

    const privacyOptions = [
        { value: "public", label: "Public", icon: Globe, description: "Anyone can see your video" },
        { value: "private", label: "Private", icon: X, description: "Only you can see your video" },
        { value: "unlisted", label: "Unlisted", icon: Info, description: "Anyone with the link can see" },
    ];

    const handleGallerySelect = (selectedItems) => {
        const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
        if (items.length > 0) {
            const item = items[0];
            setPostContent(prev => ({
                ...prev,
                video: {
                    url: item.fileUrl,
                    name: item.fileName,
                    size: item.fileSize,
                    type: item.fileType,
                }
            }));
        }
        setGalleryOpen(false);
    };

    const validateForm = () => {
        if (!selectedAccount) {
            toast.error("Please select a YouTube channel");
            return false;
        }
        if (!postContent.title.trim()) {
            toast.error("Please enter a video title");
            return false;
        }
        if (!postContent.video) {
            toast.error("Please select a video to upload");
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
                const res = await createYoutubePost({
                    title: postContent.title,
                    description: postContent.description,
                    videoUrl: postContent.video.url,
                    scheduledTime,
                    privacyStatus,
                });

                if (res.success) {
                    toast.success(res.message);
                    setPostContent({ title: "", description: "", video: null });
                    setScheduling({ schedule: false, date: new Date(), time: "12:00" });
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("An unexpected error occurred");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-red-50 via-white to-orange-50 border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600">
                                    <Youtube className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Upload to YouTube
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600 pl-13">
                                Share your stories with the world through video. Upload directly or schedule for later.
                            </CardDescription>
                        </div>
                        <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white border-0">
                            <Zap className="mr-1 h-3 w-3" />
                            YouTube Partner
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Channel Selection */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Users className="h-5 w-5 text-red-600" />
                                Select YouTube Channel
                            </CardTitle>
                            <CardDescription>Choose which channel you want to upload to</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="Select a YouTube channel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                                        {acc.profilePicture ? (
                                                            <img src={acc.profilePicture} alt={acc.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            acc.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{acc.name}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Post Editor */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">Video Details</CardTitle>
                            <CardDescription>
                                Provide a title and description for your video
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="video-title" className="text-base font-semibold">Title (Required)</Label>
                                    <Input
                                        id="video-title"
                                        placeholder="Add a title that describes your video"
                                        value={postContent.title}
                                        onChange={(e) => setPostContent(prev => ({ ...prev, title: e.target.value }))}
                                        className="h-12 text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="video-description" className="text-base font-semibold">Description</Label>
                                    <SocialCaptionEditor
                                        value={postContent.description}
                                        onChange={(e) => setPostContent(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Tell viewers about your video"
                                        platform="youtube"
                                        minHeight="140px"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Video File</Label>
                                {!postContent.video ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setGalleryOpen(true)}
                                        className="w-full h-32 border-dashed border-2 hover:border-red-500 hover:bg-red-50 flex flex-col gap-2"
                                    >
                                        <Video className="h-8 w-8 text-gray-400" />
                                        <span>Select Video from Gallery</span>
                                    </Button>
                                ) : (
                                    <div className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-red-200 shadow-md">
                                        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/70 to-transparent z-10 flex justify-between items-center text-white">
                                            <span className="text-sm font-medium truncate max-w-[80%]">{postContent.video.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-white hover:bg-red-600 transition-colors"
                                                onClick={() => setPostContent(prev => ({ ...prev, video: null }))}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <video
                                            src={postContent.video.url}
                                            controls
                                            className="w-full max-h-[400px]"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Visibility Card */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-blue-600" />
                                Visibility
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {privacyOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${privacyStatus === option.value
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setPrivacyStatus(option.value)}
                                >
                                    <option.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{option.label}</div>
                                        <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                                    </div>
                                    {privacyStatus === option.value && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Scheduling Card */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                Scheduling
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="schedule-toggle" className="text-sm font-medium">
                                    Schedule upload
                                </Label>
                                <Switch
                                    id="schedule-toggle"
                                    checked={scheduling.schedule}
                                    onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))}
                                />
                            </div>

                            {scheduling.schedule && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start h-11 border-gray-200">
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
                                        <Input
                                            type="time"
                                            value={scheduling.time}
                                            onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value }))}
                                            className="h-11 border-gray-200"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Publish Button */}
                    <Button
                        size="lg"
                        className="w-full h-14 text-base font-semibold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg"
                        onClick={handleSubmit}
                        disabled={isPending || !selectedAccount}
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {scheduling.schedule ? "Scheduling..." : "Uploading..."}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                {scheduling.schedule ? <CalendarDays className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                {scheduling.schedule ? "Schedule Upload" : "Upload Now"}
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            <GalleryModal
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                onSelect={handleGallerySelect}
                allowedTypes={["video"]}
                allowMultiple={false}
                title="Select Video for YouTube"
            />
        </div>
    );
}
