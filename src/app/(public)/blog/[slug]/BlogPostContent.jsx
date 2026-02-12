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
    Mail,
    Sparkles
} from "lucide-react";
import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import NewFooter from "@/components/home/NewFooter";

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
        <p key={i} className="mb-6">{line}</p>
    )) : null;

    return (
        <main className="flex flex-col min-h-screen relative font-sans">
            <BackgroundCanvas />

            <div className="relative z-20 flex flex-col w-full">
                {/* --- Hero Section --- */}
                <div className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden border-b border-[rgba(110,85,145,0.1)]">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-10 w-96 h-96 bg-[#5e4a7a]/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#5e4a7a]/5 rounded-full blur-[120px]" />
                    </div>

                    <div className="container mx-auto px-6 max-w-[1280px] relative z-10">
                        <div className="max-w-4xl space-y-8">
                            <Link href="/blog" className="inline-flex items-center gap-2 text-[0.75rem] font-bold text-[#5e4a7a] uppercase tracking-widest hover:-translate-x-1 transition-transform group/back">
                                <ArrowLeft className="h-4 w-4 transform transition-transform group-hover/back:-translate-x-1" /> Return to Insights
                            </Link>

                            <div className="space-y-6">
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px] text-[0.7rem] font-bold uppercase tracking-widest text-[#5e4a7a]">
                                    {post.category}
                                </span>
                                <h1 className="text-4xl md:text-[3.8rem] font-[650] text-[#2d253b] leading-[1.1] tracking-[-0.03em]">
                                    {post.title}
                                </h1>
                            </div>

                            <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-[rgba(110,85,145,0.1)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[50px] bg-[#5e4a7a]/10 border border-[#5e4a7a]/20 flex items-center justify-center">
                                        <User className="h-6 w-6 text-[#5e4a7a]" />
                                    </div>
                                    <div>
                                        <div className="text-[0.85rem] font-bold text-[#2d253b] uppercase tracking-tight">{post.author || 'Team UNI.social'}</div>
                                        <div className="text-[0.65rem] font-bold text-[#4a3d58]/60 uppercase tracking-widest">{post.authorRole || 'Contributor'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 text-[0.75rem] font-bold text-[#4a3d58]/60 uppercase tracking-widest">
                                    <span className="flex items-center gap-2.5"><Calendar className="h-4 w-4 text-[#5e4a7a]/40" /> {post.date}</span>
                                    <span className="flex items-center gap-2.5"><Clock className="h-4 w-4 text-[#5e4a7a]/40" /> {post.readTime}</span>
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
                            <div className="aspect-[21/9] bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] rounded-[32px] overflow-hidden mb-12 shadow-lg flex items-center justify-center relative">
                                {post.image ? (
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-[#5e4a7a]/20 font-bold uppercase tracking-widest text-lg bg-[#5e4a7a]/5">
                                        No Featured Image
                                    </div>
                                )}
                            </div>

                            {/* Prose Container */}
                            <div className="prose prose-purple max-w-none 
                                prose-headings:text-[#2d253b] prose-headings:font-[650] prose-headings:tracking-[-0.02em]
                                prose-h2:text-3xl prose-h3:text-2xl
                                prose-p:text-[1.1rem] prose-p:leading-relaxed prose-p:text-[#4a3d58] prose-p:font-[420]
                                prose-strong:text-[#2d253b] prose-strong:font-bold
                                prose-a:text-[#5e4a7a] prose-a:font-bold hover:prose-a:text-[#3a2e4a] transition-colors">

                                {post.excerpt && (
                                    <p className="text-[1.25rem] leading-relaxed text-[#2d253b] font-bold mb-10 italic border-l-4 border-[#5e4a7a] pl-6 py-2">
                                        {post.excerpt}
                                    </p>
                                )}

                                {formattedContent}
                            </div>

                            {/* End Article CTA */}
                            <div className="mt-20 p-12 bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] rounded-[40px] text-center space-y-8 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full group-hover:bg-white/10 transition-colors" />
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                                        <Sparkles className="h-8 w-8 text-white fill-current" />
                                    </div>
                                    <h3 className="text-3xl md:text-[2.5rem] font-[650] text-white tracking-tight leading-tight">Access the Elite Creation Engine.</h3>
                                    <p className="text-white/80 font-[420] text-lg leading-relaxed max-w-xl mx-auto mb-10">
                                        Join 12,000+ professionals scaling their social presence with the power of UNI.social.
                                    </p>
                                    <Link href="/pricing" className="inline-block">
                                        <button className="bg-white text-[#2d253b] font-bold text-[0.95rem] px-12 py-5 rounded-[16px] hover:bg-white/90 transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest">
                                            View Pricing Plans
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* Share & Tags */}
                            <div className="flex flex-wrap items-center justify-between gap-8 py-10 border-t border-[rgba(110,85,145,0.1)] mt-20 relative z-10">
                                <div className="flex items-center gap-6">
                                    <span className="text-[0.7rem] font-bold text-[#4a3d58]/60 uppercase tracking-[0.15em]">Share:</span>
                                    <div className="flex gap-3">
                                        {[Twitter, Linkedin, Facebook, Share].map((Icon, i) => (
                                            <button key={i} className="w-12 h-12 rounded-[12px] bg-[rgba(255,255,255,0.4)] backdrop-blur-[8px] border border-[rgba(110,85,145,0.2)] flex items-center justify-center text-[#2d253b] hover:bg-[#5e4a7a] hover:text-white transition-all shadow-sm">
                                                <Icon className="h-4 w-4" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Tag className="h-4 w-4 text-[#5e4a7a]" />
                                    <span className="text-[0.7rem] font-bold text-[#5e4a7a] uppercase tracking-[0.15em]">{post.category}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Area */}
                        <aside className="lg:col-span-4 space-y-10 relative z-10">
                            {/* Author Card */}
                            <div className="p-10 bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] rounded-[32px] space-y-8 shadow-sm">
                                <h4 className="text-[0.7rem] font-bold text-[#4a3d58]/60 uppercase tracking-[0.15em]">Author</h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[50px] bg-[#5e4a7a]/10 border border-[#5e4a7a]/20 flex items-center justify-center">
                                        <User className="h-8 w-8 text-[#5e4a7a]" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#2d253b] text-lg uppercase tracking-tight leading-none">{post.author || 'Team UNI.social'}</div>
                                        <div className="text-[0.65rem] font-bold text-[#4a3d58]/60 uppercase tracking-widest mt-1">{post.authorRole || 'Contributor'}</div>
                                    </div>
                                </div>
                                <p className="text-[0.9rem] leading-relaxed text-[#4a3d58] font-[420]">
                                    Expert insights from the UNI.social team to help you grow your digital footprint.
                                </p>
                            </div>

                            {/* Related Posts */}
                            <div className="space-y-8">
                                <h4 className="text-[0.7rem] font-bold text-[#4a3d58]/60 uppercase tracking-[0.15em] pl-2">More Intelligence</h4>
                                <div className="space-y-8">
                                    {relatedPosts.map((rp, i) => (
                                        <Link key={i} href={`/blog/${rp.slug}`} className="group block space-y-4">
                                            <div className="aspect-[16/9] bg-[rgba(255,255,255,0.4)] backdrop-blur-[8px] rounded-[24px] border border-[rgba(255,255,255,0.6)] group-hover:border-[#5e4a7a] transition-all shadow-sm relative overflow-hidden">
                                                <img src={rp.image} alt={rp.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            </div>
                                            <h5 className="font-bold text-[#2d253b] text-lg leading-tight group-hover:text-[#5e4a7a] transition-colors line-clamp-2 px-2">
                                                {rp.title}
                                            </h5>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Newsletter Card */}
                            <div className="sticky top-32 p-10 bg-[#2d253b] rounded-[32px] text-white space-y-8 shadow-xl overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-[#5e4a7a]/20 blur-3xl pointer-events-none group-hover:bg-[#5e4a7a]/30 transition-colors" />
                                <div className="relative z-10 space-y-8">
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <Mail className="h-7 w-7 text-white" />
                                    </div>
                                    <h4 className="text-2xl md:text-3xl font-[650] tracking-tight leading-tight">Weekly <br /> Platform Signals.</h4>
                                    <p className="text-white/60 font-[420] text-[0.9rem] leading-relaxed">The high-velocity digest on decentralized social graphs.</p>
                                    <Link href="/auth/register" className="block">
                                        <button className="w-full bg-[#5e4a7a] text-white font-bold uppercase tracking-widest text-[0.7rem] h-16 rounded-[16px] hover:bg-[#3f3155] transition-all shadow-lg active:scale-95">
                                            Join Insights
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </aside>

                    </div>
                </div>

                <NewFooter />
            </div>
        </main>
    );
}
