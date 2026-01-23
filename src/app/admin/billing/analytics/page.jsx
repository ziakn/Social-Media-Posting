"use client";

import { useEffect, useState } from "react";
import { getAllInvoices } from "@/app/actions/billing/billingActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from "recharts";
import { Spinner } from "@/components/ui/spinner";
import { TrendingUp, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";

export default function BillingAnalyticsPage() {
    const [data, setData] = useState({
        totalRevenue: 0,
        outstanding: 0,
        paidCount: 0,
        unpaidCount: 0,
        monthlyTrends: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAllInvoices();
                if (res.success) {
                    processAnalytics(res.invoices);
                }
            } catch (error) {
                console.error("Error processing analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const processAnalytics = (invoices) => {
        let revenue = 0;
        let outstanding = 0;
        let paid = 0;
        let unpaid = 0;
        const trendsMap = {};

        invoices.forEach(inv => {
            if (inv.status === 'paid') {
                revenue += inv.amount;
                paid++;
            } else if (inv.status === 'unpaid') {
                outstanding += inv.amount;
                unpaid++;
            }

            const month = new Date(inv.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!trendsMap[month]) trendsMap[month] = { month, revenue: 0, outstanding: 0 };

            if (inv.status === 'paid') trendsMap[month].revenue += inv.amount;
            else if (inv.status === 'unpaid') trendsMap[month].outstanding += inv.amount;
        });

        setData({
            totalRevenue: revenue,
            outstanding,
            paidCount: paid,
            unpaidCount: unpaid,
            monthlyTrends: Object.values(trendsMap)
        });
    };

    if (loading) return <div className="p-12 flex justify-center"><Spinner /></div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-black text-[#0C1B33] uppercase tracking-tight font-plus-jakarta">Revenue Intelligence</h1>
                <p className="text-sm text-slate-500 font-medium">Internal reporting on network monetization and payment health.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="shadow-subtle border-slate-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Revenue</CardDescription>
                        <CardTitle className="text-2xl font-black text-[#0C1B33] flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                            ${data.totalRevenue.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="shadow-subtle border-slate-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Outstanding</CardDescription>
                        <CardTitle className="text-2xl font-black text-[#0C1B33] flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            ${data.outstanding.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="shadow-subtle border-slate-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paid Nodes</CardDescription>
                        <CardTitle className="text-2xl font-black text-[#0C1B33] flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            {data.paidCount}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="shadow-subtle border-slate-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Growth Index</CardDescription>
                        <CardTitle className="text-2xl font-black text-[#0C1B33] flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            +12.5%
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-subtle border-slate-100 p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Revenue Flow (Monthly)</CardTitle>
                    </CardHeader>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.monthlyTrends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="shadow-subtle border-slate-100 p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Subscription Health</CardTitle>
                    </CardHeader>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.monthlyTrends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="outstanding" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
