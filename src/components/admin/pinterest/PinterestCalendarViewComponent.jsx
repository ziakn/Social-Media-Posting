"use client";

import { useEffect, useState } from "react";
import PinterestFullCalendar from "./PinterestFullCalendar";
import { getPinterestCalendarPosts } from "@/app/actions/social/pinterest/pinterestPostsActions";
import { getPinterestAccounts } from "@/app/actions/social/pinterest/getAccounts";
import { Card, CardContent } from "@/components/ui/card";
import { startOfMonth, endOfMonth } from "date-fns";
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
    const [calendarDate, setCalendarDate] = useState(new Date());

    // Fetch accounts once on mount
    useEffect(() => {
        const loadAccounts = async () => {
            const accountsRes = await getPinterestAccounts();
            if (accountsRes.success) setAccounts(accountsRes.accounts || []);
        };
        loadAccounts();
    }, []);

    // Fetch posts whenever calendarDate or refreshTrigger changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch posts for the current month range
                const startDate = startOfMonth(calendarDate);
                const endDate = endOfMonth(calendarDate);

                const postsRes = await getPinterestCalendarPosts({
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
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
    }, [refreshTrigger, calendarDate]);

    // Note: We no longer return the loader early to prevent the calendar from unmounting
    // Instead, we use a relative container with an overlay in the render section


    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-2 overflow-hidden relative min-h-[600px]">
                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-[2rem] animate-in fade-in duration-300">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-10 w-10 animate-spin text-[#E60023]" />
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Updating Pins...</span>
                            </div>
                        </div>
                    )}

                    <PinterestFullCalendar
                        posts={posts}
                        accounts={accounts}
                        onDateClick={onDateClick}
                        onPostClick={onPostClick}
                        onRefresh={onRefresh}
                        onMonthChange={setCalendarDate}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
