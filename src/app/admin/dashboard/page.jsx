"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Image,
  Globe,
  AlertTriangle,
  RefreshCcw
} from "lucide-react";
import { KpiCard } from "@/components/admin/dashboard/KpiCard";
import { PlatformStatus } from "@/components/admin/dashboard/PlatformStatus";
import { ActivityFeed } from "@/components/admin/dashboard/ActivityFeed";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";

export default function DashboardPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulating live Polling/Websocket
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      // Here you would trigger a re-fetch of SWR/React Query data
    }, 30000); // 30 sec refresh

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col space-y-6">
      {/* Dashboard Top Header - Contextual */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Console</h1>
          <p className="text-muted-foreground">System Overview & Health Status</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white px-3 py-1 rounded-md border shadow-sm">
          <RefreshCcw className="h-3 w-3 animate-spin" style={{ animationDuration: "3s" }} />
          Live Updates: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* 1. KPI Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Users"
          value="1,240"
          icon={Users}
          trend="up"
          trendValue="+12% from last month"
        />
        <KpiCard
          title="Media Items"
          value="3,422"
          icon={Image}
          description="2.4GB Used"
        />
        <KpiCard
          title="Connected Platforms"
          value="4/12"
          icon={Globe}
          trend="neutral"
          trendValue="Stable"
        />
        <KpiCard
          title="Pending Warnings"
          value="3"
          icon={AlertTriangle}
          trend="down"
          trendValue="Needs Attention"
          className="border-yellow-200 bg-yellow-50/50"
        />
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {/* Left Column (Wide) */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          {/* Platform Status */}
          <PlatformStatus />

          {/* Maybe a Chart here later */}
        </div>

        {/* Right Column (Narrow) */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <QuickActions />

          {/* Activity Stream */}
          <ActivityFeed />
        </div>
      </div>

      {/* 3. Bottom Row - System Health or More Logs */}
      {/* For now, Activity Feed covers logs, so we fit it in the grid above for better density */}
    </div>
  );
}
