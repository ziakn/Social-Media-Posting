"use client";

import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import ThreadsFullCalendar from "./ThreadsFullCalendar";
import { getAllThreadsCalendarPosts } from "@/app/actions/social/threads/threadsPostsActions";
import { getUserThreadsAccounts } from "@/app/actions/social/threads/createPost";

export default function ThreadsCalendarViewComponent({
    onDateClick,
    onPostClick,
    onRefresh,
    refreshTrigger = 0
}) {
    const [calendarPosts, setCalendarPosts] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loadingCalendar, setLoadingCalendar] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    useEffect(() => {
        // Fetch accounts once
        getUserThreadsAccounts().then(res => {
            if (res.success) setAccounts(res.accounts);
        });
    }, []);

    useEffect(() => {
        setLoadingCalendar(true);
        const startDate = startOfMonth(calendarDate);
        const endDate = endOfMonth(calendarDate);

        getAllThreadsCalendarPosts({ startDate, endDate }).then(res => {
            if (res.success) setCalendarPosts(res.posts);
        }).finally(() => setLoadingCalendar(false));
    }, [calendarDate, refreshTrigger]);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] relative">
            {loadingCalendar && (
                <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
                        <p className="text-sm font-medium text-gray-500">Loading...</p>
                    </div>
                </div>
            )}
            <ThreadsFullCalendar
                posts={calendarPosts}
                accounts={accounts}
                onMonthChange={setCalendarDate}
                onDateClick={onDateClick}
                onPostClick={onPostClick}
                onRefresh={onRefresh}
            />
        </div>
    );
}
