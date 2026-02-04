'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, User, CreditCard, LogOut, Lock, LayoutGrid, Facebook, Instagram, Linkedin, MessageCircle, Twitter, Send, MessageSquare, Youtube } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { API_ROUTES } from '@/constants/api';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getConnectedAccounts } from '@/app/actions/social/getConnectedAccounts';
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";
import PinterestLogo from "@/components/icons/PinterestLogo";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";
import { TiktokLogo } from "@/components/icons/TiktokLogo";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  twitter: Twitter,
  telegram: Send,
  bluesky: BlueSkyLogo,
  reddit: MessageSquare,
  threads: ThreadsLogo,
  tiktok: TiktokLogo,
  youtube: Youtube,
  pinterest: PinterestLogo,
};

const ICON_COLORS = {
  facebook: "text-[#1877F2]",
  instagram: "text-[#E4405F]",
  twitter: "text-[#000000]",
  linkedin: "text-[#0A66C2]",
  whatsapp: "text-[#25D366]",
  threads: "text-black",
  telegram: "text-[#0088cc]",
  bluesky: "text-[#0085ff]",
  reddit: "text-[#FF4500]",
  tiktok: "text-[#000000]",
  youtube: "text-[#FF0000]",
  pinterest: "text-[#E60023]",
};

export default function Navbar({ user: initialUser }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const result = await getConnectedAccounts();
      if (result.success) {
        setConnectedPlatforms(result.data);
      }
    };
    fetchAccounts();
  }, []);

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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm justify-between">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 hidden sm:block">SocialHub</h1>
      </div>

      {/* Spacer if needed, or remove completely */}
      <div className="flex-1" />


      <div className="ml-auto flex items-center gap-4 relative">
        {/* App Launcher - Right Aligned */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              title="Connected Apps"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[320px] p-3 shadow-xl border-gray-100">
            <div className="px-2 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-50 flex justify-between items-center">
              <span>Connected Platforms</span>
              <span className="text-xs font-normal text-primary hover:underline cursor-pointer" onClick={() => router.push(ROUTES.PORTAL_SOCIAL_CONNECT)}>Manage</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {connectedPlatforms.length > 0 ? (
                connectedPlatforms.map(platform => {
                  const Icon = ICONS[platform];
                  // Same route logic as desktop
                  let targetRoute = ROUTES[`PORTAL_${platform.toUpperCase()}_POSTS`];
                  if (!targetRoute) targetRoute = ROUTES[`PORTAL_${platform.toUpperCase()}`];
                  if (!targetRoute) targetRoute = `/portal/social/${platform}`;

                  return (
                    <DropdownMenuItem
                      key={platform}
                      className="flex flex-col items-center justify-center p-3 cursor-pointer rounded-xl hover:bg-gray-50 transition-colors focus:bg-gray-50 outline-none h-24 border border-transparent hover:border-gray-100"
                      onClick={() => router.push(targetRoute)}
                    >
                      {Icon ? (
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <Icon className={cn("w-5 h-5", ICON_COLORS[platform])} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 mb-2" />
                      )}
                      <span className="text-[11px] font-medium capitalize text-center leading-tight text-gray-700">{platform}</span>
                    </DropdownMenuItem>
                  )
                })
              ) : (
                <div className="col-span-3 text-center py-10 text-sm text-muted-foreground bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="font-medium text-gray-900 mb-1">No apps connected</p>
                  <p className="text-xs mb-3">Connect your social accounts to get started.</p>
                  <button
                    className="text-xs bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                    onClick={() => router.push(ROUTES.PORTAL_SOCIAL_CONNECT)}
                  >
                    Connect Accounts
                  </button>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

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
