

import Link from "next/link";
import {
    Code2,
    BookOpen,
    Cpu,
    Zap,
    Terminal,
    Key,
    Lock,
    Webhook,
    ArrowRight,
    Github,
    Layers,
    Server,
    Database,
    Cloud
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DevelopersPage() {
    const resources = [
        {
            title: "API Reference",
            desc: "Complete documentation for our REST and GraphQL APIs. Manage accounts and media programmatically.",
            icon: <Code2 className="h-6 w-6" />,
            link: "#"
        },
        {
            title: "SDKs & Libraries",
            desc: "Official libraries for Node.js, Python, and Ruby to jumpstart your integration with UNI.social.",
            icon: <Layers className="h-6 w-6" />,
            link: "#"
        },
        {
            title: "Webhooks",
            desc: "Real-time notifications for post status changes, analytics updates, and account events.",
            icon: <Webhook className="h-6 w-6" />,
            link: "#"
        }
    ];

    const codeSnippet = `// Initialize UNI.social Client
const unisocial = require('@unisocial/sdk');
const client = new unisocial.Client({
  apiKey: process.env.UNISOCIAL_API_KEY
});

// Create a cross-platform post
const post = await client.posts.create({
  platforms: ['tiktok', 'instagram', 'pinterest'],
  content: 'Building the future with UNI.social SDK 🚀',
  media: ['https://assets.uni.social/hero.mp4']
});

console.log('Post synchronized:', post.id);`;

    return (
        <main className="bg-white min-h-screen font-[420] text-slate-600">
            {/* 🚀 Hero Section */}
            <section className="pt-32 pb-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                <Terminal className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Developer Ecosystem</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-[650] uppercase tracking-tighter leading-none">
                                Built for <br />
                                <span className="text-primary italic">Engineers.</span>
                            </h1>
                            <p className="text-xl text-slate-400 font-medium leading-relaxed">
                                Scalable, secure, and developer-friendly. Integrate UNI.social's AI-driven distribution engine into your own applications with our powerful APIs.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <button className="bg-primary text-white font-bold h-16 px-10 rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
                                    Read API Docs <ArrowRight className="h-5 w-5" />
                                </button>
                                <button className="border-2 border-white/10 text-white font-bold h-16 px-10 rounded-full hover:bg-white/5 transition-all flex items-center gap-2">
                                    <Github className="h-5 w-5" /> GitHub
                                </button>
                            </div>
                        </div>

                        {/* Code Preview */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-600 rounded-[32px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-[28px] p-8 font-mono text-sm leading-relaxed overflow-hidden shadow-2xl">
                                <div className="flex gap-1.5 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                                </div>
                                <pre className="text-primary/90">
                                    <code>{codeSnippet}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🛠️ Core Resources */}
            <section className="py-32 container mx-auto px-6 max-w-[1280px]">
                <div className="grid md:grid-cols-3 gap-10">
                    {resources.map((res, i) => (
                        <div key={i} className="bg-white/40 backdrop-blur-md p-10 rounded-3xl border border-slate-200/60 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 group">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-8 border border-slate-200/60 shadow-sm">{res.icon}</div>
                            <h3 className="text-xl font-[650] text-slate-900 uppercase tracking-tight mb-4">{res.title}</h3>
                            <p className="text-base text-slate-500 font-medium leading-relaxed mb-8">{res.desc}</p>
                            <Link href={res.link} className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest group-hover:gap-4 transition-all">
                                Explore <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🏗️ Infrastructure Grid */}
            <section className="py-32 bg-slate-50/50 border-y border-slate-100">
                <div className="container mx-auto px-6 max-w-[1280px]">
                    <div className="text-center mb-20 space-y-4">
                        <Badge className="bg-primary/5 text-primary border-primary/10 uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-bold">Reliability</Badge>
                        <h2 className="text-4xl md:text-5xl font-[650] text-slate-900 uppercase tracking-tighter">Enterprise Infrastructure</h2>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { title: "Edge Network", icon: <Cloud /> },
                            { title: "Redis Caching", icon: <Database /> },
                            { title: "Stateless Workers", icon: <Server /> },
                            { title: "OAuth 2.0 Auth", icon: <Lock /> }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">{item.icon}</div>
                                <h4 className="font-bold text-slate-900 uppercase tracking-tight">{item.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 🎯 Final CTA */}
            <section className="py-40 container mx-auto px-6 max-w-[1280px]">
                <div className="bg-slate-900 rounded-[40px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                    <h2 className="text-4xl md:text-6xl font-[650] tracking-tighter max-w-2xl mx-auto leading-tight uppercase">
                        Start Building <span className="text-primary italic">Today.</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                        Get your API key in seconds and start distributing content to billions of users.
                    </p>
                    <div className="pt-4">
                        <Link href="/auth/register">
                            <button className="bg-primary text-white font-bold text-lg px-12 h-20 rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 uppercase tracking-widest flex items-center gap-2 mx-auto justify-center active:scale-95">
                                Create Dev Account <ArrowRight className="h-5 w-5" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

export const metadata = {
    title: "Developer Portal | UNI.social - APIs & SDKs for Social Automation",
    description: "Access UNI.social APIs, SDKs, and webhooks. Build integrated cross-platform social media distribution engines.",
};
