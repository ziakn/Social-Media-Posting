"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Clock,
    Calendar,
    User,
    Twitter,
    Linkedin,
    Zap,
    Tag,
    Facebook,
    Share,
    Mail
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BlogPostContent({ post }) {
    const relatedPosts = [
        {
            title: "Optimizing TikTok Workflows with AI Lab v4.0",
            slug: "ai-lab-v4-optimization",
            image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400"
        },
        {
            title: "Security Deep Dive: OAuth 2.0 and Token Protection",
            slug: "security-deep-dive",
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400"
        }
    ];

    const formattedContent = post.content ? post.content.split('\n').map((line, i) => (
        <p key={i}>{line}</p>
    )) : null;

    return (
        <article className="bg-white min-h-screen font-inter text-[#3E4652]">
            {/* --- Hero Section --- */}
            <div className="bg-white pt-32 pb-16 relative overflow-hidden">
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10">
                    <div className="max-w-4xl space-y-8">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-black text-[#3B82F6] uppercase tracking-widest hover:-translate-x-1 transition-transform">
                            <ArrowLeft className="h-4 w-4" /> Return to Intelligence
                        </Link>
                        <div className="space-y-6">
                            <Badge className="bg-slate-50 text-[#3B82F6] border-[#E1E7EF] uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black">
                                {post.category}
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-[#0C1B33] leading-none tracking-tighter font-plus-jakarta uppercase">
                                {post.title}
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <User className="h-6 w-6 text-slate-300" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-[#0C1B33] uppercase tracking-tight">{post.author || 'Team SocialHub'}</div>
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{post.authorRole || 'Contributor'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2.5"><Calendar className="h-4 w-4 text-[#3B82F6]" /> {post.date}</span>
                                <span className="flex items-center gap-2.5"><Clock className="h-4 w-4 text-[#3B82F6]" /> {post.readTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Article Body --- */}
            <div className="container mx-auto px-6 py-16 max-w-[1280px]">
                <div className="grid lg:grid-cols-12 gap-16">

                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        {/* Featured Image */}
                        <div className="aspect-[21/9] bg-[#F5F8FB] border border-slate-100 rounded-[10px] overflow-hidden mb-12 shadow-subtle flex items-center justify-center relative">
                            {post.image ? (
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                            ) : (
                                <Zap className="h-32 w-32 text-slate-200" />
                            )}
                        </div>

                        {/* Prose Container */}
                        <div className="prose prose-slate max-w-none 
                            prose-headings:text-[#0C1B33] prose-headings:font-extrabold prose-headings:tracking-tighter prose-headings:font-inter prose-headings:uppercase
                            prose-h2:text-3xl prose-h3:text-2xl
                            prose-p:text-lg prose-p:leading-relaxed prose-p:text-[#3E4652] prose-p:font-medium
                            prose-strong:text-[#0C1B33] prose-strong:font-black
                            prose-a:text-[#3B82F6] prose-a:font-black hover:prose-a:text-[#3B82F6]/80 transition-colors">

                            {post.excerpt && (
                                <p className="text-xl leading-relaxed text-[#0C1B33] font-bold mb-10 italic">
                                    {post.excerpt}
                                </p>
                            )}

                            {formattedContent}
                        </div>

                        {/* End Article CTA */}
                        <div className="mt-20 p-12 bg-slate-50 border border-slate-100 rounded-[10px] text-center space-y-8 shadow-sm">
                            <h3 className="text-3xl font-extrabold text-[#0C1B33] font-inter uppercase tracking-tight">Access the Elite Creation Engine.</h3>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl mx-auto">
                                Join 12,500+ professionals scaling their social presence with the power of SocialHub's AI-driven platform.
                            </p>
                            <Link href="/pricing" className="inline-block">
                                <button className="bg-[#0C1B33] text-[#F9C80E] font-black text-lg px-12 h-20 rounded-[6px] hover:scale-105 transition-all shadow-subtle">
                                    View Pricing Plans
                                </button>
                            </Link>
                        </div>

                        {/* Share & Tags */}
                        <div className="flex flex-wrap items-center justify-between gap-8 py-10 border-t border-slate-100 mt-20">
                            <div className="flex items-center gap-6">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share Article:</span>
                                <div className="flex gap-3">
                                    {[Twitter, Linkedin, Facebook, Share].map((Icon, i) => (
                                        <button key={i} className="w-12 h-12 rounded-[6px] bg-white border border-slate-100 flex items-center justify-center text-[#0C1B33] hover:bg-[#3B82F6] hover:text-white transition-all shadow-sm">
                                            <Icon className="h-4 w-4" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Tag className="h-4 w-4 text-[#3B82F6]" />
                                <div className="flex gap-3">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{post.category}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="lg:col-span-4 space-y-10">
                        {/* Author Card */}
                        <div className="p-10 bg-white border border-slate-100 rounded-[10px] space-y-8 shadow-subtle">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Article Author</h4>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <User className="h-8 w-8 text-slate-200" />
                                </div>
                                <div>
                                    <div className="font-extrabold text-[#0C1B33] text-lg uppercase tracking-tight">{post.author || 'Team SocialHub'}</div>
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{post.authorRole || 'Contributor'}</div>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-[#3E4652] font-medium">
                                Expert insights from the SocialHub team to help you grow your digital footprint.
                            </p>
                        </div>

                        {/* Related Posts */}
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">More Intelligence</h4>
                            <div className="space-y-8">
                                {relatedPosts.map((rp, i) => (
                                    <Link key={i} href={`/blog/${rp.slug}`} className="group block space-y-4">
                                        <div className="aspect-[16/9] bg-[#F5F8FB] rounded-[10px] border border-slate-100 group-hover:border-[#3B82F6] transition-all shadow-sm relative overflow-hidden">
                                            <img src={rp.image} alt={rp.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        </div>
                                        <h5 className="font-extrabold text-[#0C1B33] text-lg leading-tight uppercase tracking-tight group-hover:text-[#3B82F6] transition-colors line-clamp-2">
                                            {rp.title}
                                        </h5>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Newsletter Card */}
                        <div className="sticky top-32 p-10 bg-[#0C1B33] rounded-[10px] text-white space-y-8 shadow-subtle overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/10 blur-3xl pointer-events-none" />
                            <div className="relative z-10 space-y-6">
                                <Mail className="h-10 w-10 text-[#F9C80E]" />
                                <h4 className="text-2xl font-extrabold font-inter tracking-tighter uppercase leading-tight">Weekly <br /> Platform Signals.</h4>
                                <p className="text-slate-400 font-medium text-sm leading-relaxed">The high-velocity digest on decentralized social graphs.</p>
                                <Link href="/auth/register" className="block">
                                    <button className="w-full bg-[#F9C80E] text-[#0C1B33] font-black uppercase tracking-widest text-[10px] h-14 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle">
                                        Join for Free
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </article>
    );
}
