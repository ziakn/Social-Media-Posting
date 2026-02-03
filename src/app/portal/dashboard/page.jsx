"use client";

import { useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import PortalDashboard from "@/components/portal/dashboard/PortalDashboard";
import UserDashboard from "@/components/portal/dashboard/UserDashboard";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardPage() {
  const { user, loading } = usePermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner />
      </div>
    );
  }

  if (user?.role === 'Administrator') {
    return <PortalDashboard />;
  }

  // Render User Dashboard for regular users
  return <UserDashboard user={user} />;
}
