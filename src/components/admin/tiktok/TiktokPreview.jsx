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
                <div className="absolute top-0 w-full h-8 flex justify-between items-center px-8 z-20">
                    <span className="text-white text-xs font-bold">9:41</span>
                    <div className="flex gap-1.5">
                        <div className="w-4 h-2 bg-white rounded-full opacity-40"></div>
                        <div className="w-4 h-2 bg-white rounded-full"></div>
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
                            <div className="w-20 h-20 rounded-full bg-gray-700/50 flex items-center justify-center">
                                <User className="w-10 h-10 text-gray-500" />
                            </div>
                            <p className="text-gray-400 text-sm italic">Video preview will appear here</p>
                        </div>
                    )}

                    {/* Overlay UI */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
                        {/* Right Sidebar Actions */}
                        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                                    <Heart className="w-7 h-7 text-white fill-white" />
                                </div>
                                <span className="text-white text-[10px] font-bold">12.5K</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                                    <MessageCircle className="w-7 h-7 text-white fill-white" />
                                </div>
                                <span className="text-white text-[10px] font-bold">842</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                                    <Share2 className="w-7 h-7 text-white fill-white" />
                                </div>
                                <span className="text-white text-[10px] font-bold">1.2K</span>
                            </div>
                            <div className="w-11 h-11 bg-black rounded-full border-2 border-white/20 overflow-hidden mt-2">
                                <img src={account.profilePicture || `https://i.pravatar.cc/150?u=${account.id}`} className="w-full h-full object-cover" alt="" />
                            </div>
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-6 left-4 right-16 space-y-3">
                            <div>
                                <h3 className="text-white font-bold text-base">@{account.username || 'username'}</h3>
                                <p className="text-white text-sm line-clamp-3 mt-1 leading-snug">
                                    {text || "Your caption will appear here..."}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Music2 className="w-4 h-4 text-white animate-spin-slow" />
                                <div className="overflow-hidden whitespace-nowrap">
                                    <p className="text-white text-xs font-medium animate-marquee">
                                        Original Audio - {account.username || 'username'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-1 w-full flex justify-center pb-2">
                    <div className="w-24 h-1 bg-white/50 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
