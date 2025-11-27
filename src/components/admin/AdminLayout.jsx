"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Waypoints,
  Spotlight,
  Link2,
  Image,
} from "lucide-react";
import Navbar from "./Navbar";
import { usePermissions } from "@/hooks/usePermissions";
import { ROUTES } from "@/constants/routes";
import { API_ROUTES } from "@/constants/api";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, permissions, hasPermission } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggle = () => setSidebarOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await fetch(API_ROUTES.LOGOUT, { method: 'POST' });
      document.cookie = 'token=; path=/; max-age=0';
      router.push(ROUTES.ADMIN_LOGIN);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${sidebarOpen ? "w-64" : "w-16"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-gray-200">
          {sidebarOpen && (
            <span className="font-semibold text-lg text-gray-800">Admin</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="ml-auto"
          >
            {sidebarOpen ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 mt-3">
          <ul className="space-y-1">
            {/* Dashboard is always visible */}
            {hasPermission('view_dashboard') && (

              <li key={ROUTES.ADMIN_DASHBOARD}>
                <Link
                  href={ROUTES.ADMIN_DASHBOARD}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 transition-colors hover:bg-gray-100 ${sidebarOpen ? "justify-start" : "justify-center"
                    }`}
                >
                  <LayoutDashboard size={18} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">Dashboard</span>
                  )}
                </Link>
              </li>
            )}
            {/* Users - permission based */}
            {hasPermission('view_users') && (
              <li key={ROUTES.ADMIN_USER}>
                <Link
                  href={ROUTES.ADMIN_USER}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 transition-colors hover:bg-gray-100 ${sidebarOpen ? "justify-start" : "justify-center"
                    }`}
                >
                  <Users size={18} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">Users</span>
                  )}
                </Link>
              </li>
            )}
            {/* Roles - permission based */}
            {hasPermission('view_roles') && (
              <li key={ROUTES.ADMIN_ROLE}>
                <Link
                  href={ROUTES.ADMIN_ROLE}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 transition-colors hover:bg-gray-100 ${sidebarOpen ? "justify-start" : "justify-center"
                    }`}
                >
                  <Waypoints size={18} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">Roles</span>
                  )}
                </Link>
              </li>
            )}
            {/* Permissions - permission based */}
            {hasPermission('view_permissions') && (
              <li key={ROUTES.ADMIN_PERMISSION}>
                <Link
                  href={ROUTES.ADMIN_PERMISSION}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 transition-colors hover:bg-gray-100 ${sidebarOpen ? "justify-start" : "justify-center"
                    }`}
                >
                  <Spotlight size={18} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">Permissions</span>
                  )}
                </Link>
              </li>
            )}



            {/* Gallery */}
            {hasPermission('view_gallery') && (
              <li key={ROUTES.ADMIN_GALLERY}>
                <Link
                  href={ROUTES.ADMIN_GALLERY}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 transition-colors hover:bg-gray-100 ${sidebarOpen ? "justify-start" : "justify-center"
                    }`}
                >
                  <Image size={18} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">Gallery</span>
                  )}
                </Link>
              </li>
            )}

            {/* Settings - permission based */}

            {hasPermission('view_connect') && (
              <li key="/admin/social/connect">
                <Link
                  href="/admin/social/connect"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 transition-colors hover:bg-gray-100 ${sidebarOpen ? "justify-start" : "justify-center"
                    }`}
                >
                  <Link2 size={18} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">Connect</span>
                  )}
                </Link>
              </li>
            )}
            {hasPermission('view_settings') && (
              <li key="/admin/settings">
                <Link
                  href="/admin/settings"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 transition-colors hover:bg-gray-100 ${sidebarOpen ? "justify-start" : "justify-center"
                    }`}
                >
                  <Settings size={18} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">Settings</span>
                  )}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          <Button
            variant="outline"
            className={`w-full flex items-center gap-2 ${sidebarOpen ? "justify-start" : "justify-center"
              }`}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar user={user} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
