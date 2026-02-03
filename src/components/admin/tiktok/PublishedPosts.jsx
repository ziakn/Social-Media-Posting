"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUsage } from "@/hooks/useUsage";
import {
    Tabs, TabsList, TabsTrigger, TabsContent
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    LayoutGrid, List, Calendar as CalendarIcon, Plus, X, BarChart3, Clock, Layout
} from "lucide-react";

// Server Actions
import {
    getTiktokPosts, deleteTiktokPost, getTiktokPostsStats
} from "@/app/actions/social/tiktok/tiktokPostsActions";
import { getUserTikTokAccounts } from "@/app/actions/social/tiktok/getAccounts";

// Internal Components
import TiktokViewComponent from "./TiktokViewComponent";
import TiktokListingViewComponent from "./TiktokListingViewComponent";
import TiktokCalendarViewComponent from "./TiktokCalendarViewComponent";
import TiktokAnalyticsModal from "./TiktokAnalyticsModal";
import CreateTiktokPost from "./CreateTiktokPost";
import { TiktokLogo } from "@/components/icons/TiktokLogo";

export default function TikTokPublishedPosts({ accountId: initialAccountId }) {
    const [activeTab, setActiveTab] = useState("calendar");
    const [isCreating, setIsCreating] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [accounts, setAccounts] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId || "all");

    // Analytics Modal State
    const [analyticsOpen, setAnalyticsOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    // Delete Dialog State
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { canPost, loading: usageLoading } = useUsage();

    useEffect(() => {
        const loadAccounts = async () => {
            const res = await getUserTikTokAccounts();
            if (res.success) setAccounts(res.accounts || []);
        };
        loadAccounts();
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const result = await getTiktokPostsStats({ accountId: selectedAccountId });
            if (result.success) setStats(result.stats);
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }, [selectedAccountId]);

    useEffect(() => {
        loadStats();
    }, [loadStats, refreshTrigger]);

    const handleRefresh = useCallback(() => {
        setRefreshTrigger(p => p + 1);
        loadStats();
    }, [loadStats]);

    const handlePostAction = (post, action) => {
        if (action === 'analytics') {
            setSelectedPost(post);
            setAnalyticsOpen(true);
        } else if (action === 'delete') {
            setDeleteId(post.id);
        } else if (action === 'edit') {
            setSelectedPost(post);
            setIsCreating(true);
        }
    };

    const handleDateClick = (date) => {
        const initialData = {
            scheduledAt: date,
            status: 'draft', // To ensure it opens in edit mode
        };
        setSelectedPost(initialData);
        setIsCreating(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            setIsDeleting(true);
            const result = await deleteTiktokPost(deleteId);
            if (result.success) {
                toast.success("Post deleted successfully");
                handleRefresh();
            } else {
                toast.error(result.message);
            }
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return "0";
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            {/* Premium Compact Header - Matching Threads' Studio Style */}
            <header className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-50/20 p-5 lg:p-6">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-gradient-to-br from-gray-200/10 to-gray-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black border border-gray-800 text-white">
                            <TiktokLogo className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-wider">TikTok Business Academy</span>
                        </div>

                        <div className="space-y-0.5">
                            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-gray-900">
                                Content Studio
                            </h1>
                            <p className="text-gray-500 max-w-md text-xs font-medium leading-relaxed">
                                Elevate your TikTok presence with precision scheduling and performance intelligence.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {accounts.length > 0 && (
                            <div className="hidden lg:flex flex-row items-center -space-x-2 mr-2">
                                {accounts.slice(0, 3).map((account, i) => (
                                    <div
                                        key={account.id}
                                        onClick={() => setSelectedAccountId(prev => prev === account.accountId ? "all" : account.accountId)}
                                        className={cn(
                                            "w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm cursor-pointer transition-all hover:scale-110 relative",
                                            selectedAccountId === account.accountId ? "z-30 ring-2 ring-black ring-offset-2" : `z-${10 - i}`
                                        )}
                                        title={account.username}
                                    >
                                        {account.profilePicture ? (
                                            <img src={account.profilePicture} alt={account.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-[10px] font-bold text-gray-500">
                                                {account.username?.charAt(0).toUpperCase() || "T"}
                                            </div>
                                        )}
                                        {selectedAccountId === account.accountId && (
                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                                <div className="bg-white rounded-full p-0.5 shadow-sm">
                                                    <Check className="h-2 w-2 text-black stroke-[4]" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {accounts.length > 3 && (
                                    <div
                                        onClick={() => setSelectedAccountId("all")}
                                        className={cn(
                                            "w-8 h-8 rounded-full border-2 border-white bg-black flex items-center justify-center shadow-sm z-10 cursor-pointer hover:scale-110",
                                            selectedAccountId === "all" && "ring-2 ring-black ring-offset-2"
                                        )}
                                    >
                                        <span className="text-[10px] font-black text-white">+{accounts.length - 3}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <Button
                            disabled={!canPost && !usageLoading}
                            onClick={() => {
                                setSelectedPost(null);
                                setIsCreating(true);
                            }}
                            className="group relative px-6 h-11 bg-black hover:bg-gray-800 text-white font-black rounded-xl shadow-xl shadow-gray-100 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
                        >
                            <div className="relative flex items-center gap-2">
                                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                <span className="text-sm">
                                    {!canPost && !usageLoading ? "Quota Reached" : "Compose Masterpiece"}
                                </span>
                            </div>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Tabs & Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm h-14">
                        <TabsTrigger value="calendar" className="rounded-xl px-6 h-full data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 font-black text-[10px] uppercase tracking-widest transition-all">
                            <CalendarIcon className="h-4 w-4 mr-2" /> Calendar
                        </TabsTrigger>
                        <TabsTrigger value="grid" className="rounded-xl px-6 h-full data-[state=active]:bg-black data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                            <LayoutGrid className="h-4 w-4 mr-2" /> TikTok View
                        </TabsTrigger>
                        <TabsTrigger value="listing" className="rounded-xl px-6 h-full data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all">
                            <List className="h-4 w-4 mr-2" /> List
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3">
                        {accounts.length > 0 && (
                            <div className="flex -space-x-3">
                                {accounts.slice(0, 3).map(acc => (
                                    <Avatar key={acc.id} className="h-8 w-8 border-2 border-white shadow-sm">
                                        <AvatarImage src={acc.profilePicture} />
                                        <AvatarFallback>T</AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <TabsContent value="calendar" className="mt-0 outline-none">
                    <TiktokCalendarViewComponent
                        accountId={selectedAccountId}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                        onPostClick={handlePostAction}
                        onDateClick={handleDateClick}
                    />
                </TabsContent>

                <TabsContent value="grid" className="mt-0 outline-none">
                    <TiktokViewComponent
                        accountId={selectedAccountId}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                        onEdit={(p) => handlePostAction(p, 'edit')}
                    />
                </TabsContent>

                <TabsContent value="listing" className="mt-0 outline-none">
                    <TiktokListingViewComponent
                        accountId={selectedAccountId}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                        onEdit={(p) => handlePostAction(p, 'edit')}
                    />
                </TabsContent>
            </Tabs>

            {/* Create/Edit/View Post Dialog - Standardized */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="!w-[80vw] !max-w-[80vw] h-[90vh] overflow-hidden p-0 border-0 bg-transparent shadow-none" showCloseButton={false}>
                    {isCreating && (
                        <div className="bg-white w-full h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                            <div className="px-6 py-4 bg-white border-b border-gray-50 flex items-center justify-between font-sans shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-black rounded-xl shadow-lg flex items-center justify-center transform rotate-3">
                                        <TiktokLogo className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <DialogTitle className="text-sm font-black text-gray-900 leading-none">
                                            {selectedPost?.status === 'published' ? "View Masterpiece" : (selectedPost?.id ? "Edit Masterpiece" : "Compose Masterpiece")}
                                        </DialogTitle>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">TikTok Studio v2.0</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => {
                                    setIsCreating(false);
                                    setSelectedPost(null);
                                }} className="rounded-full hover:bg-gray-50 text-gray-400 hover:text-black transition-all">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <CreateTiktokPost
                                initialData={selectedPost}
                                onSuccess={(action) => {
                                    if (action === 'analytics') {
                                        setAnalyticsOpen(true);
                                        setIsCreating(false);
                                        return;
                                    }
                                    setIsCreating(false);
                                    setSelectedPost(null);
                                    handleRefresh();
                                }}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Analytics Modal */}
            <TiktokAnalyticsModal
                open={analyticsOpen}
                onOpenChange={setAnalyticsOpen}
                post={selectedPost}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-3xl p-8 max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-gray-900">Delete Post?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium text-gray-500">
                            This action cannot be undone. This video will be removed from your dashboard.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 flex gap-3">
                        <AlertDialogCancel className="rounded-xl font-bold flex-1">Keep it</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="rounded-xl flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                        >
                            {isDeleting ? <Clock className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
