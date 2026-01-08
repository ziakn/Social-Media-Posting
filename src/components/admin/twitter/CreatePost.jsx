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
import { createTwitterPost } from "@/app/actions/social/twitter/createPost";
import {
    Image as ImageIcon, Video, CalendarDays, Link2, MessageCircle,
    Globe, Zap, X, Calendar as CalendarIcon, Users,
    Clock, Trash2, Play, FileText, Twitter, Send, Loader2
} from "lucide-react";
import { checkTwitterConnection } from "@/app/actions/social/twitter/connectAccount";
import GalleryModal from "@/components/gallery/GalleryModal";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";

export default function CreateTwitterPost() {
    const [isPending, startTransition] = useTransition();
    const [selectedAccount, setSelectedAccount] = useState("");
    const [postType, setPostType] = useState("text");
    const [postContent, setPostContent] = useState({
        text: "",
        images: [],
        video: null,
        link: "",
    });
    const [scheduling, setScheduling] = useState({
        schedule: false,
        date: new Date(),
        time: "12:00",
    });
    const [audience, setAudience] = useState("public");
    const [accounts, setAccounts] = useState([]);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryMediaType, setGalleryMediaType] = useState("image");

    useEffect(() => {
        async function loadAccounts() {
            const res = await checkTwitterConnection();
            if (res.connected) {
                if (res.accounts && res.accounts.length > 0) {
                    setAccounts(res.accounts);
                } else {
                    setAccounts([{
                        id: res.accountId,
                        name: res.displayName,
                        username: res.username,
                        profilePicture: res.profilePicture
                    }]);
                }
                // Removed automatic setSelectedAccount to match Facebook behavior
            }
        }
        loadAccounts();
    }, []);

    const audienceOptions = [
        { value: "public", label: "Public", icon: Globe, description: "Anyone on or off Twitter" },
    ];

    const openGallery = (type) => {
        setGalleryMediaType(type);
        setGalleryOpen(true);
    };

    const handleGallerySelect = (selectedItems) => {
        const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];

        if (galleryMediaType === "image") {
            const newImages = items.map(item => ({
                url: item.fileUrl,
                name: item.fileName,
                size: item.fileSize,
                type: item.fileType,
            }));

            const totalImages = postContent.images.length + newImages.length;
            if (totalImages > 4) {
                toast.error("Twitter allows maximum 4 images");
                return;
            }

            setPostContent(prev => ({
                ...prev,
                images: [...prev.images, ...newImages].slice(0, 4),
            }));
        } else if (galleryMediaType === "video") {
            if (items.length > 0) {
                const item = items[0];
                setPostContent(prev => ({
                    ...prev,
                    images: [],
                    video: {
                        url: item.fileUrl,
                        name: item.fileName,
                        size: item.fileSize,
                        type: item.fileType,
                    }
                }));
            }
        }
        setGalleryOpen(false);
    };

    const validateForm = () => {
        if (!selectedAccount) {
            toast.error("Please select a Twitter account");
            return false;
        }
        if (!postContent.text.trim() && postType === "text") {
            toast.error("Please enter some text for your tweet");
            return false;
        }
        if (postType === "images" && postContent.images.length === 0) {
            toast.error("Please select at least one image");
            return false;
        }
        if (postType === "video" && !postContent.video) {
            toast.error("Please select a video");
            return false;
        }
        if (postType === "link" && !postContent.link) {
            toast.error("Please enter a link");
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
                const res = await createTwitterPost({
                    message: postContent.text,
                    mediaUrls: postType === "images" ? postContent.images : (postContent.video ? [postContent.video] : []),
                    scheduledTime,
                    postType: scheduling.schedule ? "scheduled" : "instant",
                    link: postType === "link" ? postContent.link : null,
                });

                if (res.success) {
                    toast.success(res.message);
                    setPostContent({ text: "", images: [], video: null, link: "" });
                    setScheduling({ schedule: false, date: new Date(), time: "12:00" });
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("An unexpected error occurred");
            }
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " bytes";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        else return (bytes / 1048576).toFixed(1) + " MB";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                    <Twitter className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Create Twitter Post
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600 pl-13">
                                Share what's happening, schedule for optimal times, and reach your audience effectively
                            </CardDescription>
                        </div>
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                            <Zap className="mr-1 h-3 w-3" />
                            Pro Feature
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Account Selection */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Users className="h-5 w-5 text-blue-600" />
                                Select Twitter Account
                            </CardTitle>
                            <CardDescription>Choose which account you want to post from</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="Select a Twitter account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                                        {acc.profilePicture ? (
                                                            <img src={acc.profilePicture} alt={acc.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            acc.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{acc.name}</div>
                                                        <div className="text-sm text-gray-500">@{acc.username}</div>
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
                            <CardTitle className="text-xl">Create Your Post</CardTitle>
                            <CardDescription>
                                Choose your post type and create engaging content
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Tabs value={postType} onValueChange={setPostType} className="w-full">
                                <TabsList className="grid grid-cols-4 w-full">
                                    <TabsTrigger value="text" className="flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        Text
                                    </TabsTrigger>
                                    <TabsTrigger value="images" className="flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        Images
                                    </TabsTrigger>
                                    <TabsTrigger value="video" className="flex items-center gap-2">
                                        <Video className="h-4 w-4" />
                                        Video
                                    </TabsTrigger>
                                    <TabsTrigger value="link" className="flex items-center gap-2">
                                        <Link2 className="h-4 w-4" />
                                        Link
                                    </TabsTrigger>
                                </TabsList>

                                {/* Text Post */}
                                <TabsContent value="text" className="space-y-4 pt-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="post-text" className="text-base">Post Content</Label>
                                        <SocialCaptionEditor
                                            value={postContent.text}
                                            onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                                            placeholder="What's happening?"
                                            platform="twitter"
                                            minHeight="140px"
                                        />
                                    </div>
                                </TabsContent>

                                {/* Images Post */}
                                <TabsContent value="images" className="space-y-6 pt-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="images-caption" className="text-base">Caption</Label>
                                        <SocialCaptionEditor
                                            value={postContent.text}
                                            onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                                            placeholder="Write your tweet..."
                                            platform="twitter"
                                            minHeight="100px"
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-base">Upload Images</Label>
                                                <Badge variant="outline" className="text-xs">
                                                    {postContent.images.length}/4 images
                                                </Badge>
                                            </div>
                                            {postContent.images.length > 0 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPostContent(prev => ({ ...prev, images: [] }))}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Clear All
                                                </Button>
                                            )}
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => openGallery(["image", "video"])}
                                            className="w-full h-16 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50"
                                        >
                                            <ImageIcon className="h-5 w-5 mr-2" />
                                            Select Images from Gallery
                                        </Button>

                                        {/* Image Previews */}
                                        {postContent.images.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {postContent.images.map((image, index) => (
                                                        <div key={index} className="relative group">
                                                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-colors">
                                                                <img
                                                                    src={image.url}
                                                                    alt={`Upload ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
                                                                {index + 1}
                                                            </div>
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                                onClick={() => setPostContent(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Video Post */}
                                <TabsContent value="video" className="space-y-6 pt-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="video-caption" className="text-base">Caption</Label>
                                        <SocialCaptionEditor
                                            value={postContent.text}
                                            onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                                            placeholder="Write your tweet..."
                                            platform="twitter"
                                            minHeight="100px"
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <Label className="text-base">Upload Video</Label>

                                        <Button
                                            variant="outline"
                                            onClick={() => openGallery("video")}
                                            className="w-full h-16 border-dashed border-2 hover:border-purple-500 hover:bg-purple-50"
                                        >
                                            <Video className="h-5 w-5 mr-2" />
                                            Select Video from Gallery
                                        </Button>

                                        {postContent.video && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-base flex items-center gap-2">
                                                        <Play className="h-4 w-4" />
                                                        Video Preview
                                                    </Label>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setPostContent(prev => ({ ...prev, video: null }))}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Remove Video
                                                    </Button>
                                                </div>

                                                <div className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-purple-200 shadow-lg">
                                                    <video
                                                        src={postContent.video.url}
                                                        controls
                                                        className="w-full max-h-96"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Link Post */}
                                <TabsContent value="link" className="space-y-6 pt-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="link-caption" className="text-base">Caption</Label>
                                        <SocialCaptionEditor
                                            value={postContent.text}
                                            onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                                            placeholder="Share your thoughts about this link..."
                                            platform="twitter"
                                            minHeight="100px"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="link-url" className="text-base">Link URL</Label>
                                        <div className="relative">
                                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="link-url"
                                                type="url"
                                                placeholder="https://example.com"
                                                value={postContent.link}
                                                onChange={(e) => setPostContent(prev => ({ ...prev, link: e.target.value }))}
                                                className="h-12 pl-10 text-base"
                                            />
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
                                    Schedule this post
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

                    {/* Audience Card */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-green-600" />
                                Audience
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {audienceOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${audience === option.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setAudience(option.value)}
                                >
                                    <option.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{option.label}</div>
                                        <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                                    </div>
                                    {audience === option.value && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Publish Button */}
                    <Button
                        size="lg"
                        className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                        onClick={handleSubmit}
                        disabled={isPending || !selectedAccount}
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {scheduling.schedule ? "Scheduling..." : "Publishing..."}
                            </div>
                        ) : scheduling.schedule ? (
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Schedule Tweet
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Publish Now
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            <GalleryModal
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                onSelect={handleGallerySelect}
                allowedTypes={[galleryMediaType]}
                allowMultiple={galleryMediaType === "image"}
                title={galleryMediaType === "image" ? "Select Images" : "Select Video"}
            />
        </div>
    );
}
