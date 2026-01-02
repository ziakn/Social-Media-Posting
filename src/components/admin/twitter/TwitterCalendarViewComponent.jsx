"use client";

import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import TwitterFullCalendar from "@/components/admin/twitter/TwitterFullCalendar";
import { getAllTwitterCalendarPosts } from "@/app/actions/social/twitter/twitterPostsActions";

export default function TwitterCalendarViewComponent({
    onDateClick,
    onPostClick,
    onRefresh,
    refreshTrigger = 0
}) {
    const [calendarPosts, setCalendarPosts] = useState([]);
    const [loadingCalendar, setLoadingCalendar] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    useEffect(() => {
        setLoadingCalendar(true);
        const startDate = startOfMonth(calendarDate);
        const endDate = endOfMonth(calendarDate);

        getAllTwitterCalendarPosts({ startDate, endDate }).then(res => {
            if (res.success) setCalendarPosts(res.posts);
        }).finally(() => setLoadingCalendar(false));
    }, [calendarDate, refreshTrigger]);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loadingCalendar && (
                <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                        <p className="text-sm font-medium text-gray-500">Loading tweets...</p>
                    </div>
                </div>
            )}
            <TwitterFullCalendar
                posts={calendarPosts}
                onMonthChange={setCalendarDate}
                onDateClick={onDateClick}
                onPostClick={onPostClick}
                onRefresh={onRefresh}
            />
        </div>
    );
}
