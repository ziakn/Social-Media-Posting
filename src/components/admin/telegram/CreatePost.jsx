"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { format } from "date-fns";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createTelegramPost } from "@/app/actions/social/telegram/createPost";
import {
    Image as ImageIcon, Video, CalendarDays, Link2, MessageCircle,
    Globe, Zap, X, Calendar as CalendarIcon, Users,
    Clock, Trash2, Play, FileText, Send, Loader2, Bot
} from "lucide-react";
import { checkTelegramConnection } from "@/app/actions/social/telegram/connectAccount";
import GalleryModal from "@/components/gallery/GalleryModal";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";

export default function CreateTelegramPost() {
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
    const [accounts, setAccounts] = useState([]);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryMediaType, setGalleryMediaType] = useState("image");

    useEffect(() => {
        async function loadAccounts() {
            const res = await checkTelegramConnection();
            if (res.connected) {
                let accs = [];
                if (res.accounts && res.accounts.length > 0) {
                    accs = res.accounts;
                } else {
                    accs = [{
                        id: res.accountId,
                        name: res.displayName,
                        chatId: res.chatId,
                        botUsername: res.botUsername
                    }];
                }
                setAccounts(accs);
                if (accs.length > 0) {
                    setSelectedAccount(accs[0].id);
                }
            }
        }
        loadAccounts();
    }, []);

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

            // Telegram simple bot API handles one photo with caption or media group.
            // For now, let's limit to 1 for simplicity consistent with the action.
            if (newImages.length > 0) {
                setPostContent(prev => ({
                    ...prev,
                    images: [newImages[0]], // Just take the first one for now
                    video: null
                }));
            }
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
            toast.error("Please select a Telegram bot");
            return false;
        }
        if (!postContent.text.trim() && postType === "text") {
            toast.error("Please enter some text for your message");
            return false;
        }
        if (postType === "images" && postContent.images.length === 0) {
            toast.error("Please select an image");
            return false;
        }
        if (postType === "video" && !postContent.video) {
            toast.error("Please select a video");
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
                const res = await createTelegramPost({
                    accountId: selectedAccount,
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

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 via-white to-cyan-50 border border-blue-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 shadow-md shadow-blue-200">
                                    <Send className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-slate-900">
                                    Broadcast to Telegram
                                </CardTitle>
                            </div>
                            <CardDescription className="text-slate-600 pl-1">
                                Send messages, photos, and videos to your Telegram channels and groups instantly.
                            </CardDescription>
                        </div>
                        <Badge className="bg-blue-600 text-white border-0 px-3 py-1">
                            <Bot className="mr-1.5 h-3.5 w-3.5" />
                            Bot API
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {/* Account Selection */}
                    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                        <div className="h-1.5 bg-blue-500" />
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                                <Bot className="h-5 w-5 text-blue-500" />
                                Select Bot
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                <SelectTrigger className="h-14 rounded-xl border-slate-200 focus:ring-blue-500 text-base">
                                    <SelectValue placeholder="Which bot should send this?" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id} className="focus:bg-blue-50 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                                                    <Send className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{acc.name}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{acc.chatId}</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Post Editor */}
                    <Card className="border-0 shadow-xl rounded-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl text-slate-900">Compose Message</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Tabs value={postType} onValueChange={setPostType} className="w-full">
                                <TabsList className="grid grid-cols-4 w-full bg-slate-50 p-1 rounded-xl h-12">
                                    <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Text
                                    </TabsTrigger>
                                    <TabsTrigger value="images" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
                                        <ImageIcon className="h-4 w-4 mr-2" />
                                        Photo
                                    </TabsTrigger>
                                    <TabsTrigger value="video" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
                                        <Video className="h-4 w-4 mr-2" />
                                        Video
                                    </TabsTrigger>
                                    <TabsTrigger value="link" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
                                        <Link2 className="h-4 w-4 mr-2" />
                                        Link
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="text" className="space-y-4 pt-6">
                                    <SocialCaptionEditor
                                        value={postContent.text}
                                        onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                                        placeholder="Type your message here..."
                                        platform="telegram"
                                        minHeight="200px"
                                    />
                                </TabsContent>

                                <TabsContent value="images" className="space-y-6 pt-6">
                                    <SocialCaptionEditor
                                        value={postContent.text}
                                        onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                                        placeholder="Add a caption..."
                                        platform="telegram"
                                        minHeight="100px"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => openGallery("image")}
                                        className="w-full h-24 border-dashed border-2 border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <ImageIcon className="h-6 w-6 text-slate-400 group-hover:text-blue-500" />
                                            <span className="text-slate-500 group-hover:text-blue-600 font-medium">Select Photo from Gallery</span>
                                        </div>
                                    </Button>

                                    {postContent.images.length > 0 && (
                                        <div className="relative group max-w-sm mx-auto">
                                            <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border-2 border-blue-100 shadow-lg">
                                                <img src={postContent.images[0].url} className="w-full h-full object-cover" />
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                                                onClick={() => setPostContent(prev => ({ ...prev, images: [] }))}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="video" className="space-y-6 pt-6">
                                    <SocialCaptionEditor
                                        value={postContent.text}
                                        onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                                        placeholder="Add a caption..."
                                        platform="telegram"
                                        minHeight="100px"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => openGallery("video")}
                                        className="w-full h-24 border-dashed border-2 border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <Video className="h-6 w-6 text-slate-400 group-hover:text-blue-500" />
                                            <span className="text-slate-500 group-hover:text-blue-600 font-medium">Select Video from Gallery</span>
                                        </div>
                                    </Button>

                                    {postContent.video && (
                                        <div className="relative group max-w-sm mx-auto">
                                            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
                                                <video src={postContent.video.url} controls className="w-full h-full" />
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                                                onClick={() => setPostContent(prev => ({ ...prev, video: null }))}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="link" className="space-y-6 pt-6">
                                    <SocialCaptionEditor
                                        value={postContent.text}
                                        onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                                        placeholder="Write about this link..."
                                        platform="telegram"
                                        minHeight="100px"
                                    />
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-slate-700">Link URL</Label>
                                        <div className="relative">
                                            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="url"
                                                placeholder="https://example.com"
                                                value={postContent.link}
                                                onChange={(e) => setPostContent(prev => ({ ...prev, link: e.target.value }))}
                                                className="h-14 pl-12 rounded-xl border-slate-200 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-0 shadow-xl rounded-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-5 w-5 text-blue-500" />
                                Scheduling
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <Label className="text-sm font-semibold text-slate-700">Schedule later</Label>
                                <Switch
                                    checked={scheduling.schedule}
                                    onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))}
                                />
                            </div>

                            {scheduling.schedule && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-wider font-bold text-slate-400">Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-slate-200">
                                                    <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                                                    {format(scheduling.date, "PPP")}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-0">
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
                                        <Label className="text-xs uppercase tracking-wider font-bold text-slate-400">Time</Label>
                                        <Input
                                            type="time"
                                            value={scheduling.time}
                                            onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value }))}
                                            className="h-12 rounded-xl border-slate-200"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button
                        size="lg"
                        className="w-full h-16 rounded-2xl text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 border-0 transition-all active:scale-95"
                        onClick={handleSubmit}
                        disabled={isPending || !selectedAccount}
                    >
                        {isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : scheduling.schedule ? (
                            <CalendarDays className="h-5 w-5 mr-2" />
                        ) : (
                            <Send className="h-5 w-5 mr-2" />
                        )}
                        {isPending ? "Processing..." : scheduling.schedule ? "Schedule Broadcast" : "Send Now"}
                    </Button>
                </div>
            </div>

            <GalleryModal
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                onSelect={handleGallerySelect}
                allowedTypes={[galleryMediaType]}
                allowMultiple={false}
                title={galleryMediaType === "image" ? "Select Photo" : "Select Video"}
            />
        </div>
    );
}
