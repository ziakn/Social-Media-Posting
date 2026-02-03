"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar, CheckCircle2, AlertTriangle, Link2, Send, Clock, TrendingUp, Zap
} from "lucide-react";
import { KpiCard } from "@/components/portal/dashboard/KpiCard";
import { getDashboardMetrics } from "@/app/actions/dashboard/dashboardActions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformStatus } from "@/components/portal/dashboard/PlatformStatus";
import { ActivityFeed } from "@/components/portal/dashboard/ActivityFeed";
import { QuickActions } from "@/components/portal/dashboard/QuickActions";

export default function UserDashboard({ user }) {
    const router = useRouter();
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

        // Refresh every 60 seconds
        const interval = setInterval(fetchMetrics, 60000);
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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
                    </h1>
                    <p className="text-muted-foreground">Here's what's happening with your content</p>
                </div>
                <Badge variant="outline" className="text-sm">
                    {metrics?.subscriptionPlan || "Free Plan"}
                </Badge>
            </div>

            {/* KPI Metrics Row - Personal Data */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Scheduled Posts"
                    value={metrics?.scheduled?.total?.toString() || "0"}
                    icon={Calendar}
                    description="Awaiting publish"
                />
                <KpiCard
                    title="Published"
                    value={(metrics?.posts?.total - (metrics?.scheduled?.total || 0) - (metrics?.failed?.total || 0))?.toString() || "0"}
                    icon={CheckCircle2}
                    trend="up"
                    trendValue="Delivered"
                    className="border-green-100"
                />
                <KpiCard
                    title="Failed"
                    value={metrics?.failed?.total?.toString() || "0"}
                    icon={AlertTriangle}
                    trend={metrics?.failed?.total > 0 ? "down" : "up"}
                    trendValue={metrics?.failed?.message || "All clear"}
                    className={metrics?.failed?.total > 0 ? "border-red-100 bg-red-50/30" : ""}
                />
                <KpiCard
                    title="Connected Accounts"
                    value={metrics?.platforms?.length?.toString() || "0"}
                    icon={Link2}
                    description="Social platforms"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                {/* Left Column (Wide) */}
                <div className="col-span-1 lg:col-span-2 space-y-4">
                    <PlatformStatus platforms={metrics?.platforms} isAdmin={false} />
                </div>

                {/* Right Column (Narrow) */}
                <div className="space-y-4">
                    <QuickActions isAdmin={false} />
                    <ActivityFeed activities={metrics?.activity} isAdmin={false} />
                </div>
            </div>

            {/* Activity Summary */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Posts Summary */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Content Overview
                        </CardTitle>
                        <CardDescription>Your posting activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Posts</span>
                                <span className="font-semibold">{metrics?.posts?.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Published</span>
                                <span className="font-semibold text-green-600">{(metrics?.posts?.total - (metrics?.scheduled?.total || 0) - (metrics?.failed?.total || 0)) || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Scheduled</span>
                                <span className="font-semibold text-blue-600">{metrics?.scheduled?.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Failed</span>
                                <span className="font-semibold text-red-600">{metrics?.failed?.total || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Status */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Your Plan
                        </CardTitle>
                        <CardDescription>Subscription details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Current Plan</span>
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                    {metrics?.subscriptionPlan || "Free Plan"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Status</span>
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                    {(metrics?.subscription?.status === 'active') ? 'Active' : 'Free'}
                                </Badge>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full mt-2"
                                onClick={() => router.push('/portal/subscription')}
                            >
                                Manage Subscription
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
