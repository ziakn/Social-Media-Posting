// src/components/admin/tiktok/TiktokPreview.jsx
"use client";

import React from 'react';
import { Heart, MessageCircle, Share2, Music2, User } from 'lucide-react';

export default function TiktokPreview({ content = {}, account = {} }) {
    const { text = "", media = [] } = content;
    const videoUrl = media[0]?.url;

    return (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 min-h-[500px]">
            <div className="relative w-[320px] h-[640px] bg-black rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-gray-900 pointer-events-none select-none">
                {/* Status Bar */}
                <div className="absolute top-0 w-full h-12 flex justify-between items-center px-10 z-30">
                    <span className="text-white text-[13px] font-bold">9:41</span>
                    <div className="flex gap-1.5 items-center">
                        <div className="w-5 h-2.5 bg-white/20 rounded-sm border border-white/50 relative">
                            <div className="absolute left-0 top-0 h-full w-[80%] bg-white rounded-sm" />
                        </div>
                    </div>
                </div>

                {/* Top Tabs */}
                <div className="absolute top-10 w-full flex justify-center items-center gap-6 z-20">
                    <span className="text-white/60 text-[13px] font-bold hover:text-white transition-colors">Following</span>
                    <div className="relative">
                        <span className="text-white text-[13px] font-bold">For You</span>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
                    </div>
                </div>

                {/* Content Area */}
                <div className="relative w-full h-full">
                    {videoUrl ? (
                        <video
                            src={videoUrl}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-b from-gray-800 to-black flex flex-col items-center justify-center gap-4 px-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-700/50 flex items-center justify-center animate-pulse">
                                <User className="w-10 h-10 text-gray-500" />
                            </div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Preview Placeholder</p>
                        </div>
                    )}

                    {/* Overlay UI */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
                        {/* Right Sidebar Actions */}
                        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
                            {/* Avatar with Plus */}
                            <div className="relative mb-2">
                                <div className="w-12 h-12 bg-gray-800 rounded-full border-2 border-white overflow-hidden shadow-lg">
                                    <img src={account.profilePicture || `https://i.pravatar.cc/150?u=${account.id}`} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#FE2C55] rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">+</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <Heart className="w-9 h-9 text-white fill-white shadow-sm" />
                                </div>
                                <span className="text-white text-[11px] font-bold shadow-sm">
                                    {content.metrics?.likes ? (content.metrics.likes >= 1000 ? (content.metrics.likes / 1000).toFixed(1) + 'K' : content.metrics.likes) : '0'}
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <MessageCircle className="w-9 h-9 text-white fill-white shadow-sm" />
                                </div>
                                <span className="text-white text-[11px] font-bold shadow-sm">
                                    {content.metrics?.comments ? (content.metrics.comments >= 1000 ? (content.metrics.comments / 1000).toFixed(1) + 'K' : content.metrics.comments) : '0'}
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <Share2 className="w-9 h-9 text-white fill-white shadow-sm" />
                                </div>
                                <span className="text-white text-[11px] font-bold shadow-sm">
                                    {content.metrics?.shares ? (content.metrics.shares >= 1000 ? (content.metrics.shares / 1000).toFixed(1) + 'K' : content.metrics.shares) : '0'}
                                </span>
                            </div>

                            {/* Rotating Disc */}
                            <div className="mt-4 w-12 h-12 bg-gray-900 rounded-full border-[8px] border-gray-800 flex items-center justify-center animate-spin-slow">
                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-700 to-gray-400 overflow-hidden">
                                    <img src={account.profilePicture} className="w-full h-full object-cover opacity-50" alt="" />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-10 left-4 right-16 space-y-3">
                            <div>
                                <h3 className="text-white font-bold text-sm tracking-tight">@{account.username || 'username'}</h3>
                                <p className="text-white text-[13px] line-clamp-3 mt-1.5 leading-snug font-medium pr-4">
                                    {text || "Your caption will appear here... #tiktok #viral"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 max-w-full">
                                <div className="flex bg-white/10 backdrop-blur-md rounded-full px-2 py-1 items-center gap-2 overflow-hidden max-w-[180px]">
                                    <Music2 className="w-3 h-3 text-white shrink-0" />
                                    <p className="text-white text-[11px] font-bold whitespace-nowrap animate-marquee">
                                        Original Audio - {account.username || 'username'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 w-full flex justify-center pb-2">
                    <div className="w-32 h-1 bg-white/40 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
