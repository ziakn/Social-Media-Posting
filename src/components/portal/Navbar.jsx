'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, User, CreditCard, LogOut, Lock } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { API_ROUTES } from '@/constants/api';
import { cn } from '@/lib/utils';

export default function Navbar({ user: initialUser }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);



  const handleLogout = async () => {
    try {
      await fetch(API_ROUTES.LOGOUT, { method: 'POST' });
      document.cookie = 'token=; path=/; max-age=0';
      router.push(ROUTES.PORTAL_LOGIN);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const menuItemClass = (isDanger = false) =>
    cn(
      "block w-full text-left px-4 py-2 text-sm rounded-md transition-colors",
      isDanger
        ? "text-red-600 hover:bg-red-100"
        : "text-gray-700 hover:bg-gray-100"
    );

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">SocialHub</h1>
      </div>

      <div className="ml-auto flex items-center gap-4 relative">
        {/* User Profile Section */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-sm hover:shadow transition-all gap-2">

          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-white shadow-sm hover:shadow transition-all">
              {initialUser?.name ? (
                <span className="text-sm font-bold">
                  {initialUser.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-semibold text-gray-900 leading-none group-hover:text-primary transition-colors">
                {initialUser?.name || 'Loading user...'}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">{initialUser?.role || 'Loading role...'}</span>
            </div>

            <ChevronDown
              size={16}
              className="text-gray-400 group-hover:text-primary transition-colors"
            />
          </div>
        </div>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="border-b border-gray-100 p-4 bg-gray-50">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account</p>
              <p className="text-sm font-semibold text-gray-900 truncate mt-1">{initialUser?.name || 'Administrator'}</p>
              <p className="text-xs text-gray-500 truncate">{initialUser?.email || 'hello@socialposting.com'}</p>
            </div>
            <div className="p-2 space-y-0.5">
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors group"
                onClick={() => { setShowMenu(false); router.push('/portal/settings?tab=profile'); }}
              >
                <User className="h-4 w-4 text-gray-500 group-hover:text-primary" />
                <span>Profile Settings</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors group"
                onClick={() => { setShowMenu(false); router.push('/portal/settings?tab=security'); }}
              >
                <Lock className="h-4 w-4 text-gray-500 group-hover:text-primary" />
                <span>Account Security</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors group"
                onClick={() => { setShowMenu(false); router.push('/pricing'); }}
              >
                <CreditCard className="h-4 w-4 text-gray-500 group-hover:text-primary" />
                <span>Billing & Subscriptions</span>
              </button>

              <div className="h-px bg-gray-100 my-1" />

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
