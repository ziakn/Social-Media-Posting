'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, ChevronDown, User, CreditCard, LogOut } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { API_ROUTES } from '@/constants/api';
import { cn } from '@/lib/utils';

export default function Navbar({ user: initialUser }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [coinBalance, setCoinBalance] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();
        if (data.user) {
          setCoinBalance(data.user.coinBalance);
        }
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };
    fetchBalance();
  }, []);

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
        <h1 className="text-xl font-semibold tracking-tight">Portal</h1>
      </div>

      <div className="ml-auto flex items-center gap-4 relative">
        {/* Main Account Capsule */}
        <div className="flex items-center bg-white border-2 border-indigo-50 rounded-full p-1.5 shadow-md hover:shadow-lg hover:border-indigo-100 transition-all duration-300">

          {/* Enhanced Coin Section */}
          <div
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 rounded-full shadow-inner cursor-pointer hover:brightness-110 active:scale-95 transition-all text-white"
            onClick={() => router.push('/pricing')}
          >
            <Coins className="h-5 w-5 drop-shadow-sm animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black leading-none opacity-80 uppercase tracking-tighter">Total Coins</span>
              <span className="text-base font-extrabold leading-none drop-shadow-sm">
                {coinBalance !== null ? coinBalance : '...'}
              </span>
            </div>
          </div>

          {/* User Profile Section */}
          <div
            className="flex items-center gap-3 ml-3 cursor-pointer group pr-4"
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white ring-2 ring-white shadow-md group-hover:scale-105 transition-all duration-300">
              {initialUser?.name ? (
                <span className="text-base font-black tracking-tighter">
                  {initialUser.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-black text-gray-900 leading-none group-hover:text-indigo-600 transition-colors">
                {initialUser?.name || 'Loading user...'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Online</span>
              </div>
            </div>

            <ChevronDown
              size={16}
              className={cn("text-gray-400 group-hover:text-indigo-500 transition-all duration-300", showMenu && "rotate-180")}
            />
          </div>
        </div>

        {/* Improved Dropdown menu */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-90 duration-200 origin-top-right ring-1 ring-black/5">
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-1">Authenticated Account</p>
                <p className="text-lg font-black truncate">{initialUser?.name || 'Administrator'}</p>
                <p className="text-xs font-medium opacity-80 truncate mt-1">{initialUser?.email || 'admin@socialposting.com'}</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                <User size={80} />
              </div>
            </div>
            <div className="p-3 space-y-2">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-2xl transition-all group"
                onClick={() => { setShowMenu(false); router.push('/pricing'); }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                    <CreditCard className="h-4 w-4 text-amber-600" />
                  </div>
                  <span>Billing & Credits</span>
                </div>
                <div className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black rounded-lg uppercase shadow-sm group-hover:shadow-md">New!</div>
              </button>


              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all"
                onClick={() => { setShowMenu(false); router.push('/admin/settings'); }}
              >
                <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-slate-200">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <span>My Profile & Settings</span>
              </button>

              <div className="h-px bg-gray-100 mx-2" />

              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                onClick={handleLogout}
              >
                <div className="p-2 bg-red-50 rounded-xl group-hover:bg-red-100">
                  <LogOut className="h-4 w-4" />
                </div>
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
