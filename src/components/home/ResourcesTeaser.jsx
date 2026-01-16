"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

const posts = [
    {
        title: "The 2026 Social Meta: Decoding Threads and Bluesky Growth",
        category: "Strategy",
        readTime: "8 min read",
        slug: "2026-social-meta"
    },
    {
        title: "Optimizing TikTok Workflows with AI Lab v4.0",
        category: "Product",
        readTime: "5 min read",
        slug: "ai-lab-v4-optimization"
    },
    {
        title: "How an E-com Brand Scaled to 9 Platforms in 30 Days",
        category: "Case Study",
        readTime: "12 min read",
        slug: "ecom-scaling-case-study"
    }
];

export default function ResourcesTeaser() {
    return (
        <section className="py-32 bg-slate-50 border-y border-slate-100 font-inter">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="flex flex-col md:flex-row justify-between items-center mb-24 gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight leading-tight uppercase">
                            Protocol <span className="text-[#3B82F6]">Intelligence</span>
                        </h2>
                        <p className="text-sm text-slate-500 font-medium uppercase tracking-widest font-plus-jakarta">The latest signals from the SocialHub engineering blog</p>
                    </div>
                    <Link href="/blog">
                        <button className="bg-white border-2 border-[#0C1B33] text-[#0C1B33] font-black text-[10px] px-10 h-14 rounded-[6px] hover:bg-slate-50 uppercase tracking-widest transition-all font-plus-jakarta">
                            Read More Articles
                        </button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {posts.map((post, i) => (
                        <div key={i} className="group bg-white border border-slate-200 rounded-[10px] overflow-hidden hover:border-[#3B82F6]/30 transition-all hover:shadow-subtle flex flex-col h-full">
                            <div className="aspect-[16/9] bg-[#F5F8FB] flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#3B82F6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Zap className="h-12 w-12 text-slate-200 group-hover:scale-125 transition-transform" />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-[#0C1B33] text-white font-black text-[8px] px-3 py-1 rounded uppercase tracking-widest font-plus-jakarta">{post.category}</span>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-1 space-y-6">
                                <h3 className="text-xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight group-hover:text-[#3B82F6] transition-colors line-clamp-2 leading-tight">
                                    {post.title}
                                </h3>
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-inter">{post.readTime}</span>
                                    <Link href={`/blog/${post.slug}`} className="text-[#0C1B33] hover:text-[#3B82F6] transition-colors">
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
