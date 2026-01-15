"use client";

import { useState, useEffect, useCallback } from "react";
import { getPinterestPosts, deletePinterestPost } from "@/app/actions/social/pinterest/pinterestPostsActions";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Loader2, ExternalLink, RefreshCcw, Trash2, Pin, Edit } from "lucide-react";
import PinterestLogo from "@/components/icons/PinterestLogo";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PublishedPinterestPosts({ accountId, refreshTrigger, onEdit }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPinterestPosts({
                filters: {
                    status: "published",
                    accountId: accountId !== "all" ? accountId : null
                }
            });
            if (res.success) {
                setPosts(res.posts || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts, refreshTrigger]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#E60023]" /></div>;

    if (posts.length === 0) {
        return (
            <Card className="border-dashed border-neutral-300">
                <CardContent className="p-12 text-center">
                    <PinterestLogo className="h-10 w-10 opacity-20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-700">No Published Pins</h3>
                    <p className="text-muted-foreground mb-6">You haven't published any pins yet.</p>
                    <Button onClick={loadPosts} variant="outline" size="sm">
                        <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-shadow group rounded-2xl">
                        <div className="relative aspect-[2/3] bg-neutral-100 overflow-hidden">
                            <img
                                src={post.content?.media?.[0]?.url || post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 px-2">
                                <Button size="sm" variant="secondary" className="rounded-full h-8 px-2 flex-1 max-w-[80px]" asChild>
                                    <a href={`https://www.pinterest.com/pin/${post.pinterestPinId}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3 h-3 mr-1" /> View
                                    </a>
                                </Button>
                                <Button size="sm" variant="secondary" className="rounded-full h-8 px-2 flex-1 max-w-[80px]" onClick={() => onEdit && onEdit(post)}>
                                    <Edit className="w-3 h-3 mr-1" /> Edit
                                </Button>
                                <Button size="sm" variant="destructive" className="rounded-full h-8 w-8 p-0" onClick={() => onEdit && onEdit(post, 'delete')}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-4 space-y-2">
                            <h4 className="font-bold text-sm truncate text-gray-900">{post.title || "No Title"}</h4>
                            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{post.message || post.description}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                                <Badge variant="outline" className="text-[9px] font-bold text-gray-400 bg-gray-50 border-gray-100">
                                    {post.publishedAt ? format(new Date(post.publishedAt), "MMM dd, yyyy") : "Published"}
                                </Badge>
                                <PinterestLogo className="w-3 h-3 opacity-30 fill-[#E60023]" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
