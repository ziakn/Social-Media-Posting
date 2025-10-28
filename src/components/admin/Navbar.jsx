'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { API_ROUTES } from '@/constants/api';
import { cn } from '@/lib/utils';

export default function Navbar({ user }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(API_ROUTES.LOGOUT, { method: 'POST' });
      document.cookie = 'token=; path=/; max-age=0';
      router.push(ROUTES.ADMIN_LOGIN);
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
        <h1 className="text-xl font-semibold tracking-tight">Admin Panel</h1>
      </div>

      <div className="ml-auto flex items-center space-x-4 relative">
        {/* User name */}
        <div
          className="text-sm font-medium text-gray-700 cursor-pointer"
          onClick={() => setShowMenu(!showMenu)}
        >
          {user?.name || 'Admin User'}
        </div>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute right-0 mt-10 w-48 bg-white border rounded-md shadow-lg z-50">
            <button className={menuItemClass()} onClick={() => alert('Profile clicked')}>
              Profile
            </button>
            <button className={menuItemClass(true)} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
