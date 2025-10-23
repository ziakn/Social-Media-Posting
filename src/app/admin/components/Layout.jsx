"use client";
import "@/globals.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  Shield,
  Lock,
  Lightbulb,
  ListTodo,
  LogOut,
} from "lucide-react"; // icons for sidebar (optional)

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      router.replace("/firebase/auth/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/firebase/auth/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-primary">Firebase App</h2>
            <p className="text-sm text-gray-500 mt-1">
              Welcome, {user.name}
            </p>
          </div>

          <nav className="p-4 space-y-2">
            <SidebarLink
              href="/firebase/dashboard"
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
            />
            <SidebarLink
              href="/firebase/ideas"
              icon={<Lightbulb size={18} />}
              label="Ideas"
            />
            <SidebarLink
              href="/firebase/tasks"
              icon={<ListTodo size={18} />}
              label="Tasks"
            />
            <SidebarLink
              href="/firebase/users"
              icon={<Users size={18} />}
              label="Users"
            />
            <SidebarLink
              href="/firebase/roles"
              icon={<Shield size={18} />}
              label="Roles"
            />
            <SidebarLink
              href="/firebase/permissions"
              icon={<Lock size={18} />}
              label="Permissions"
            />
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Card className="p-6 shadow-sm">{children}</Card>
      </main>
    </div>
  );
}

/** Helper Sidebar Link Component */
function SidebarLink({ href, icon, label }) {
  const router = useRouter();
  const isActive = router?.pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive
          ? "bg-primary text-white"
          : "text-gray-700 hover:bg-gray-100 hover:text-primary"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
