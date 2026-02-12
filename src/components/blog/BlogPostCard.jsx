import Link from "next/link";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";

export default function BlogPostCard({ post }) {
    return (
        <div className="group bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] rounded-[32px] border border-[rgba(255,255,255,0.6)] p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden font-sans shadow-lg">
            {/* Image Container */}
            <div className="w-full md:w-[320px] aspect-[16/9] md:aspect-[4/3] rounded-[24px] bg-gradient-to-br from-[#5e4a7a]/5 to-transparent shrink-0 overflow-hidden relative border border-[rgba(255,255,255,0.4)]">
                {post.image ? (
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#5e4a7a]/30 font-bold uppercase tracking-widest text-[0.7rem] bg-[#5e4a7a]/5">
                        No Preview
                    </div>
                )}
                <div className="absolute top-4 left-4 bg-[#5e4a7a] text-white text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    {post.category}
                </div>
            </div>

            <div className="flex-1 flex flex-col h-full py-1">
                <div className="flex items-center gap-6 mb-4 text-[0.75rem] font-bold text-[#4a3d58]/60 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        {post.author}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {post.date}
                    </div>
                </div>

                <Link href={`/blog/${post.slug}`} className="block group/title">
                    <h2 className="text-2xl font-[650] text-[#2d253b] tracking-[-0.02em] leading-[1.2] mb-3 group-hover/title:text-[#5e4a7a] transition-colors line-clamp-2">
                        {post.title}
                    </h2>
                </Link>

                <p className="text-[#4a3d58] line-clamp-2 leading-relaxed font-[420] text-[0.95rem] mb-6">
                    {post.excerpt}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[rgba(110,85,145,0.1)]">
                    <div className="flex items-center gap-2 text-[0.75rem] font-bold text-[#5e4a7a] uppercase tracking-widest">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime}
                    </div>

                    <Link href={`/blog/${post.slug}`} className="flex items-center gap-2 text-[0.75rem] font-bold text-[#2d253b] uppercase tracking-widest hover:text-[#5e4a7a] transition-colors group/link">
                        Read More <ArrowRight className="h-4 w-4 transform transition-transform group-hover/link:translate-x-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
