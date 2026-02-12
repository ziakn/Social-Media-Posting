"use client";

import { BarChart3, TrendingUp, PieChart, ArrowUpRight } from "lucide-react";

export default function AnalyticsDashboard() {
    return (
        <section className="py-24 relative overflow-hidden font-sans">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="grid lg:grid-cols-2 gap-24 items-center">

                    {/* Left Content */}
                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px]">
                            <TrendingUp className="h-4 w-4 text-[#5e4a7a]" />
                            <span className="text-[0.8rem] font-bold uppercase tracking-widest text-[#5e4a7a]">Track Your Growth</span>
                        </div>
                        <h2 className="text-3xl md:text-[2.8rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[1.15]">
                            Simple <br /> <span className="text-[#5e4a7a]">Performance Analytics</span>
                        </h2>
                        <p className="text-[1.1rem] text-[#4a3d58] font-[420] leading-relaxed">
                            Stop jumping between different apps. SocialHub brings all your engagement data together, giving you a clear view of your growth and progress.
                        </p>

                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div className="space-y-1 relative pl-6 border-l-2 border-[#5e4a7a]/20">
                                <div className="text-4xl font-[700] text-[#2d253b] tracking-tight">128%</div>
                                <div className="text-[0.8rem] font-bold text-[#6f5b8b] uppercase tracking-widest leading-tight">Avg Growth / Month</div>
                            </div>
                            <div className="space-y-1 relative pl-6 border-l-2 border-[#5e4a7a]/20">
                                <div className="text-4xl font-[700] text-[#2d253b] tracking-tight">4.2M</div>
                                <div className="text-[0.8rem] font-bold text-[#6f5b8b] uppercase tracking-widest leading-tight">Impressions Tracked</div>
                            </div>
                        </div>

                        <button className="bg-[#2d253b] text-white font-medium text-[0.95rem] px-8 py-4 rounded-[40px] hover:bg-[#3f3155] transition-all shadow-lg shadow-[#2d253b]/10 hover:shadow-[#2d253b]/20 flex items-center gap-2">
                            Explore Your Analytics <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Right Visual - Glassmorphism Card */}
                    <div className="relative group lg:translate-x-12">
                        <div className="bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] rounded-[40px] p-8 border border-[rgba(255,255,255,0.6)] shadow-2xl space-y-8 relative overflow-hidden group hover:bg-[rgba(255,255,255,0.5)] transition-all duration-500">

                            {/* Decorative Background Blur */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5e4a7a]/5 blur-[80px] pointer-events-none" />

                            <div className="flex justify-between items-center relative z-10">
                                <h4 className="font-bold text-sm text-[#5e4a7a] uppercase tracking-widest">Growth Trajectory</h4>
                                <div className="flex items-center gap-2 text-[#27C93F] font-bold text-xs bg-[#27C93F]/10 px-2 py-1 rounded-md">
                                    <ArrowUpRight className="h-3.5 w-3.5" /> +24%
                                </div>
                            </div>

                            {/* Mock Graph - Purple Theme */}
                            <div className="h-48 flex items-end gap-3 relative z-10 px-2">
                                {[40, 60, 45, 80, 55, 90, 75, 100].map((h, i) => (
                                    <div key={i} className="flex-1 bg-gradient-to-t from-[#5e4a7a]/40 to-[#5e4a7a]/10 rounded-t-[6px] group-hover:from-[#5e4a7a] group-hover:to-[#8a76a6] transition-all duration-500 relative group/bar" style={{ height: `${h}%` }}>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#2d253b] text-white text-[9px] py-0.5 px-1.5 rounded-[4px] opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                            {h * 124}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-[24px] border border-white/60 flex items-center gap-4 transition-transform hover:scale-105">
                                    <div className="w-10 h-10 rounded-[12px] bg-[#2d253b] flex items-center justify-center text-[#F9C80E] shadow-md">
                                        <PieChart className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[0.65rem] font-bold text-[#6f5b8b] uppercase tracking-widest">Efficiency</span>
                                        <span className="text-sm font-bold text-[#2d253b]">98.2%</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-[24px] border border-white/60 flex items-center gap-4 transition-transform hover:scale-105">
                                    <div className="w-10 h-10 rounded-[12px] bg-[#5e4a7a] flex items-center justify-center text-white shadow-md">
                                        <BarChart3 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[0.65rem] font-bold text-[#6f5b8b] uppercase tracking-widest">Reports</span>
                                        <span className="text-sm font-bold text-[#2d253b]">Weekly JSON</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
