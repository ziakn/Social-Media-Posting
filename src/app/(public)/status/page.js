

import Link from "next/link";
import { CheckCircle2, AlertCircle, Clock, Zap, Server, Globe, Database, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StatusPage() {
    const systems = [
        { name: "Core API", status: "operational", icon: <Server className="h-5 w-5" /> },
        { name: "Admin Portal", status: "operational", icon: <ShieldCheck className="h-5 w-5" /> },
        { name: "Background Workers", status: "operational", icon: <Zap className="h-5 w-5" /> },
        { name: "Database Cluster", status: "operational", icon: <Database className="h-5 w-5" /> },
        { name: "Media Processing", status: "operational", icon: <Globe className="h-5 w-5" /> },
        { name: "Edge Caching", status: "operational", icon: <Clock className="h-5 w-5" /> }
    ];

    return (
        <main className="bg-white min-h-screen font-[420] text-slate-600">
            {/* 🚀 Hero Section */}
            <section className="pt-32 pb-24 bg-slate-900 text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-lg shadow-emerald-500/5">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">All Systems Operational</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-[650] uppercase tracking-tighter leading-none mx-auto max-w-4xl">
                        System <br />
                        <span className="text-primary italic">Status.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Real-time updates on our global infrastructure and platform performance. We maintain a high standard of reliability for your social growth.
                    </p>
                </div>
            </section>

            {/* 📋 Systems Grid */}
            <section className="py-32 container mx-auto px-6 max-w-[1000px]">
                <div className="grid md:grid-cols-2 gap-6">
                    {systems.map((s, i) => (
                        <div key={i} className="bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 group flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-slate-200/60 shadow-sm">
                                    {s.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{s.name}</h3>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Operational</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 📈 History */}
            <section className="py-32 bg-slate-50/50 border-y border-slate-100">
                <div className="container mx-auto px-6 max-w-[800px]">
                    <div className="text-center mb-16 space-y-4">
                        <Badge className="bg-primary/5 text-primary border-primary/10 uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-bold">Uptime</Badge>
                        <h2 className="text-3xl font-[650] text-slate-900 uppercase tracking-tighter">Last 90 Days</h2>
                    </div>
                    <div className="space-y-12">
                        {[
                            { date: "Feb 2026", uptime: "99.99%", incidents: 0 },
                            { date: "Jan 2026", uptime: "99.98%", incidents: 1 },
                            { date: "Dec 2025", uptime: "100%", incidents: 0 }
                        ].map((m, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8 last:border-0 last:pb-0">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-bold text-slate-900">{m.date}</h4>
                                    <p className="text-sm font-medium text-slate-400">{m.incidents} Incidents Reported</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-2 w-48 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                                        <div className="h-full bg-emerald-500 w-full" />
                                    </div>
                                    <span className="text-lg font-bold text-emerald-600">{m.uptime}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 🎯 Support CTA */}
            <section className="py-40 container mx-auto px-6 max-w-[1280px]">
                <div className="bg-slate-900 rounded-[40px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                    <AlertCircle className="h-16 w-16 text-primary mx-auto group-hover:scale-110 transition-transform duration-700" />
                    <h2 className="text-4xl md:text-6xl font-[650] tracking-tighter max-w-2xl mx-auto leading-tight uppercase">
                        Experience an <span className="text-primary italic">Issue?</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                        If you're noticing an issue that isn't reflected here, please report it to our technical support team immediately.
                    </p>
                    <div className="pt-4">
                        <Link href="/help">
                            <button className="bg-white text-slate-900 font-bold text-lg px-12 h-20 rounded-full hover:bg-primary hover:text-white transition-all shadow-xl hover:-translate-y-1 uppercase tracking-widest flex items-center gap-2 mx-auto justify-center active:scale-95">
                                Contact Support
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

export const metadata = {
    title: "System Status | UNI.social - Real-time Performance Monitoring",
    description: "Check the real-time status of UNI.social services, including our API, background workers, and global edge network.",
};
