import Link from "next/link";
import { Mail, MessageCircle, Sparkles, Send } from "lucide-react";

export default function HelpContactSection() {
    return (
        <section className="py-24 container mx-auto px-6 max-w-[1280px] font-sans">
            <div className="bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] rounded-[40px] p-12 md:p-20 text-center text-white space-y-12 relative overflow-hidden shadow-2xl">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="space-y-6 relative z-10">
                    <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Sparkles className="h-8 w-8 text-white fill-current" />
                    </div>
                    <h2 className="text-3xl md:text-[3.2rem] font-[650] tracking-[-0.02em] leading-tight max-w-3xl mx-auto">
                        Still have <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent italic px-2">questions</span>?
                    </h2>
                    <p className="text-[1.15rem] text-white/80 font-[420] max-w-xl mx-auto leading-relaxed">
                        Our specialized support team is available 24/7 to ensure your social media success.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 relative z-10">
                    <Link href="/contact" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto bg-white text-[#2d253b] font-bold text-[0.95rem] px-10 py-5 rounded-[16px] hover:bg-white/90 transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest">
                            <Mail className="h-5 w-5" />
                            Email Support
                        </button>
                    </Link>
                    <Link href="/contact" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white font-bold text-[0.95rem] px-10 py-5 rounded-[16px] hover:bg-white/10 transition-all hover:border-white/50 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest">
                            <MessageCircle className="h-5 w-5" />
                            Live Chat
                        </button>
                    </Link>
                </div>

                <div className="pt-8 text-white/50 font-bold text-[0.7rem] uppercase tracking-[0.2em] relative z-10">
                    Average response time: &lt; 2 hours
                </div>
            </div>
        </section>
    );
}
