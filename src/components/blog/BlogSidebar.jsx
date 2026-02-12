import Link from "next/link";
import { ArrowRight, Mail, LayoutGrid, Sparkles } from "lucide-react";

export default function BlogSidebar() {
    return (
        <aside className="lg:col-span-4 space-y-8 pl-0 lg:pl-4 font-sans relative z-10">

            {/* Newsletter widget */}
            <div className="bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] p-8 rounded-[32px] border border-[rgba(255,255,255,0.6)] shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#5e4a7a]/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-[#5e4a7a]/10 transition-colors" />

                <div className="relative z-10">
                    <div className="w-12 h-12 bg-[#5e4a7a]/10 rounded-2xl flex items-center justify-center mb-6">
                        <Mail className="h-6 w-6 text-[#5e4a7a]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#2d253b] mb-3 tracking-tight">Stay updated</h3>
                    <p className="text-[0.9rem] text-[#4a3d58] mb-6 font-[420] leading-relaxed">Get the latest social media tips delivered to your inbox weekly.</p>
                    <div className="space-y-3">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="w-full px-5 py-4 rounded-[16px] bg-[rgba(255,255,255,0.5)] border border-[rgba(110,85,145,0.2)] focus:outline-none focus:ring-2 focus:ring-[#5e4a7a]/20 text-sm font-[420] transition-all"
                        />
                        <button className="w-full bg-[#2d253b] text-white font-bold py-4 rounded-[16px] text-xs uppercase tracking-widest transition-all hover:bg-[#3f3155] shadow-md active:scale-95">
                            Subscribe now
                        </button>
                    </div>
                </div>
            </div>

            {/* Categories widget */}
            <div className="bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] p-8 rounded-[32px] border border-[rgba(255,255,255,0.6)] shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <LayoutGrid className="h-5 w-5 text-[#5e4a7a]" />
                    <h3 className="text-lg font-bold text-[#2d253b] tracking-tight">Top Categories</h3>
                </div>
                <ul className="space-y-4">
                    {["Platform Guides", "Strategy & Insights", "Creator Growth"].map(cat => (
                        <li key={cat}>
                            <Link href="#" className="flex items-center justify-between text-[#4a3d58] hover:text-[#5e4a7a] transition-all font-bold text-sm uppercase tracking-wider group/cat">
                                <span>{cat}</span>
                                <ArrowRight className="h-4 w-4 opacity-40 transform transition-all group-hover/cat:translate-x-1 group-hover/cat:opacity-100" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Join CTA */}
            <div className="bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] text-white p-8 rounded-[32px] text-center space-y-6 relative overflow-hidden shadow-xl group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[40px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="h-7 w-7 text-white fill-current" />
                    </div>
                    <h3 className="text-2xl font-[650] tracking-tight leading-tight">Dominate Social Media</h3>
                    <p className="text-white/80 text-sm font-[420] mb-6">Join 12,000+ creators using the power of UNI.social.</p>
                    <Link href="/auth/register" className="block">
                        <button className="w-full bg-white text-[#2d253b] font-bold py-4 rounded-[16px] text-xs uppercase tracking-widest transition-all hover:bg-white/90 shadow-md active:scale-95">
                            Get Started Free
                        </button>
                    </Link>
                </div>
            </div>

        </aside>
    );
}
