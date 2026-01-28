"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Image,
  Globe,
  AlertTriangle,
  RefreshCcw,
  FileText,
  Calendar,
  XCircle
} from "lucide-react";
import { KpiCard } from "@/components/admin/dashboard/KpiCard";
import { PlatformStatus } from "@/components/admin/dashboard/PlatformStatus";
import { ActivityFeed } from "@/components/admin/dashboard/ActivityFeed";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { Spinner } from "@/components/ui/spinner";
import { usePermissions } from "@/hooks/usePermissions";
import { getDashboardMetrics } from "@/app/actions/dashboard/dashboardActions";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, loading: authLoading } = usePermissions();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch dashboard metrics
  const fetchMetrics = async () => {
    try {
      const result = await getDashboardMetrics();

      if (result.success) {
        setMetrics(result.metrics);
        setIsAdmin(result.role === 'Administrator');
        setLastUpdated(new Date());
      } else {
        toast.error("Failed to load dashboard metrics");
      }
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      toast.error("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!authLoading && user) {
      fetchMetrics();
    }
  }, [authLoading, user]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000); // 30 sec refresh

    return () => clearInterval(interval);
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Dashboard Top Header - Contextual */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isAdmin ? "Admin Console" : `Welcome back, ${user?.name || 'User'}!`}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? "System Overview & Health Status" : "Your Dashboard Overview"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white px-3 py-1 rounded-md border shadow-sm">
          <RefreshCcw className="h-3 w-3 animate-spin" style={{ animationDuration: "3s" }} />
          Live Updates: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Metrics Row - Different for Admin vs User */}
      {isAdmin ? (
        <AdminKPIs metrics={metrics} />
      ) : (
        <UserKPIs metrics={metrics} />
      )}

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {/* Left Column (Wide) */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          {/* Platform Status */}
          <PlatformStatus platforms={metrics.platforms} isAdmin={isAdmin} />
        </div>

        {/* Right Column (Narrow) */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <QuickActions isAdmin={isAdmin} />

          {/* Activity Stream */}
          <ActivityFeed activities={metrics.activity} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}

// Admin KPI Cards
function AdminKPIs({ metrics }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total Users"
        value={metrics.users?.total?.toLocaleString() || "0"}
        icon={Users}
        trend={metrics.users?.trend || "neutral"}
        trendValue={metrics.users?.growth || "0%"}
      />
      <KpiCard
        title="Total Posts"
        value={metrics.posts?.total?.toLocaleString() || "0"}
        icon={FileText}
        trend={metrics.posts?.trend || "neutral"}
        trendValue={metrics.posts?.growth || "0%"}
      />
      <KpiCard
        title="Scheduled Posts"
        value={metrics.scheduled?.total?.toLocaleString() || "0"}
        icon={Calendar}
        trend={metrics.scheduled?.trend || "neutral"}
        description="Pending publication"
      />
      <KpiCard
        title="Failed Posts"
        value={metrics.failed?.total?.toLocaleString() || "0"}
        icon={AlertTriangle}
        trend={metrics.failed?.trend || "neutral"}
        trendValue={metrics.failed?.message || "Unknown"}
        className={metrics.failed?.total > 5 ? "border-yellow-200 bg-yellow-50/50" : ""}
      />
    </div>
  );
}

// User KPI Cards
function UserKPIs({ metrics }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="My Posts"
        value={metrics.posts?.total?.toLocaleString() || "0"}
        icon={FileText}
        description="Total published"
      />
      <KpiCard
        title="Scheduled"
        value={metrics.scheduled?.total?.toLocaleString() || "0"}
        icon={Calendar}
        description="Pending posts"
      />
      <KpiCard
        title="Media Library"
        value={metrics.media?.total?.toLocaleString() || "0"}
        icon={Image}
        description={metrics.media?.storage || "0 KB"}
      />
      <KpiCard
        title="Failed Posts"
        value={metrics.failed?.total?.toLocaleString() || "0"}
        icon={XCircle}
        description={metrics.failed?.message || "All good"}
        className={metrics.failed?.total > 0 ? "border-yellow-200 bg-yellow-50/50" : ""}
      />
    </div>
  );
}

