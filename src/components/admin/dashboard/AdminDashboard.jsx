"use client";

import { useEffect, useState } from "react";
import {
    Users, Image, Globe, AlertTriangle, Calendar, CheckCircle2, Clock, TrendingUp
} from "lucide-react";
import { KpiCard } from "@/components/admin/dashboard/KpiCard";
import { PlatformStatus } from "@/components/admin/dashboard/PlatformStatus";
import { ActivityFeed } from "@/components/admin/dashboard/ActivityFeed";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { getDashboardMetrics } from "@/app/actions/dashboard/dashboardActions";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            const res = await getDashboardMetrics();
            if (res.success) {
                setMetrics(res.metrics);
            }
            setLoading(false);
        }
        fetchMetrics();

        // Refresh every 30 seconds
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-28 rounded-md" />
                    ))}
                </div>
                <Skeleton className="h-64 rounded-md" />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Console</h1>
                    <p className="text-muted-foreground">System Overview & Health Status</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white px-3 py-1.5 rounded-md border shadow-sm">
                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live Updates
                </div>
            </div>

            {/* KPI Metrics Row - Real Data */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Total Users"
                    value={metrics?.users?.total?.toLocaleString() || "0"}
                    icon={Users}
                    trend={metrics?.users?.trend || "up"}
                    trendValue={metrics?.users?.growth || "+0%"}
                />
                <KpiCard
                    title="Scheduled Posts"
                    value={metrics?.scheduled?.total?.toLocaleString() || "0"}
                    icon={Calendar}
                    description="Awaiting publish"
                />
                <KpiCard
                    title="Connected Platforms"
                    value={`${metrics?.platforms?.filter(p => p.status !== 'disconnected')?.length || 0}/9`}
                    icon={Globe}
                    trend="neutral"
                    trendValue="Active"
                />
                <KpiCard
                    title="Failed Posts"
                    value={metrics?.failed?.total?.toLocaleString() || "0"}
                    icon={AlertTriangle}
                    trend={metrics?.failed?.total > 0 ? "down" : "up"}
                    trendValue={metrics?.failed?.message || "All Clear"}
                    className={metrics?.failed?.total > 0 ? "border-yellow-200 bg-yellow-50/50" : ""}
                />
            </div>

            {/* Second Row - More Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <KpiCard
                    title="Total Posts"
                    value={metrics?.posts?.total?.toLocaleString() || "0"}
                    icon={CheckCircle2}
                    description="All platforms"
                />
                <KpiCard
                    title="Media Items"
                    value={metrics?.media?.total?.toLocaleString() || "0"}
                    icon={Image}
                    description={metrics?.media?.storage || "0 GB"}
                />
                <KpiCard
                    title="System Status"
                    value="Operational"
                    icon={Clock}
                    trend="up"
                    trendValue="All systems normal"
                    className="border-green-200 bg-green-50/50"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                {/* Left Column (Wide) */}
                <div className="col-span-1 lg:col-span-2 space-y-4">
                    <PlatformStatus platforms={metrics?.platforms} isAdmin={true} />
                </div>

                {/* Right Column (Narrow) */}
                <div className="space-y-4">
                    <QuickActions isAdmin={true} />
                    <ActivityFeed activities={metrics?.activity} isAdmin={true} />
                </div>
            </div>
        </div>
    );
}
