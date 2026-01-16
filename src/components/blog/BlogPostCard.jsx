"use client";

import Link from "next/link";
import { Calendar, Clock, User, ArrowRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BlogPostCard({ post }) {
    return (
        <div className="group bg-white border border-[#E1E7EF] rounded-[10px] overflow-hidden hover:border-[#00A2FF] shadow-sm hover:shadow-subtle hover:-translate-y-1 transition-all flex flex-col md:flex-row min-h-[320px]">
            <Link href={`/blog/${post.slug}`} className="md:w-2/5 aspect-[16/10] md:aspect-auto overflow-hidden relative bg-[#F5F8FB] flex items-center justify-center p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#00A2FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="z-10 group-hover:scale-110 transition-transform duration-700">
                    <Zap className="h-20 w-20 text-slate-200" />
                </div>
                <div className="absolute top-4 left-4">
                    <Badge className="bg-[#0C1B33] text-white border-none font-black text-[9px] px-3 uppercase tracking-widest font-plus-jakarta">
                        {post.category}
                    </Badge>
                </div>
            </Link>
            <div className="p-10 flex flex-col justify-center flex-1 space-y-6">
                <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest font-plus-jakarta">
                    <span className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {post.date}</span>
                    <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> {post.readTime}</span>
                </div>
                <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-2xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight leading-tight group-hover:text-[#00A2FF] transition-colors line-clamp-2">
                        {post.title}
                    </h3>
                </Link>
                <p className="text-sm font-medium leading-relaxed text-[#3E4652] line-clamp-2 font-inter">
                    {post.excerpt}
                </p>
                <div className="pt-4 flex items-center justify-between">
                    <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-[#0C1B33] tracking-[0.2em] hover:text-[#00A2FF] transition-colors group/btn font-plus-jakarta">
                        Read Intelligence <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-300" />
                        </div>
                        <span className="text-[10px] font-black text-[#0C1B33] tracking-widest uppercase font-plus-jakarta">{post.author}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
