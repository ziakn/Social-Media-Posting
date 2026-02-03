"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
    Printer,
    ChevronLeft,
    Building2,
    Mail,
    Globe,
    Download,
    CheckCircle2,
    Clock
} from "lucide-react";
import Link from "next/link";

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const snap = await getDoc(doc(db, "invoices", id));
                if (snap.exists()) {
                    setInvoice({ id: snap.id, ...snap.data() });
                }
            } catch (error) {
                console.error("Error fetching invoice:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-12 flex justify-center"><Spinner /></div>;
    if (!invoice) return <div className="p-12 text-center font-bold">Invoice Node not found.</div>;

    const isPaid = invoice.status === 'paid';

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-center print:hidden">
                <Button variant="ghost" size="sm" asChild className="text-[10px] font-black uppercase tracking-widest gap-2">
                    <Link href="/portal/invoices">
                        <ChevronLeft className="w-3.5 h-3.5" /> Back to History
                    </Link>
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={handlePrint} className="text-[10px] font-black uppercase tracking-widest gap-2">
                        <Printer className="w-3.5 h-3.5" /> Print Invoice
                    </Button>
                    {!isPaid && (
                        <Button variant="secondary" size="sm" className="bg-[#F9C80E] hover:bg-[#eac00d] text-[#0C1B33] text-[10px] font-black uppercase tracking-widest">
                            Authorize Payment
                        </Button>
                    )}
                </div>
            </div>

            <Card className="shadow-subtle border-slate-100 overflow-hidden print:shadow-none print:border-none">
                <CardContent className="p-12 space-y-12">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0C1B33] rounded-lg flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-[#F9C80E]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[#0C1B33] uppercase tracking-tighter">SocialHub</h2>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enterprise Network</p>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 space-y-0.5 uppercase tracking-tight">
                                <p>{invoice.sellerInfo?.address || "123 Digital Plaza, Silicon Oasis"}</p>
                                <p>{invoice.sellerInfo?.city || "Dubai, United Arab Emirates"}</p>
                                <p>VAT: {invoice.sellerInfo?.vatId || "AE123456789"}</p>
                                <p>TAX ID: {invoice.sellerInfo?.taxId || "TAX-GLOBAL-001"}</p>
                            </div>
                        </div>

                        <div className="text-right space-y-2">
                            <h1 className="text-4xl font-black text-[#0C1B33] uppercase">Invoice</h1>
                            <p className="text-sm font-black text-slate-400">{invoice.invoiceId}</p>
                            <Badge className={isPaid ? "bg-emerald-100 text-emerald-700 uppercase" : "bg-amber-100 text-amber-700 uppercase"}>
                                {isPaid ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                {invoice.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-12 border-y border-slate-100 py-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Bill To</p>
                            <div className="text-xs font-bold text-[#0C1B33] space-y-1 uppercase tracking-tight">
                                <p className="text-sm font-black">{invoice.userName || "Subscriber Name"}</p>
                                <p className="text-slate-500">{invoice.userEmail || "user@example.com"}</p>
                                <p className="text-slate-500">{invoice.userCountry || "United Arab Emirates"}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Issue Date</p>
                                <p className="text-xs font-black text-[#0C1B33]">{invoice.createdAt?.toDate ? invoice.createdAt.toDate().toLocaleDateString() : new Date(invoice.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Due Date</p>
                                <p className="text-xs font-black text-[#0C1B33]">{invoice.dueDate?.toDate ? invoice.dueDate.toDate().toLocaleDateString() : new Date(invoice.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div className="col-span-2 pt-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Billing Period</p>
                                <p className="text-xs font-black text-[#0C1B33]">
                                    {invoice.billingPeriodStart?.toDate ? invoice.billingPeriodStart.toDate().toLocaleDateString() : new Date(invoice.billingPeriodStart).toLocaleDateString()} — {invoice.billingPeriodEnd?.toDate ? invoice.billingPeriodEnd.toDate().toLocaleDateString() : new Date(invoice.billingPeriodEnd).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-6">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                    <th className="text-center py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Qty</th>
                                    <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                                    <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.lineItems?.map((item, idx) => (
                                    <tr key={idx} className="border-b border-slate-50">
                                        <td className="py-6 pr-4">
                                            <p className="text-sm font-black text-[#0C1B33] uppercase">{item.description}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                                                {item.amount < 0 ? 'Adjustment for plan migration.' : 'Full access to all multi-platform scheduling protocols.'}
                                            </p>
                                        </td>
                                        <td className="text-center py-6 text-sm font-bold text-slate-600">{item.quantity}</td>
                                        <td className="text-right py-6 text-sm font-bold text-slate-600">
                                            {item.amount < 0 ? `- $${Math.abs(item.amount)}` : `$${item.amount}`}
                                        </td>
                                        <td className="text-right py-6 text-sm font-black text-[#0C1B33]">
                                            {item.amount < 0 ? `- $${Math.abs(item.amount * item.quantity)}` : `$${item.amount * item.quantity}`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span>${invoice.lineItems?.reduce((acc, i) => acc + (i.amount * i.quantity), 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <span>Tax (0.00%)</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-slate-200">
                                <span className="text-sm font-black text-[#0C1B33] uppercase">Total Amount</span>
                                <span className="text-lg font-black text-[#0C1B33]">${invoice.amount} {invoice.currency}</span>
                            </div>
                            {invoice.status === 'unpaid' && (
                                <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest text-right">Payment due by {invoice.dueDate?.toDate ? invoice.dueDate.toDate().toLocaleDateString() : new Date(invoice.dueDate).toLocaleDateString()}</p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-24 text-center space-y-4">
                        <div className="flex justify-center gap-8">
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                <Mail className="w-3 h-3" /> support@socialhub.ai
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                <Globe className="w-3 h-3" /> www.socialhub.ai
                            </div>
                        </div>
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.3em]">Thank you for your business. Powered by SocialHub Enterprise.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
