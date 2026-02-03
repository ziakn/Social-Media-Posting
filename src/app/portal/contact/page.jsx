"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { usePermissions } from '@/hooks/usePermissions';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, Trash2, Mail, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { getContactsAction, updateContactStatusAction, deleteContactAction } from "@/app/actions/contact/contactActions";

export default function ContactInquiriesList() {
    const { hasPermission } = usePermissions();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const data = await getContactsAction();
            if (data.success) {
                setContacts(data.contacts);
            } else {
                toast.error(data.error || "Failed to fetch inquiries");
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
            toast.error("Failed to fetch inquiries");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        toast("Are you sure you want to delete this inquiry?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        const data = await deleteContactAction(id);
                        if (data.success) {
                            setContacts((prev) => prev.filter((c) => c.id !== id));
                            toast.success(data.message || "Inquiry deleted successfully!");
                        } else {
                            throw new Error(data.error || "Failed to delete inquiry");
                        }
                    } catch (error) {
                        console.error("Error deleting inquiry:", error);
                        toast.error("Error deleting inquiry: " + error.message);
                    }
                },
            },
        });
    };

    const updateStatus = async (id, status) => {
        try {
            const data = await updateContactStatusAction(id, status);
            if (data.success) {
                setContacts((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, status } : c))
                );
                toast.success(data.message || `Marked as ${status}`);
            } else {
                toast.error(data.error || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 uppercase text-[10px] font-bold">Pending</Badge>;
            case "read":
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 uppercase text-[10px] font-bold">Read</Badge>;
            case "replied":
                return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 uppercase text-[10px] font-bold">Replied</Badge>;
            default:
                return <Badge variant="outline" className="uppercase text-[10px] font-bold">{status}</Badge>;
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">Contact Inquiries</h1>
                <p className="text-slate-500 font-medium">Manage and respond to customer inquiries from the public contact form.</p>
            </div>

            <Card className="shadow-subtle border-slate-100">
                <CardContent className="p-0">
                    {contacts.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <Mail className="h-8 w-8" />
                            </div>
                            <p className="font-medium">No inquiries found yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-500 py-4">Date</TableHead>
                                    <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-500 py-4">From</TableHead>
                                    <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-500 py-4">Subject</TableHead>
                                    <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-500 py-4">Status</TableHead>
                                    <TableHead className="text-right font-black uppercase tracking-widest text-[10px] text-slate-500 py-4">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contacts.map((contact) => (
                                    <TableRow key={contact.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <TableCell className="text-slate-500 text-sm font-medium">
                                            {contact.created_at ? format(new Date(contact.created_at), "MMM d, yyyy") : "—"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-extrabold text-[#0C1B33] text-sm">{contact.name}</span>
                                                <span className="text-xs text-slate-400 font-medium">{contact.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-[#0C1B33] text-sm truncate max-w-[200px]">
                                            {contact.subject}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(contact.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-9 w-9 p-0 hover:bg-[#3B82F6] hover:text-white transition-all"
                                                            onClick={() => {
                                                                setSelectedInquiry(contact);
                                                                if (contact.status === "pending") updateStatus(contact.id, "read");
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl bg-white border-none shadow-2xl p-8">
                                                        <DialogHeader className="space-y-4">
                                                            <div className="flex justify-between items-start">
                                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none uppercase text-[10px] font-black tracking-widest px-3 py-1">
                                                                    Inquiry Detail
                                                                </Badge>
                                                                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {contact.created_at ? format(new Date(contact.created_at), "PPP p") : "—"}
                                                                </span>
                                                            </div>
                                                            <DialogTitle className="text-2xl font-black text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">
                                                                {contact.subject}
                                                            </DialogTitle>
                                                        </DialogHeader>

                                                        <div className="mt-8 space-y-8">
                                                            <div className="grid grid-cols-2 gap-8">
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6]">Sender Name</label>
                                                                    <div className="flex items-center gap-2 text-[#0C1B33] font-bold">
                                                                        <User className="h-4 w-4 text-slate-400" />
                                                                        {contact.name}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6]">Email Address</label>
                                                                    <div className="flex items-center gap-2 text-[#0C1B33] font-bold">
                                                                        <Mail className="h-4 w-4 text-slate-400" />
                                                                        {contact.email}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6]">Message</label>
                                                                <div className="bg-slate-50 p-6 rounded-[10px] text-slate-600 leading-relaxed font-medium border border-slate-100">
                                                                    {contact.message}
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className={contact.status === 'replied' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                                                                        onClick={() => updateStatus(contact.id, "replied")}
                                                                    >
                                                                        Mark as Replied
                                                                    </Button>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        handleDelete(contact.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>

                                                {hasPermission('delete_contact') && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 transition-all"
                                                        onClick={() => handleDelete(contact.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
