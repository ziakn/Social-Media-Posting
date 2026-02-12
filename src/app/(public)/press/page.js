

import Link from "next/link";
import {
    Newspaper,
    Download,
    Mail,
    Phone,
    Share2,
    Image,
    FileText,
    ArrowRight,
    Camera,
    Video,
    Mic2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PressPage() {
    const pressKits = [
        {
            title: "Brand Assets",
            desc: "Logos, color palettes, and brand guidelines for high-quality media use.",
            icon: <Image className="h-6 w-6" />,
            count: "12 Assets"
        },
        {
            title: "Product Images",
            desc: "High-resolution screenshots and product photography of the UNI.social ecosystem.",
            icon: <Camera className="h-6 w-6" />,
            count: "24 Photos"
        },
        {
            title: "Company Profile",
            desc: "Background information, stats, and vision statement of UNI.social.",
            icon: <FileText className="h-6 w-6" />,
            count: "PDF, 8 Pages"
        }
    ];

    const pressReleases = [
        {
            date: "Feb 12, 2026",
            title: "UNI.social Surpasses 1M AI-Synchronized Posts Across Multi-Cloud Infrastructure",
            link: "#"
        },
        {
            date: "Jan 15, 2026",
            title: "Announcing UNI.social v4.0: The Future of Decentralized Social Media Distribution",
            link: "#"
        },
        {
            date: "Dec 10, 2025",
            title: "UNI.social Closes $15M Series A to Expand AI Native Social Media Automation",
            link: "#"
        }
    ];

    return (
        <main className="bg-white min-h-screen font-[420] text-slate-600">
            {/* 🚀 Hero Section */}
            <section className="pt-32 pb-24 bg-slate-900 text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Media Hub</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-[650] uppercase tracking-tighter leading-none mx-auto max-w-4xl">
                        UNI.social <br />
                        <span className="text-primary italic">Press & Media.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Access our latest news, official brand assets, and contact our media relations team. We're here to share the story of UNI.social.
                    </p>
                </div>
            </section>

            {/* 📋 Press Kits */}
            <section className="py-32 container mx-auto px-6 max-w-[1280px]">
                <div className="text-center mb-20 space-y-4">
                    <Badge className="bg-primary/5 text-primary border-primary/10 uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-bold">Resources</Badge>
                    <h2 className="text-4xl md:text-5xl font-[650] text-slate-900 uppercase tracking-tighter">Official Media Kits</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-10">
                    {pressKits.map((kit, i) => (
                        <div key={i} className="bg-white/40 backdrop-blur-md p-10 rounded-3xl border border-slate-200/60 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 group flex flex-col justify-between h-full">
                            <div className="space-y-6">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-slate-200/60 shadow-sm">{kit.icon}</div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-[650] text-slate-900 uppercase tracking-tight">{kit.title}</h3>
                                    <p className="text-base text-slate-500 font-medium leading-relaxed">{kit.desc}</p>
                                </div>
                            </div>
                            <div className="pt-8 flex items-center justify-between border-t border-slate-100 mt-8">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{kit.count}</span>
                                <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-primary transition-colors">
                                    <Download className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 📰 Latest News */}
            <section className="py-32 bg-slate-50/50 border-y border-slate-100">
                <div className="container mx-auto px-6 max-w-[1000px]">
                    <div className="text-center mb-20 space-y-4">
                        <Badge className="bg-primary/5 text-primary border-primary/10 uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-bold">Newsroom</Badge>
                        <h2 className="text-4xl md:text-5xl font-[650] text-slate-900 uppercase tracking-tighter">Recent Releases</h2>
                    </div>
                    <div className="grid gap-6">
                        {pressReleases.map((release, idx) => (
                            <Link key={idx} href={release.link} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 group flex items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{release.date}</span>
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">{release.title}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-slate-200/60">
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 📞 Contact */}
            <section className="py-40 container mx-auto px-6 max-w-[1280px]">
                <div className="bg-slate-900 rounded-[40px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                    <h2 className="text-4xl md:text-6xl font-[650] tracking-tighter max-w-2xl mx-auto leading-tight uppercase">
                        Media <span className="text-primary italic">Inquiries.</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                        For interview requests, exclusive data reports, or platform insights, please contact our media relations department.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-8 justify-center items-center font-bold tracking-widest uppercase text-sm">
                        <a href="mailto:press@uni.social" className="flex items-center gap-3 text-white hover:text-primary transition-colors">
                            <Mail className="h-5 w-5" /> press@uni.social
                        </a>
                        <a href="tel:+1234567890" className="flex items-center gap-3 text-white hover:text-primary transition-colors">
                            <Phone className="h-5 w-5" /> +1 (234) 567-890
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}

export const metadata = {
    title: "Press & Media | UNI.social - Latest News & Brand Assets",
    description: "Access official UNI.social press releases, brand kits, and media assets. Contact our PR team for inquiries.",
};
