"use client";

import { useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import UserDashboard from "@/components/admin/dashboard/UserDashboard";
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

  // Render Admin Dashboard for Administrators
  if (user?.role === 'Administrator') {
    return <AdminDashboard />;
  }

  // Render User Dashboard for regular users
  return <UserDashboard user={user} />;
}
