"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import Navbar from "./Navbar";
import { usePermissions } from "@/hooks/usePermissions";

export default function AdminLayout({ children }) {
  const { user } = usePermissions();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <Navbar user={user} />
        <main className="flex-1 p-6 overflow-auto bg-gray-50/50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
