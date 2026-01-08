"use client";

import { useState, useEffect } from "react";
import { fetchBlueSkyPosts } from "@/app/actions/social/bluesky/getPosts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ExternalLink, RefreshCcw, MessageSquare, Heart } from "lucide-react";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";

export default function PublishedBlueSkyPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const res = await fetchBlueSkyPosts("published");
            if (res.success) {
                setPosts(res.posts || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    if (loading) return <Spinner className="mx-auto mt-10" />;

    if (posts.length === 0) {
        return (
            <Card className="border-dashed border-neutral-300">
                <CardContent className="p-12 text-center">
                    <BlueSkyLogo className="h-10 w-10 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-700">No Published Posts</h3>
                    <p className="text-muted-foreground mb-6">You haven't published any posts to BlueSky yet.</p>
                    <Button onClick={loadPosts} variant="outline" size="sm">
                        <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={loadPosts} variant="ghost" size="sm" className="h-8">
                    <RefreshCcw className="w-3 h-3 mr-2" /> Refresh
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight">
                                    {post.content.mediaType || "TEXT"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <p className="text-sm text-neutral-800 line-clamp-4 min-h-[5rem]">
                                {post.content.text || "No text content"}
                            </p>

                            {post.content.mediaUrl && (
                                <div className="rounded-lg overflow-hidden border border-neutral-100 bg-neutral-50 aspect-video">
                                    {post.content.mediaType === "IMAGE" ? (
                                        <img src={post.content.mediaUrl} alt="BlueSky media" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                            <BlueSkyLogo className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-neutral-400">
                                    <div className="flex items-center gap-1">
                                        <Heart className="w-3 h-3" />
                                        <span className="text-[10px]">--</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" />
                                        <span className="text-[10px]">--</span>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-neutral-600" asChild>
                                    <a href={`https://bsky.app/profile/${post.accountId}/post/${post.blueskyPostId?.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3 h-3 mr-1" /> View
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
