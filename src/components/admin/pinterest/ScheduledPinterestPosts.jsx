"use client";

import { useState, useEffect } from "react";
import { getPinterestPosts, publishPinterestPostNow, deletePinterestPost } from "@/app/actions/social/pinterest/pinterestPostsActions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCcw, Trash2, Send, Clock } from "lucide-react";
import PinterestLogo from "@/components/icons/PinterestLogo";
import { toast } from "sonner";

export default function ScheduledPinterestPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [publishingId, setPublishingId] = useState(null);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const res = await getPinterestPosts({ filters: { status: "scheduled" } });
            if (res.success) {
                setPosts(res.posts || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishNow = async (id) => {
        setPublishingId(id);
        try {
            const res = await publishPinterestPostNow(id);
            if (res.success) {
                toast.success("Pin published!");
                loadPosts();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setPublishingId(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to cancel this scheduled pin?")) return;
        const res = await deletePinterestPost(id);
        if (res.success) {
            toast.success("Scheduled pin canceled");
            loadPosts();
        } else {
            toast.error(res.message);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    if (posts.length === 0) {
        return (
            <Card className="border-dashed border-neutral-300">
                <CardContent className="p-12 text-center">
                    <Clock className="h-10 w-10 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-700">No Scheduled Pins</h3>
                    <p className="text-muted-foreground mb-6">Create a Pin and set a schedule to see it here.</p>
                    <Button onClick={loadPosts} variant="outline" size="sm">
                        <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden border border-neutral-200 shadow-sm">
                        <div className="flex h-40">
                            <div className="w-1/3 bg-neutral-100 h-full">
                                <img
                                    src={post.content?.media?.[0]?.url || post.imageUrl}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-2/3 p-4 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-sm truncate">{post.title || "No Title"}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{post.message}</p>
                                    <div className="flex items-center gap-1 mt-2 text-[#E60023]">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[10px] font-bold">
                                            {new Date(post.scheduledAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleDelete(post.id)}>
                                        <Trash2 className="w-3 h-3 mr-1" /> Cancel
                                    </Button>
                                    <Button size="sm" className="h-8 text-xs bg-[#E60023] hover:bg-[#ad001a]" disabled={publishingId === post.id} onClick={() => handlePublishNow(post.id)}>
                                        {publishingId === post.id ? <Loader2 className="animate-spin w-3 h-3" /> : <Send className="w-3 h-3 mr-1" />}
                                        Post Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
