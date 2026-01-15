"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
    getPinterestAccounts,
    getPinterestBoards,
    savePinterestPost,
    publishPinterestPostNow
} from "@/app/actions/social/pinterest/pinterestPostsActions";
import { Loader2, Image as ImageIcon, Send, Calendar as CalendarIcon, Clock, X, Check, BarChart3, Pin } from "lucide-react";
import PinterestLogo from "@/components/icons/PinterestLogo";
import PinterestPreview from "./PinterestPreview";
import { Separator } from "@/components/ui/separator";

export default function CreatePinterestPost({ initialData = null, onSuccess = null }) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!initialData?.id;
    const isReadOnly = initialData?.readOnly || false;

    const [accounts, setAccounts] = useState([]);
    const [boards, setBoards] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(initialData?.accountId || "");
    const [selectedBoard, setSelectedBoard] = useState(initialData?.boardId || "");
    const [title, setTitle] = useState(initialData?.title || "");
    const [message, setMessage] = useState(initialData?.message || initialData?.description || "");
    const [link, setLink] = useState(initialData?.link || "");
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || initialData?.content?.media?.[0]?.url || "");

    const [scheduling, setScheduling] = useState({
        schedule: !!initialData?.scheduledAt,
        date: initialData?.scheduledAt ? new Date(initialData.scheduledAt) : new Date(),
        time: initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "HH:mm") : "12:00",
    });

    useEffect(() => {
        async function loadAccounts() {
            const res = await getPinterestAccounts();
            if (res.success) {
                setAccounts(res.accounts || []);
                if (!selectedAccount && res.accounts.length > 0) {
                    setSelectedAccount(res.accounts[0].accountId);
                }
            }
        }
        loadAccounts();
    }, []);

    useEffect(() => {
        if (selectedAccount) {
            async function loadBoards() {
                const res = await getPinterestBoards(selectedAccount);
                if (res.success) {
                    setBoards(res.boards);
                    if (!selectedBoard && res.boards.length > 0) {
                        setSelectedBoard(res.boards[0].id);
                    }
                }
            }
            loadBoards();
        }
    }, [selectedAccount]);

    const handleSubmit = async (publishNow = false) => {
        if (!selectedAccount) return toast.error("Please select a Pinterest account");
        if (!selectedBoard) return toast.error("Please select a board");
        if (!imageUrl) return toast.error("Pins require an image URL");

        startTransition(async () => {
            try {
                let scheduledAt = null;
                if (scheduling.schedule) {
                    const [hours, minutes] = scheduling.time.split(':');
                    scheduledAt = new Date(scheduling.date);
                    scheduledAt.setHours(parseInt(hours), parseInt(minutes));
                }

                const postData = {
                    postId: initialData?.id,
                    title,
                    message,
                    link,
                    boardId: selectedBoard,
                    media: [{ type: "IMAGE", url: imageUrl }],
                    scheduling: scheduledAt,
                    accountId: selectedAccount,
                    status: publishNow ? "published" : (scheduling.schedule ? "scheduled" : "draft")
                };

                const result = await savePinterestPost(postData);

                if (result.success) {
                    toast.success(scheduling.schedule ? "Pin scheduled!" : "Pin saved!");
                    onSuccess?.();
                } else {
                    toast.error(result.message || "Failed to save pin");
                }
            } catch (error) {
                toast.error(error.message);
            }
        });
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 lg:p-8 space-y-6 lg:space-y-10">
                    {/* Account Selection */}
                    <div className="space-y-3 px-2">
                        <div className="flex items-center gap-2 opacity-50">
                            <PinterestLogo className="h-2.5 w-2.5" />
                            <h3 className="text-[9px] font-black text-gray-900 uppercase tracking-[0.3em]"> Channel Selection </h3>
                        </div>
                        <div className="flex flex-wrap gap-5 items-center">
                            {accounts.map((acc) => {
                                const isSelected = selectedAccount === acc.accountId;
                                return (
                                    <div key={acc.id} onClick={() => !isReadOnly && setSelectedAccount(acc.accountId)} className={cn("group relative cursor-pointer transition-all duration-300 flex items-center justify-center rounded-full border p-1 bg-white", isSelected ? "border-[#E60023] bg-white shadow-xl shadow-red-50" : "w-12 h-12 border-gray-100 opacity-60 hover:opacity-100 scale-95 hover:scale-100", isReadOnly && "cursor-default opacity-100")}>
                                        <div className="w-10 h-10 relative">
                                            <div className={cn("w-full h-full rounded-full bg-[#E60023] p-[2.5px]", isSelected && "animate-spin-slow shadow-[0_0_15px_rgba(230,0,35,0.1)]")}>
                                                <div className="w-full h-full rounded-full bg-white p-[2px]">
                                                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black overflow-hidden shadow-inner">
                                                        {acc.profilePicture ? <img src={acc.profilePicture} alt="" className="w-full h-full object-cover" /> : acc.username?.charAt(0)}
                                                    </div>
                                                </div>
                                            </div>
                                            {isSelected && <div className="absolute -top-1 -right-1 bg-[#E60023] text-white rounded-full p-1.5 border-2 border-white shadow-md"><Check className="h-2 w-2 stroke-[3]" /></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 lg:gap-10 items-start">
                        {/* Editor */}
                        <div className="space-y-6">
                            {/* Strategy / Scheduling */}
                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-red-50 rounded-lg"><Clock className="h-3.5 w-3.5 text-[#E60023]" /></div>
                                        <h3 className="text-[11px] font-black text-gray-900 leading-none tracking-widest uppercase">Smart Scheduler</h3>
                                    </div>
                                    <Switch disabled={isReadOnly} checked={scheduling.schedule} onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))} className="data-[state=checked]:bg-[#E60023] scale-75" />
                                </div>
                                {scheduling.schedule && (
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button disabled={isReadOnly} variant="outline" className="w-full h-9 rounded-xl text-[10px] uppercase font-black justify-start px-3 tracking-widest leading-none border-gray-100 hover:bg-gray-50">
                                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-[#E60023]" /> {scheduling.date ? format(scheduling.date, "MMM dd, yyyy") : "Date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-0 rounded-3xl overflow-hidden shadow-2xl" align="start">
                                                <Calendar mode="single" selected={scheduling.date} onSelect={(date) => date && setScheduling(prev => ({ ...prev, date }))} disabled={{ before: new Date() }} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <Input disabled={isReadOnly} type="time" value={scheduling.time} onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value }))} className="h-9 rounded-xl text-xs font-bold border-gray-100 bg-gray-50/20 px-3" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Target Board</Label>
                                            <Select value={selectedBoard} onValueChange={setSelectedBoard} disabled={isReadOnly}>
                                                <SelectTrigger className="rounded-xl border-gray-100 h-10 shadow-sm">
                                                    <SelectValue placeholder="Select Board" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    {boards.map((board) => (
                                                        <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Destination Link</Label>
                                            <Input
                                                disabled={isReadOnly}
                                                placeholder="https://..."
                                                value={link}
                                                onChange={(e) => setLink(e.target.value)}
                                                className="rounded-xl border-gray-100 h-10 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Pin Title</Label>
                                        <Input
                                            disabled={isReadOnly}
                                            placeholder="Add your title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="rounded-xl border-gray-100 h-10 shadow-sm font-bold text-gray-900"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Description</Label>
                                        <Textarea
                                            disabled={isReadOnly}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell everyone what your Pin is about..."
                                            className="rounded-xl border-gray-100 bg-gray-50/10 p-4 font-sans text-[14px] text-gray-800 leading-relaxed min-h-[120px] focus:bg-white transition-all shadow-inner"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Image URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                disabled={isReadOnly}
                                                placeholder="https://example.com/image.jpg"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                className="rounded-xl border-gray-100 h-10 shadow-sm"
                                            />
                                            <Button variant="outline" className="h-10 rounded-xl px-3 border-gray-100 hover:bg-gray-50">
                                                <ImageIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="lg:sticky top-0">
                            <PinterestPreview
                                title={title}
                                description={message}
                                imageUrl={imageUrl}
                                accountName={accounts.find(a => a.accountId === selectedAccount)?.username || "Pinterest User"}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 px-8 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
                <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900" onClick={() => onSuccess?.()}>
                    {isReadOnly ? "Close" : "Cancel"}
                </Button>

                {isReadOnly && (
                    <>
                        <Button
                            variant="outline"
                            className="h-11 px-6 rounded-xl border-gray-100 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                            onClick={() => {
                                if (initialData?.pinterestPinId) window.open(`https://www.pinterest.com/pin/${initialData.pinterestPinId}`, '_blank');
                            }}
                        >
                            <Pin className="h-3.5 w-3.5 text-[#E60023]" />
                            View Pin
                        </Button>
                    </>
                )}

                {!isReadOnly && (
                    <Button
                        onClick={() => handleSubmit()}
                        disabled={isPending}
                        className="h-11 px-8 rounded-xl bg-[#E60023] hover:bg-[#ad001a] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-50 transition-all active:scale-95"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            scheduling.schedule ? (isEditing ? "Update Schedule" : "Schedule Pin") : (isEditing ? "Save Pin" : "Publish Now")
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
