"use client";

import { useState, useRef, useTransition, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Tabs, TabsList, TabsTrigger, TabsContent
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogTitle
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
    LayoutGrid, List, Calendar as CalendarIcon, Plus, X,
    Edit, Trash2, Pin
} from "lucide-react";

// Server Actions
import {
    deletePinterestPost,
} from "@/app/actions/social/pinterest/pinterestPostsActions";
import { getPinterestAccounts } from "@/app/actions/social/pinterest/getAccounts";

// Internal Components
import PinterestCalendarViewComponent from "./PinterestCalendarViewComponent";
import PinterestViewComponent from "./PinterestViewComponent";
import PinterestListingViewComponent from "./PinterestListingViewComponent";
import CreatePinterestPost from "./CreatePinterestPost";
import PinterestLogo from "@/components/icons/PinterestLogo";
import PinterestAnalyticsModal from "./PinterestAnalyticsModal";

export default function PublishedPinterestPosts({ accountId: initialAccountId }) {
    const [activeTab, setActiveTab] = useState("calendar");
    const [isCreating, setIsCreating] = useState(false);
    const [createInitialData, setCreateInitialData] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null });
    const [accounts, setAccounts] = useState([]);
    const [analyticsModal, setAnalyticsModal] = useState({ open: false, post: null });

    useEffect(() => {
        const loadAccounts = async () => {
            const res = await getPinterestAccounts();
            if (res.success) {
                setAccounts(res.accounts || []);
            }
        };
        loadAccounts();
    }, []);

    const handleDateClick = (date) => {
        setCreateInitialData({
            scheduledAt: date
        });
        setIsCreating(true);
    };

    const handleEdit = (post, action = 'edit') => {
        if (action === 'delete') {
            setDeleteDialog({ open: true, postId: post.id });
            return;
        }
        if (action === 'analytics') {
            setAnalyticsModal({ open: true, post });
            return;
        }

        // Map post to initialData format if needed
        const initialData = {
            ...post,
            readOnly: post.status === 'published' || action === 'view'
        };
        setCreateInitialData(initialData);
        setIsCreating(true);
    };

    const handleDelete = async () => {
        const res = await deletePinterestPost(deleteDialog.postId);
        if (res.success) {
            toast.success("Pin deleted");
            handleRefresh();
        } else {
            toast.error(res.message);
        }
        setDeleteDialog({ open: false, postId: null });
    };

    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Premium Compact Header - Matching Threads' Studio Style */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-50/20 p-5 lg:p-6">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-gradient-to-br from-red-200/10 to-red-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E60023] border border-red-800 text-white">
                            <PinterestLogo className="h-3 w-3 fill-white" />
                            <span className="text-[9px] font-black uppercase tracking-wider">Pinterest Business Academy</span>
                        </div>

                        <div className="space-y-0.5">
                            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-gray-900">
                                Content Studio
                            </h1>
                            <p className="text-gray-500 max-w-md text-xs font-medium leading-relaxed">
                                Elevate your pinterest presence with precision scheduling and performance intelligence.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {accounts.length > 0 && (
                            <div className="hidden lg:flex flex-row items-center -space-x-2 mr-2">
                                {accounts.slice(0, 3).map((account, i) => (
                                    <div key={account.id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm" title={account.username}>
                                        {account.profilePicture ? (
                                            <img src={account.profilePicture} alt={account.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-[10px] font-bold text-gray-500">
                                                {account.username?.charAt(0).toUpperCase() || "P"}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {accounts.length > 3 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-[#E60023] flex items-center justify-center shadow-sm z-10">
                                        <span className="text-[10px] font-black text-white">+{accounts.length - 3}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            onClick={() => {
                                setCreateInitialData(null);
                                setIsCreating(true);
                            }}
                            className="group relative px-6 h-11 bg-[#E60023] hover:bg-[#ad001a] text-white font-black rounded-xl shadow-xl shadow-red-100 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                        >
                            <div className="relative flex items-center gap-2">
                                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                <span className="text-sm">Compose Masterpiece</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white border border-gray-100 p-1 rounded-xl shadow-sm mb-6 h-auto inline-flex">
                    <TabsTrigger value="calendar" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-red-50 data-[state=active]:text-[#E60023] font-bold text-gray-500 gap-2">
                        <CalendarIcon className="h-4 w-4" /> Calendar View
                    </TabsTrigger>
                    <TabsTrigger value="pins" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-[#E60023] data-[state=active]:text-white font-bold text-gray-500 gap-2">
                        <LayoutGrid className="h-4 w-4" /> Pins View
                    </TabsTrigger>
                    <TabsTrigger value="listing" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 font-bold text-gray-500 gap-2">
                        <List className="h-4 w-4" /> Listing View
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PinterestCalendarViewComponent
                        onDateClick={handleDateClick}
                        onPostClick={handleEdit}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="pins" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PinterestViewComponent
                        accountId={initialAccountId}
                        refreshTrigger={refreshTrigger}
                        onEdit={handleEdit}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="listing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PinterestListingViewComponent
                        accountId={initialAccountId}
                        refreshTrigger={refreshTrigger}
                        onEdit={handleEdit}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>
            </Tabs>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="!w-[80vw] !max-w-[80vw] h-[90vh] overflow-hidden p-0 border-0 bg-transparent shadow-none" aria-describedby={undefined} showCloseButton={false}>
                    <div className="hidden">
                        <DialogTitle>Post Creator</DialogTitle>
                    </div>
                    {isCreating && (
                        <div className="bg-white w-full h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                            <div className="px-6 py-4 bg-white border-b border-gray-50 flex items-center justify-between font-sans shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-[#E60023] rounded-xl shadow-lg flex items-center justify-center transform rotate-3">
                                        <PinterestLogo className="h-4 w-4 fill-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-sm font-black text-gray-900 leading-none">Post Creator</h2>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Pinterest Studio v2.0</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setCreateInitialData(null);
                                    }}
                                    className="rounded-full hover:bg-gray-50 text-gray-400 hover:text-black transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <CreatePinterestPost
                                    initialData={createInitialData}
                                    onSuccess={() => {
                                        setIsCreating(false);
                                        setCreateInitialData(null);
                                        handleRefresh();
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <PinterestAnalyticsModal
                open={analyticsModal.open}
                onOpenChange={(o) => setAnalyticsModal(p => ({ ...p, open: o }))}
                post={analyticsModal.post}
            />

            <AlertDialog open={deleteDialog.open} onOpenChange={(o) => setDeleteDialog(p => ({ ...p, open: o }))}>
                <AlertDialogContent className="rounded-[32px] border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black tracking-tight">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 font-medium pt-2">
                            This will permanently delete the pin from our records. It will no longer appear in your calendar or listing views.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-6">
                        <AlertDialogCancel className="rounded-xl font-bold border-gray-100">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl h-11 px-8">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
