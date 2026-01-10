"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createThreadsPost } from "@/app/actions/social/threads/createPost";
import { fetchThreadsAccounts } from "@/app/actions/social/threads/getAccounts";
import { Loader2, AtSign, Image as ImageIcon, Video, Send } from "lucide-react";

export default function CreateThreadsPost() {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [text, setText] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaType, setMediaType] = useState("TEXT");
    const [coinBalance, setCoinBalance] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            const [thRes, userRes] = await Promise.all([
                fetchThreadsAccounts(),
                fetch("/api/user/me").then(r => r.json())
            ]);

            if (thRes.success && thRes.accounts.length > 0) {
                setAccounts(thRes.accounts);
                setSelectedAccount(thRes.accounts[0].accountId);
            }

            if (userRes.user) {
                setCoinBalance(userRes.user.coinBalance);
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAccount) return toast.error("Please select an account");
        if (coinBalance <= 0) return toast.error("Insufficient coins. Please buy more coins to post.");
        if (!text && !mediaUrl) return toast.error("Please enter text or a media URL");

        setLoading(true);
        try {
            const result = await createThreadsPost({
                pageId: selectedAccount,
                text,
                mediaUrl: mediaUrl || null,
                mediaType,
            });

            if (result.success) {
                toast.success("Post published successfully to Threads!");
                setCoinBalance(prev => prev - 1);
                setText("");
                setMediaUrl("");
                setMediaType("TEXT");
            } else {
                toast.error(result.message || "Failed to publish post");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card className="border border-neutral-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <AtSign className="w-5 h-5" /> New Threads Post
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="account">Select Account</Label>
                            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                <SelectTrigger id="account">
                                    <SelectValue placeholder="Choose a Threads account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((acc) => (
                                        <SelectItem key={acc.accountId} value={acc.accountId}>
                                            {acc.username || acc.pageName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="text">Post Content (Max 500 characters)</Label>
                            <Textarea
                                id="text"
                                placeholder="What's on your mind? #Threads"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="h-32 resize-none"
                                maxLength={500}
                            />
                            <div className="text-right text-xs text-muted-foreground">
                                {text.length}/500
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mediaType">Media Type</Label>
                            <Select value={mediaType} onValueChange={setMediaType}>
                                <SelectTrigger id="mediaType">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TEXT">Text Only</SelectItem>
                                    <SelectItem value="IMAGE">Image</SelectItem>
                                    <SelectItem value="VIDEO">Video</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {mediaType !== "TEXT" && (
                            <div className="space-y-2">
                                <Label htmlFor="mediaUrl">Public Media URL</Label>
                                <Input
                                    id="mediaUrl"
                                    placeholder="https://example.com/image.jpg"
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Threads API requires publicly accessible media URLs.
                                </p>
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-neutral-800 hover:bg-neutral-900" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2">
                                        <Send className="h-4 w-4" />
                                        Post to Threads (1 Coin)
                                    </div>
                                    <span className="text-[10px] opacity-70 font-normal mt-0.5">
                                        Balance: {coinBalance} Coins
                                    </span>
                                </div>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Preview Section */}
            <Card className="border border-neutral-200 bg-neutral-50/50 shadow-sm overflow-hidden h-fit">
                <CardHeader className="bg-white border-b border-neutral-100">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Live Preview
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 max-w-sm mx-auto">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                                <AtSign className="w-5 h-5 text-neutral-400" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-sm truncate">
                                        {accounts.find(a => a.accountId === selectedAccount)?.username || "YourAccount"}
                                    </span>
                                    <span className="text-neutral-400 text-xs text-nowrap">· now</span>
                                </div>
                                <p className="text-sm text-neutral-800 break-words whitespace-pre-wrap">
                                    {text || <span className="text-neutral-300 italic">Your post content will appear here...</span>}
                                </p>

                                {mediaUrl && (
                                    <div className="mt-3 rounded-xl border border-neutral-100 overflow-hidden bg-neutral-50 aspect-video flex items-center justify-center">
                                        {mediaType === "IMAGE" ? (
                                            <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.src = "https://placehold.co/600x400?text=Invalid+Image+URL"} />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-neutral-400">
                                                <Video className="w-8 h-8" />
                                                <span className="text-[10px]">Video Preview</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mt-4 text-neutral-400">
                                    <div className="h-4 w-4 rounded-md border border-neutral-200" />
                                    <div className="h-4 w-4 rounded-md border border-neutral-200" />
                                    <div className="h-4 w-4 rounded-md border border-neutral-200" />
                                    <div className="h-4 w-4 rounded-md border border-neutral-200" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
