"use strict";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Plus, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getTickets } from "@/app/actions/tickets/ticketActions";

const statusMap = {
    open: { label: "Open", variant: "destructive", icon: AlertCircle },
    "in-progress": { label: "In Progress", variant: "warning", icon: Clock },
    resolved: { label: "Resolved", variant: "success", icon: CheckCircle2 },
    closed: { label: "Closed", variant: "secondary", icon: CheckCircle2 },
};

const priorityMap = {
    low: { label: "Low", variant: "outline" },
    medium: { label: "Medium", variant: "warning" },
    high: { label: "High", variant: "destructive" },
};

export function TicketList({ onSelectTicket, onCreateTicket }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        try {
            const data = await getTickets();
            if (data.success) {
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Loading tickets...</div>;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xl font-bold">Support Tickets</CardTitle>
                    <CardDescription>
                        Manage your support requests and conversations.
                    </CardDescription>
                </div>
                <Button onClick={onCreateTicket} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Ticket
                </Button>
            </CardHeader>
            <CardContent>
                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold">No tickets found</h3>
                        <p className="text-sm text-muted-foreground">
                            You haven't created any support tickets yet.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.map((ticket) => {
                                const status = statusMap[ticket.status] || statusMap.open;
                                const priority = priorityMap[ticket.priority] || priorityMap.low;

                                return (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{ticket.subject}</span>
                                                <span className="text-xs text-muted-foreground">#{ticket.id.slice(-6)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={status.variant} className="gap-1">
                                                <status.icon className="h-3 w-3" />
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={priority.variant}>{priority.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {ticket.lastMessageAt
                                                ? formatDistanceToNow(new Date(ticket.lastMessageAt), { addSuffix: true })
                                                : "Unknown"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onSelectTicket(ticket)}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
