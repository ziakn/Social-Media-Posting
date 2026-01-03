"use client";

import React, { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getAllThreadsCalendarPosts } from "@/app/actions/social/threads/threadsPostsActions";
import { toast } from "sonner";
import { format } from "date-fns";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";
import "./threads-calendar.css";

export default function ThreadsCalendarViewComponent({
    onDateClick,
    onPostClick,
    refreshTrigger,
    onRefresh
}) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadCalendarPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAllThreadsCalendarPosts();
            if (res.success) {
                const formattedEvents = res.posts.map(post => ({
                    id: post.id,
                    title: post.content?.text || post.message || post.caption || "Thread",
                    start: post.scheduledAt || post.createdAt,
                    extendedProps: post,
                    backgroundColor: post.status === 'scheduled' ? '#f5f5f4' : '#000000',
                    borderColor: post.status === 'scheduled' ? '#e7e5e4' : '#000000',
                    textColor: post.status === 'scheduled' ? '#57534e' : '#ffffff',
                    className: `threads-event-${post.status}`
                }));
                setEvents(formattedEvents);
            }
        } catch (error) {
            toast.error("Failed to load calendar");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCalendarPosts();
    }, [loadCalendarPosts, refreshTrigger]);

    const renderEventContent = (eventInfo) => {
        const post = eventInfo.event.extendedProps;
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 overflow-hidden group cursor-pointer">
                <div className="shrink-0 scale-75">
                    <ThreadsLogo className={post.status === 'scheduled' ? "text-stone-400" : "text-white"} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter truncate">
                    {eventInfo.event.title}
                </span>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm animate-in fade-in duration-700">
            <div className="threads-calendar-wrapper">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={events}
                    eventContent={renderEventContent}
                    eventClick={(info) => onPostClick(info.event.extendedProps)}
                    dateClick={(info) => onDateClick(info.date)}
                    editable={true}
                    droppable={true}
                    height="auto"
                    dayMaxEvents={3}
                />
            </div>
        </div>
    );
}
