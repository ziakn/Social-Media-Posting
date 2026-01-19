"use client";

import { useEffect, useState } from "react";
import PinterestFullCalendar from "./PinterestFullCalendar";
import { getPinterestPosts } from "@/app/actions/social/pinterest/pinterestPostsActions";
import { getPinterestAccounts } from "@/app/actions/social/pinterest/getAccounts";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function PinterestCalendarViewComponent({
    onDateClick,
    onPostClick,
    refreshTrigger,
    onRefresh
}) {
    const [posts, setPosts] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch accounts
                const accountsRes = await getPinterestAccounts();
                if (accountsRes.success) setAccounts(accountsRes.accounts || []);

                // Fetch posts
                const postsRes = await getPinterestPosts({
                    pageSize: 100,
                    filters: { status: 'all' }
                });

                if (postsRes.success) {
                    setPosts(postsRes.posts);
                }
            } catch (error) {
                console.error("Failed to load calendar data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refreshTrigger]);

    if (loading) {
        return (
            <div className="h-[600px] flex items-center justify-center bg-white rounded-2xl border border-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            </div>
        );
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-2 overflow-hidden">
                    <PinterestFullCalendar
                        posts={posts}
                        accounts={accounts}
                        onDateClick={onDateClick}
                        onPostClick={onPostClick}
                        onRefresh={onRefresh}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
