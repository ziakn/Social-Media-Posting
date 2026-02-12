import Link from "next/link";
import {
    Briefcase, Users, Star, Sparkles, MapPin, Clock,
    ArrowRight, Heart, Brain, Zap, Shield, Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CareersPage() {
    const jobs = [
        {
            title: "Senior AI Engineer",
            dept: "Engineering",
            location: "Remote",
            type: "Full-time",
            icon: <Brain className="h-5 w-5 text-purple-400" />
        },
        {
            title: "Product Growth Expert",
            dept: "Marketing",
            location: "Remote / Hybrid",
            type: "Full-time",
            icon: <Zap className="h-5 w-5 text-amber-400" />
        },
        {
            title: "Senior Product Designer",
            dept: "Design",
            location: "Remote",
            type: "Full-time",
            icon: <Star className="h-5 w-5 text-pink-400" />
        },
        {
            title: "Full Stack Developer",
            dept: "Engineering",
            location: "Remote",
            type: "Full-time",
            icon: <Shield className="h-5 w-5 text-blue-400" />
        }
    ];

    return (
        <main className="bg-white min-h-screen font-[420] text-slate-600">
            {/* 🚀 Hero Section */}
            <section className="pt-32 pb-24 bg-slate-900 text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-4 shadow-lg shadow-primary/5">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Join the Mission</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-[650] uppercase tracking-tighter leading-none mx-auto max-w-4xl">
                        Build the <br />
                        <span className="text-primary italic">Future.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        We're on a mission to democratize social distribution through AI. Join a global team of thinkers, builders, and creators.
                    </p>
                </div>
            </section>

            {/* 📋 Job Listings */}
            <section className="py-32 container mx-auto px-6 max-w-[1200px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20 border-b border-slate-100 pb-12">
                    <div className="space-y-4">
                        <Badge className="bg-primary/5 text-primary border-primary/10 uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-bold">Open Roles</Badge>
                        <h2 className="text-4xl font-[650] text-slate-900 uppercase tracking-tighter">Join Our Growing Team</h2>
                    </div>
                    <button className="text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
                        Filter by Department <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid gap-6">
                    {jobs.map((job, i) => (
                        <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 group flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200/60 shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    {job.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{job.title}</h3>
                                    <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
                                        <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {job.dept}</span>
                                        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge className="bg-slate-50 text-slate-500 border-slate-200 uppercase text-[9px] font-black tracking-widest px-3 py-1.5">
                                    {job.type}
                                </Badge>
                                <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500">
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🌈 Culture Section */}
            <section className="py-32 bg-slate-50/50 border-y border-slate-100 overflow-hidden">
                <div className="container mx-auto px-6 max-w-[1280px]">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-bold">Life at UNI.social</Badge>
                            <h2 className="text-4xl md:text-5xl font-[650] text-slate-900 uppercase tracking-tighter leading-none">
                                A Culture of <br />
                                <span className="text-emerald-500 italic">Autonomy.</span>
                            </h2>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed">
                                We believe in high-performance teams that operate with trust and radical transparency. Our work is remote-first, AI-native, and focused on outcome over output.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-8 pt-8">
                                {[
                                    { title: "Remote-First", icon: <Globe className="h-5 w-5 text-emerald-500" /> },
                                    { title: "Health & Wellness", icon: <Heart className="h-5 w-5 text-pink-500" /> },
                                    { title: "Unlimited Learning", icon: <Sparkles className="h-5 w-5 text-amber-500" /> },
                                    { title: "Equity & Ownership", icon: <Shield className="h-5 w-5 text-indigo-500" /> }
                                ].map((benefit, b) => (
                                    <div key={b} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">{benefit.icon}</div>
                                        <span className="font-bold text-slate-900 uppercase tracking-tight text-sm">{benefit.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full translate-x-1/2" />
                            <div className="relative grid grid-cols-2 gap-4">
                                <div className="space-y-4 pt-12">
                                    <div className="h-64 bg-slate-200 rounded-[32px] animate-pulse" />
                                    <div className="h-48 bg-slate-300 rounded-[32px] animate-pulse" />
                                </div>
                                <div className="space-y-4">
                                    <div className="h-48 bg-slate-300 rounded-[32px] animate-pulse" />
                                    <div className="h-64 bg-slate-200 rounded-[32px] animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🎯 Final CTA */}
            <section className="py-40 container mx-auto px-6 max-w-[1280px]">
                <div className="bg-slate-900 rounded-[40px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                    <Star className="h-16 w-16 text-primary mx-auto group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700" />
                    <h2 className="text-4xl md:text-6xl font-[650] tracking-tighter max-w-2xl mx-auto leading-tight uppercase">
                        Ready to <span className="text-primary italic">Lead?</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                        We're always looking for exceptional talent. If you don't see a role that fits but believe you can add value, reach out.
                    </p>
                    <div className="pt-4">
                        <Link href="mailto:careers@uni.social">
                            <button className="bg-white text-slate-900 font-bold text-lg px-12 h-20 rounded-full hover:bg-primary hover:text-white transition-all shadow-xl hover:-translate-y-1 uppercase tracking-widest flex items-center gap-2 mx-auto justify-center active:scale-95">
                                Send Open Application
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

export const metadata = {
    title: "Careers | UNI.social - Join the Future of Social Media Automation",
    description: "Explore remote career opportunities at UNI.social. We're looking for AI engineers, designers, and growth experts.",
};
