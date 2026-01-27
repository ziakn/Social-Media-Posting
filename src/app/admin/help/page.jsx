"use client";

import React, { useState, useEffect } from "react";
import { TicketList } from "@/components/support/TicketList";
import { CreateTicketModal } from "@/components/support/CreateTicketModal";
import { TicketDetail } from "@/components/support/TicketDetail";

export default function HelpPage() {
    const [view, setView] = useState("list"); // 'list' | 'detail'
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/user/me");
                const data = await res.json();
                if (data.user) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, []);

    const handleSelectTicket = (ticket) => {
        setSelectedTicketId(ticket.id);
        setView("detail");
    };

    const handleTicketCreated = (ticketId) => {
        setSelectedTicketId(ticketId);
        setView("detail");
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
                <p className="text-muted-foreground">
                    Need assistance? Explore our documentation or reach out to our support team.
                </p>
            </div>

            <div className="grid gap-6">
                {view === "list" ? (
                    <TicketList
                        onSelectTicket={handleSelectTicket}
                        onCreateTicket={() => setCreateModalOpen(true)}
                    />
                ) : (
                    <TicketDetail
                        ticketId={selectedTicketId}
                        onBack={() => setView("list")}
                        currentUserRole={user?.role}
                    />
                )}
            </div>

            <CreateTicketModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                onSuccess={handleTicketCreated}
            />
        </div>
    );
}
