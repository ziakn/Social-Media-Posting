import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CreditCard,
  Coins,
} from "lucide-react";
 
export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
 
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  const menuItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Users", href: "/admin/users", icon: <Users size={18} /> },
    { label: "Pricing", href: "/pricing", icon: <CreditCard size={18} /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
  ];

  const handleToggle = () => setSidebarOpen((prev) => !prev);

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        sidebarOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-3 border-b border-gray-200">
        {sidebarOpen && <span className="font-semibold text-lg text-gray-800">Admin</span>}
        <Button variant="ghost" size="icon" onClick={handleToggle}>
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
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
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            </li>
          ))}
          {user && (
            <li className="px-3 py-2">
              <div className={`flex items-center gap-3 text-indigo-600 ${sidebarOpen ? "justify-start" : "justify-center"}`}>
                <Coins size={18} />
                {sidebarOpen && (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Balance</span>
                    <span className="text-sm font-bold">{user.coinBalance} Coins</span>
                  </div>
                )}
              </div>
            </li>
          )}
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
  );
}
