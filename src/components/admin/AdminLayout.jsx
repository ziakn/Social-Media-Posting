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
} from "lucide-react";
import Navbar from "./Navbar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { label: "Dashboard", href: "/firebase/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Users", href: "/firebase/users", icon: <Users size={18} /> },
    { label: "Settings", href: "/firebase/settings", icon: <Settings size={18} /> },
  ];

  const handleToggle = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          sidebarOpen ? "w-64" : "w-16"
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
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 transition-colors hover:bg-gray-100 ${
                    sidebarOpen ? "justify-start" : "justify-center"
                  }`}
                >
                  {item.icon}
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          <Button
            variant="outline"
            className={`w-full flex items-center gap-2 ${
              sidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="text-sm font-sm">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
