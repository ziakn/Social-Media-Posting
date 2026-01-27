"use strict";

import React, { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    ArrowLeft,
    Send,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    getTicketDetails,
    sendTicketMessage,
    updateTicketStatus
} from "@/app/actions/tickets/ticketActions";

const statusMap = {
    open: { label: "Open", variant: "destructive", icon: AlertCircle },
    "in-progress": { label: "In Progress", variant: "warning", icon: Clock },
    resolved: { label: "Resolved", variant: "success", icon: CheckCircle2 },
    closed: { label: "Closed", variant: "secondary", icon: CheckCircle2 },
};

export function TicketDetail({ ticketId, onBack, currentUserRole }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    const fetchTicketDetails = async () => {
        try {
            const result = await getTicketDetails(ticketId);
            if (result.success) {
                setData(result);
            }
        } catch (error) {
            console.error("Error fetching ticket details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketDetails();
    }, [ticketId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [data?.messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            const result = await sendTicketMessage(ticketId, message);
            if (result.success) {
                setMessage("");
                fetchTicketDetails();
            } else {
                toast.error(result.error || "Failed to send message");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSending(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            const result = await updateTicketStatus(ticketId, newStatus);
            if (result.success) {
                toast.success(`Status updated to ${newStatus}`);
                fetchTicketDetails();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading ticket details...</div>;
    if (!data) return <div className="p-8 text-center text-destructive">Ticket not found</div>;

    const { ticket, messages } = data;
    const status = statusMap[ticket.status] || statusMap.open;
    const isAdmin = currentUserRole === "Administrator";

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Tickets
                </Button>
                <div className="flex items-center gap-2">
                    {/* Admin Actions */}
                    {isAdmin && (
                        <>
                            {ticket.status !== "resolved" && ticket.status !== "closed" && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleUpdateStatus("resolved")}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Resolve
                                </Button>
                            )}
                            {ticket.status !== "closed" && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleUpdateStatus("closed")}
                                >
                                    Close Ticket
                                </Button>
                            )}
                            {(ticket.status === "resolved" || ticket.status === "closed") && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateStatus("open")}
                                >
                                    Re-open Ticket
                                </Button>
                            )}
                        </>
                    )}

                    {/* Regular User Actions */}
                    {!isAdmin && (
                        <>
                            {(ticket.status === "open" || ticket.status === "in-progress") && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateStatus("resolved")}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                    Mark as Solved
                                </Button>
                            )}
                            {(ticket.status === "resolved" || ticket.status === "closed") && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateStatus("open")}
                                >
                                    I still need help (Re-open)
                                </Button>
                            )}
                        </>
                    )}

                    {/* Global Admin Status Dropdown */}
                    {isAdmin && (
                        <div className="flex items-center gap-2 ml-4 border-l pl-4">
                            <span className="text-sm font-medium">Status:</span>
                            <Select
                                value={ticket.status}
                                onValueChange={handleUpdateStatus}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">{ticket.subject}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Started by {ticket.userName} • {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                        <Badge variant={status.variant} className="gap-1">
                            <status.icon className="h-3 w-3" />
                            {status.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 max-h-[500px] overflow-y-auto p-6 bg-slate-50/50">
                    {messages.map((msg, index) => {
                        if (msg.isSystem) {
                            return (
                                <div key={msg.id} className="flex justify-center my-2">
                                    <div className="bg-slate-200/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest px-4 py-1 rounded-full border border-slate-300/30">
                                        SYSTEM: {msg.message} • {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                    </div>
                                </div>
                            );
                        }

                        const isStaff = msg.userRole === "Administrator";

                        return (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${isStaff ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className={isStaff ? "bg-primary text-primary-foreground" : "bg-muted shadow-inner"}>
                                        {msg.userName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={`flex flex-col gap-1 max-w-[80%] ${isStaff ? "items-end" : "items-start"}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-600">{msg.userName}</span>
                                        {isStaff && <Badge variant="outline" className="text-[9px] py-0 h-4 uppercase tracking-tighter font-black border-indigo-200 bg-indigo-50 text-indigo-700">Official Support</Badge>}
                                        <span className="text-[10px] text-muted-foreground uppercase opacity-70">
                                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm leading-relaxed ${isStaff
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-white border border-slate-200 rounded-tl-none text-slate-700"
                                        }`}>
                                        {msg.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </CardContent>
                <CardFooter className="p-4 border-t">
                    {ticket.status === "closed" ? (
                        <div className="w-full text-center py-2 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                            This ticket is closed. Re-open it if you need further assistance.
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                            <Textarea
                                placeholder="Type your reply..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="min-h-[80px] resize-none"
                            />
                            <Button type="submit" disabled={sending || !message.trim()} className="mt-auto h-10 w-10 p-0 rounded-full">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    )}
                </CardFooter>
            </Card>
            {ticket.status === "resolved" && (
                <div className="flex justify-center">
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus("closed")}>
                        Mark as Closed
                    </Button>
                </div>
            )}
        </div>
    );
}
