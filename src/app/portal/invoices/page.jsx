"use client";

import { useEffect, useState, useCallback } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { getBillingProfile, getPaginatedInvoices } from "@/app/actions/billing/billingActions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Download, FileText, AlertCircle, CheckCircle2, Clock, ChevronDown, Search, ExternalLink } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { toast } from "sonner";
import debounce from "lodash/debounce";

export default function InvoicesPage() {
    const { user } = usePermissions();
    const [profile, setProfile] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [nextCursor, setNextCursor] = useState(null);

    useEffect(() => {
        if (user?.id) {
            fetchBillingData();
        }
    }, [user]);

    // Debounced search handler
    const debouncedSearch = useCallback(
        debounce((query) => {
            fetchInvoices(query, true);
        }, 500),
        [user]
    );

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const fetchInvoices = async (query = "", reset = false) => {
        if (!user?.id) return;

        try {
            if (reset) {
                setLoading(true); // Show loading state when searching/resetting
                setInvoices([]);
            }

            const res = await getPaginatedInvoices(10, null, query);

            if (res.success) {
                setInvoices(res.invoices);
                setHasMore(res.hasMore);
                setNextCursor(res.nextCursor);
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    const fetchBillingData = async () => {
        try {
            setLoading(true);
            const [profileRes, invoicesRes] = await Promise.all([
                getBillingProfile(user.id),
                getPaginatedInvoices(10)
            ]);

            if (profileRes.success) setProfile(profileRes.profile);

            if (invoicesRes.success) {
                setInvoices(invoicesRes.invoices);
                setHasMore(invoicesRes.hasMore);
                setNextCursor(invoicesRes.nextCursor);
            }
        } catch (error) {
            console.error("Error fetching billing data:", error);
            toast.error("Failed to load billing information");
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        if (!hasMore || loadingMore) return;

        try {
            setLoadingMore(true);
            // Use the nextCursor returned from the server
            const res = await getPaginatedInvoices(10, nextCursor, searchQuery);

            if (res.success) {
                setInvoices(prev => [...prev, ...res.invoices]);
                setHasMore(res.hasMore);
                setNextCursor(res.nextCursor);
            }
        } catch (error) {
            console.error("Error loading more invoices:", error);
            toast.error("Failed to load more invoices");
        } finally {
            setLoadingMore(false);
        }
    };

    const exportInvoicesToCSV = () => {
        if (invoices.length === 0) return;

        const headers = ["Invoice ID", "Date", "Status", "Amount", "Currency"];
        const rows = invoices.map(inv => [
            inv.invoiceId,
            new Date(inv.createdAt).toLocaleDateString(),
            inv.status,
            inv.amount,
            inv.currency
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `invoices_${user.id}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 uppercase text-[10px] font-bold"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</Badge>;
            case "unpaid":
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 uppercase text-[10px] font-bold"><Clock className="w-3 h-3 mr-1" /> Unpaid</Badge>;
            default:
                return <Badge variant="outline" className="uppercase text-[10px] font-bold">{status}</Badge>;
        }
    };

    if (loading && !invoices.length && !profile) return <div className="p-12 flex justify-center"><Spinner /></div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-black text-[#0C1B33] uppercase tracking-tight font-plus-jakarta">Billing & Ledger</h1>
                <p className="text-sm text-slate-500 font-medium">Manage your subscription, view payment history, and download invoices.</p>
            </div>

            {/* Billing Profile Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-subtle border-slate-100">
                    <CardHeader className="pb-3 text-slate-400">
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Protocol</CardDescription>
                        <CardTitle className="text-xl font-black text-[#0C1B33] flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                            {profile?.packageName || "Free Protocol"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                            {profile?.billingCycle === 'monthly' ? 'Billed Monthly' : 'Billed Annually'}
                        </p>
                        <p className="text-sm font-black text-[#0C1B33] mt-1">${profile?.amount}/{profile?.billingCycle === 'monthly' ? 'mo' : 'yr'}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-subtle border-slate-100">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Status</CardDescription>
                        <CardTitle className="text-xl font-black text-[#0C1B33] flex items-center gap-2">
                            {profile?.status === 'active' ? (
                                <><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Protocol OK</>
                            ) : (
                                <><AlertCircle className="w-5 h-5 text-amber-500" /> Attention Needed</>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Status</p>
                        <p className={`text-sm font-black mt-1 uppercase ${profile?.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {profile?.status || "Free"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-subtle border-slate-100">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Synchronization</CardDescription>
                        <CardTitle className="text-xl font-black text-[#0C1B33] flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            {profile?.nextBillingDate ? new Date(profile.nextBillingDate).toLocaleDateString() : 'N/A'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Recurring on</p>
                        <p className="text-sm font-black text-[#0C1B33] mt-1">Automatic Renewal</p>
                    </CardContent>
                </Card>
            </div>

            {/* Invoices Table */}
            <Card className="shadow-subtle border-slate-100 overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/50 flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Transaction History
                    </CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search Invoice ID..."
                            className="h-9 pl-9 text-xs font-medium"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && invoices.length === 0 ? (
                        <div className="p-12 flex justify-center"><Spinner /></div>
                    ) : invoices.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                            {searchQuery ? "No matching invoices found." : "No ledger entries found."}
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader className="bg-slate-50/30">
                                    <TableRow>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Invoice Node</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Protocol</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-bold text-slate-700">
                                                {invoice.invoiceId}
                                            </TableCell>
                                            <TableCell className="text-xs font-medium text-slate-500">
                                                {new Date(invoice.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(invoice.status)}
                                            </TableCell>
                                            <TableCell className="font-black text-slate-900">
                                                ${invoice.amount} {invoice.currency}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600">
                                                    {invoice.pdfUrl ? (
                                                        <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                                            View Invoice <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    ) : (
                                                        <Link href={`/portal/invoices/${invoice.id}`}>
                                                            View Statement
                                                        </Link>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {hasMore && (
                                <div className="p-4 flex justify-center border-t border-slate-50 bg-slate-50/30">
                                    <Button
                                        variant="outline"
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="text-xs font-bold uppercase tracking-widest gap-2"
                                    >
                                        {loadingMore ? <Spinner className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        Load More Transactions
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> All transactions are secured and auditable.
                </p>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest gap-2"
                        onClick={exportInvoicesToCSV}
                    >
                        <Download className="w-3.5 h-3.5" /> Export Ledger (CSV)
                    </Button>
                </div>
            </div>
        </div>
    );
}
