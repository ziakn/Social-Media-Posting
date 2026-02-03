"use client";

import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import LinkedinFullCalendar from "./LinkedinFullCalendar";
import { getAllLinkedinCalendarPosts, fetchLinkedinAccounts } from "@/app/actions/social/linkedin/linkedinPostsActions";

export default function LinkedinCalendarViewComponent({
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
        fetchLinkedinAccounts().then(res => {
            if (res.success) setAccounts(res.accounts);
        });
    }, []);

    useEffect(() => {
        setLoadingCalendar(true);
        const startDate = startOfMonth(calendarDate);
        const endDate = endOfMonth(calendarDate);

        getAllLinkedinCalendarPosts({ startDate, endDate }).then(res => {
            if (res.success) setCalendarPosts(res.posts);
        }).finally(() => setLoadingCalendar(false));
    }, [calendarDate, refreshTrigger]);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] relative">
            {loadingCalendar && (
                <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-[#0077b5]" />
                        <p className="text-sm font-medium text-gray-500 italic">Curating your network...</p>
                    </div>
                </div>
            )}
            <LinkedinFullCalendar
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
