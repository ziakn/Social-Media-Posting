"use client";

import { BarChart3, TrendingUp, PieChart, ArrowUpRight } from "lucide-react";

export default function AnalyticsDashboard() {
    return (
        <section className="py-20 bg-white font-inter">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F9C80E]/5 border border-[#F9C80E]/10">
                            <TrendingUp className="h-4 w-4 text-[#F9C80E]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0C1B33] font-plus-jakarta">Track Your Growth</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight leading-tight uppercase">
                            Simple <br /> <span className="text-[#3B82F6]">Performance Analytics</span>
                        </h2>
                        <p className="text-xl text-[#3E4652] font-medium leading-relaxed font-inter">
                            Stop jumping between different apps. SocialHub brings all your engagement data together, giving you a clear view of your growth and progress.
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div className="space-y-2">
                                <div className="text-3xl font-black text-[#0C1B33] font-plus-jakarta tracking-tighter">128%</div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Growth / Month</p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-3xl font-black text-[#0C1B33] font-plus-jakarta tracking-tighter">4.2M</div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Impressions Tracked</p>
                            </div>
                        </div>
                        <button className="bg-[#0C1B33] text-white font-black text-sm px-10 h-16 rounded-[6px] hover:bg-slate-800 transition-all font-plus-jakarta uppercase tracking-widest">
                            Explore Your Analytics
                        </button>
                    </div>

                    <div className="relative group lg:translate-x-12">
                        <div className="bg-slate-50 rounded-[12px] p-8 border border-slate-200 shadow-2xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 blur-[100px] pointer-events-none" />
                            <div className="flex justify-between items-center relative z-10">
                                <h4 className="font-black text-sm text-[#0C1B33] uppercase tracking-widest font-plus-jakarta">Growth Trajectory</h4>
                                <div className="flex items-center gap-2 text-[#27C93F] font-black text-xs font-plus-jakarta">
                                    <ArrowUpRight className="h-4 w-4" /> +24%
                                </div>
                            </div>

                            {/* Mock Graph */}
                            <div className="h-48 flex items-end gap-3 relative z-10">
                                {[40, 60, 45, 80, 55, 90, 75, 100].map((h, i) => (
                                    <div key={i} className="flex-1 bg-[#3B82F6]/20 rounded-t-sm group-hover:bg-[#3B82F6] transition-all duration-500" style={{ height: `${h}%` }} />
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="p-4 bg-white rounded-lg border border-slate-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#0C1B33] flex items-center justify-center text-[#F9C80E]">
                                        <PieChart className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                                        <span className="text-xs font-black text-[#0C1B33]">98.2%</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-slate-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#3B82F6] flex items-center justify-center text-white">
                                        <BarChart3 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Reports</span>
                                        <span className="text-xs font-black text-[#0C1B33]">Weekly JSON</span>
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
