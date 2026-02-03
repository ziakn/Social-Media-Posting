"use client";

import React, { useState } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    isToday,
    eachDayOfInterval,
    startOfToday,
    isBefore,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Clock, Globe, Eye, Edit, Trash2, Send, Loader2, BarChart3, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { publishFacebookPostNow } from "@/app/actions/social/facebook/facebookPostsActions";
import { toast } from "sonner";

export default function FullCalendar({
    posts = [],
    onDateClick,
    onPostClick,
    onMonthChange,
    onRefresh,
    className,
    mini = false
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [publishingId, setPublishingId] = useState(null);

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            const result = await publishFacebookPostNow(post.id);
            if (result.success) {
                toast.success("Post published successfully!");
                if (onRefresh) onRefresh();
            } else {
                toast.error(result.message || "Failed to publish post");
            }
        } catch (error) {
            toast.error("An error occurred while publishing");
        } finally {
            setPublishingId(null);
        }
    };

    const nextMonth = () => {
        const newDate = addMonths(currentMonth, 1);
        setCurrentMonth(newDate);
        if (onMonthChange) onMonthChange(newDate);
    };

    const prevMonth = () => {
        const newDate = subMonths(currentMonth, 1);
        setCurrentMonth(newDate);
        if (onMonthChange) onMonthChange(newDate);
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const getPostsForDay = (day) => {
        return posts.filter((post) => {
            const dateToCheck = post.scheduledAt || post.createdAt;
            if (!dateToCheck) return false;
            return isSameDay(new Date(dateToCheck), day);
        });
    };

    const renderHeader = () => {
        return (
            <div className={cn("flex items-center justify-between px-2", mini ? "mb-4" : "mb-8")}>
                <div className="flex flex-col">
                    <h2 className={cn("font-bold text-gray-900 tracking-tight", mini ? "text-xl" : "text-3xl")}>
                        {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    {!mini && (
                        <p className="text-gray-500 text-sm mt-1">
                            Manage and plan your Facebook content
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1.5 shadow-sm">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </Button>
                    <div className="w-[1px] h-4 bg-gray-200 mx-1" />
                    <Button variant="ghost" onClick={() => setCurrentMonth(new Date())} className="px-2 h-8 text-[10px] font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        Today
                    </Button>
                    <div className="w-[1px] h-4 bg-gray-200 mx-1" />
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return (
            <div className="grid grid-cols-7 border-b border-gray-100 mb-2">
                {dayLabels.map((day) => (
                    <div key={day} className={cn("py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider", mini && "py-1 text-[8px]")}>
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        return (
            <div className={cn("grid grid-cols-7 gap-px bg-gray-100 border-gray-100 overflow-hidden shadow-sm", mini ? "rounded-2xl border" : "rounded-none border-y", className?.includes("rounded-none") && "rounded-none")}>
                {days.map((day, idx) => {
                    const dayPosts = getPostsForDay(day);
                    const isSelectedMonth = isSameMonth(day, monthStart);
                    const isTodayDate = isToday(day);

                    return (
                        <div key={day.toString()} className={cn("bg-white p-2 transition-all duration-200 relative group flex flex-col", mini ? "min-h-[70px]" : "min-h-[140px]", !isSelectedMonth && "bg-gray-50/50", "hover:bg-gray-50/80 cursor-default")}>
                            <div className={cn("flex items-center justify-between mb-1", mini && "mb-0.5")}>
                                <span className={cn(
                                    "inline-flex items-center justify-center transition-colors font-medium rounded-full",
                                    mini ? "w-4 h-4 text-[9px]" : "w-7 h-7 text-sm",
                                    isTodayDate
                                        ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-100"
                                        : isSelectedMonth
                                            ? "text-gray-700 font-semibold"
                                            : "text-gray-300"
                                )}
                                >
                                    {format(day, "d")}
                                </span>
                                {onDateClick && !isBefore(day, startOfToday()) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full hover:bg-blue-100 hover:text-blue-600", mini ? "h-5 w-5" : "h-7 w-7")}
                                        onClick={() => onDateClick(day)}
                                    >
                                        <Plus className={cn(mini ? "h-3 w-3" : "h-4 w-4")} />
                                    </Button>
                                )}
                            </div>

                            <div className={cn("flex-1 space-y-1 overflow-y-auto scrollbar-hide text-blue-600", mini ? "max-h-[50px]" : "max-h-[100px]")}>
                                {dayPosts.map((post) => {
                                    const isPublished = post.status === "published" || post.isPublished;
                                    const isProcessing = publishingId === post.id;

                                    return (
                                        <DropdownMenu key={post.id}>
                                            <DropdownMenuTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-1.5 p-1 rounded-lg text-[10px] cursor-pointer transition-all duration-200 border shadow-sm relative",
                                                        mini && "gap-1 p-0.5 text-[8px]",
                                                        "bg-white hover:shadow-md hover:scale-[1.02] active:scale-95",
                                                        post.postType === "video" ? "border-purple-200 bg-purple-50/30" :
                                                            post.postType === "carousel" ? "border-blue-200 bg-blue-50/30" :
                                                                "border-blue-200 bg-blue-50/30",
                                                        isProcessing && "opacity-70 pointer-events-none"
                                                    )}
                                                >
                                                    <div className={cn("relative flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200", mini ? "w-4 h-4" : "w-7 h-7")}>
                                                        {post.mediaUrls?.[0]?.url ? (
                                                            <img src={post.mediaUrls[0].url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-[6px] text-blue-400">
                                                                <Facebook className="h-3 w-3" />
                                                            </div>
                                                        )}
                                                        {isProcessing && (
                                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                                <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex items-center gap-1">
                                                        {isPublished ? <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" /> : <Clock className="h-3 w-3 text-gray-400 shrink-0" />}
                                                        <p className="font-black text-gray-900 truncate tracking-tighter">
                                                            {post.scheduledAt ? format(new Date(post.scheduledAt), "h:mm") : (post.createdAt ? format(new Date(post.createdAt), "h:mm") : "Draft")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-40">
                                                {isPublished ? (
                                                    <>
                                                        <DropdownMenuItem onClick={() => onPostClick && onPostClick(post, 'view')}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>View Post</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onPostClick && onPostClick(post, 'analytics')} className="text-blue-600 focus:text-blue-700">
                                                            <BarChart3 className="mr-2 h-4 w-4" />
                                                            <span>View Analytics</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem onClick={() => onPostClick && onPostClick(post, 'edit')}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Edit Post</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="text-blue-600 focus:text-blue-700 focus:bg-blue-50">
                                                            <Send className="mr-2 h-4 w-4" />
                                                            <span>Publish Now</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onPostClick && onPostClick(post, 'delete')} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Delete Post</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    );
                                })}
                            </div>

                            {dayPosts.length === 0 && isSelectedMonth && !mini && !isBefore(day, startOfToday()) && (
                                <div className="absolute inset-x-2 bottom-2 text-[9px] text-gray-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => onDateClick(day)}>
                                    Click + to schedule
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={cn("calendar-container bg-white overflow-hidden", mini ? "rounded-3xl shadow-xl border border-gray-100 p-3" : "p-0", className)}>
            {renderHeader()}
            <div className={mini ? "" : "px-6"}>
                {renderDays()}
                {renderCells()}
            </div>
        </div>
    );
}
