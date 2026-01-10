"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { format } from "date-fns";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createLinkedinPost } from "@/app/actions/social/linkedin/createPost";
import {
    CalendarDays, Globe, Zap, Calendar as CalendarIcon, Users,
    Clock, Trash2, FileText, Linkedin, Loader2, Image as ImageIcon, Video
} from "lucide-react";
import { checkLinkedinConnection } from "@/app/actions/social/linkedin/connectAccount";
import GalleryModal from "@/components/gallery/GalleryModal";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";

export default function CreateLinkedinPost() {
    const [isPending, startTransition] = useTransition();
    const [selectedAccount, setSelectedAccount] = useState("");
    const [postContent, setPostContent] = useState({
        text: "",
        media: null,
    });
    const [scheduling, setScheduling] = useState({
        schedule: false,
        date: new Date(),
        time: "12:00",
    });
    const [accounts, setAccounts] = useState([]);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [coinBalance, setCoinBalance] = useState(0);

    useEffect(() => {
        async function loadData() {
            const [liRes, userRes] = await Promise.all([
                checkLinkedinConnection(),
                fetch("/api/user/me").then(r => r.json())
            ]);

            if (liRes.connected) {
                if (liRes.accounts && liRes.accounts.length > 0) {
                    setAccounts(liRes.accounts);
                } else {
                    setAccounts([{
                        id: liRes.accountId,
                        name: liRes.displayName,
                        profilePicture: liRes.profilePicture
                    }]);
                }
            }

            if (userRes.user) {
                setCoinBalance(userRes.user.coinBalance);
            }
        }
        loadData();
    }, []);

    const handleGallerySelect = (selectedItems) => {
        const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
        if (items.length > 0) {
            const item = items[0];
            setPostContent(prev => ({
                ...prev,
                media: {
                    url: item.fileUrl,
                    name: item.fileName,
                    type: item.fileType, // image or video
                }
            }));
        }
        setGalleryOpen(false);
    };

    const validateForm = () => {
        if (!selectedAccount) {
            toast.error("Please select a LinkedIn account");
            return false;
        }
        if (coinBalance <= 0) {
            toast.error("Insufficient coins. Please buy more coins to post.");
            return false;
        }
        if (!postContent.text.trim() && !postContent.media) {
            toast.error("Please enter some text or select media for your post");
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
                const res = await createLinkedinPost({
                    text: postContent.text,
                    imageUrl: postContent.media?.type === "image" ? postContent.media.url : null,
                    videoUrl: postContent.media?.type === "video" ? postContent.media.url : null,
                    scheduledTime,
                });

                if (res.success) {
                    toast.success(res.message);
                    setCoinBalance(prev => prev - 1);
                    setPostContent({ text: "", media: null });
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
            <Card className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                    <Linkedin className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Post to LinkedIn
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600">
                                Share professional updates, images, or videos with your network.
                            </CardDescription>
                        </div>
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                            <Zap className="mr-1 h-3 w-3" />
                            LinkedIn Professional
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
                                Select LinkedIn Account
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="Select a LinkedIn account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold overflow-hidden">
                                                    {acc.profilePicture ? (
                                                        <img src={acc.profilePicture} alt={acc.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        acc.name.charAt(0)
                                                    )}
                                                </div>
                                                <span className="font-medium">{acc.name}</span>
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
                            <CardTitle className="text-xl">Post Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">Share your update</Label>
                                    <SocialCaptionEditor
                                        value={postContent.text}
                                        onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                                        placeholder="What do you want to talk about?"
                                        platform="linkedin"
                                        minHeight="200px"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Media (Optional)</Label>
                                {!postContent.media ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setGalleryOpen(true)}
                                        className="w-full h-32 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 flex flex-col gap-2"
                                    >
                                        <div className="flex gap-2 text-gray-400">
                                            <ImageIcon className="h-8 w-8" />
                                            <Video className="h-8 w-8" />
                                        </div>
                                        <span>Select Image or Video from Gallery</span>
                                    </Button>
                                ) : (
                                    <div className="relative rounded-xl overflow-hidden border-2 border-blue-200 shadow-md">
                                        <div className="absolute top-2 right-2 z-10">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setPostContent(prev => ({ ...prev, media: null }))}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {postContent.media.type === "image" ? (
                                            <img src={postContent.media.url} alt="Post preview" className="w-full h-auto max-h-[400px] object-contain bg-slate-50" />
                                        ) : (
                                            <video src={postContent.media.url} controls className="w-full max-h-[400px]" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Scheduling Card */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-indigo-600" />
                                Scheduling
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="schedule-toggle" className="text-sm font-medium text-slate-600">
                                    Schedule post
                                </Label>
                                <Switch
                                    id="schedule-toggle"
                                    checked={scheduling.schedule}
                                    onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))}
                                />
                            </div>

                            {scheduling.schedule && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
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

                    <Button
                        size="lg"
                        className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                        onClick={handleSubmit}
                        disabled={isPending || !selectedAccount}
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {scheduling.schedule ? "Scheduling..." : "Posting..."}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-2">
                                    {scheduling.schedule ? <CalendarDays className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                    {scheduling.schedule ? "Schedule Post (1 Coin)" : "Share Now (1 Coin)"}
                                </div>
                                <span className="text-[10px] opacity-70 font-normal mt-0.5">
                                    Balance: {coinBalance} Coins
                                </span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            <GalleryModal
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                onSelect={handleGallerySelect}
                allowedTypes={["image", "video"]}
                allowMultiple={false}
                title="Select Media for LinkedIn"
            />
        </div>
    );
}
