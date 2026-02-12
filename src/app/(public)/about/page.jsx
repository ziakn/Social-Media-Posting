import Link from "next/link";
import {
  Heart,
  Users,
  Globe,
  ShieldCheck,
  ArrowRight,
  Zap,
  Mail,
  MessageSquare,
  Handshake,
  Shield,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import NewFooter from "@/components/home/NewFooter";

export const metadata = {
  title: "About Us | The Mission Behind UNI.social",
  description: "Learn about UNI.social's mission to simplify social media management for creators and agencies with AI-powered tools.",
};

const stats = [
  { label: "Accounts connected", value: "250K+" },
  { label: "Posts published", value: "12M+" },
  { label: "Countries reached", value: "140+" },
  { label: "Core engineering", value: "24/7" }
];

export default function AboutPage() {
  return (
    <main className="flex flex-col min-h-screen relative font-sans">
      <BackgroundCanvas />

      <div className="relative z-20 flex flex-col w-full">
        {/* --- Hero Section --- */}
        <div className="container mx-auto px-6 max-w-[1280px] pt-32 pb-24 lg:pt-40 lg:pb-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px] text-[0.8rem] font-bold uppercase tracking-widest text-[#5e4a7a]">
              Our Narrative
            </span>
            <h1 className="text-5xl md:text-[5rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[1.1]">
              The Mission Behind <span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent font-bold">UNI.social</span>
            </h1>
            <p className="text-xl text-[#4a3d58] font-[420] leading-relaxed max-w-2xl mx-auto">
              UNI.social provides the stability and clear insights you need to maintain a strong digital presence. We're building the tools for the next generation of digital creators.
            </p>
          </div>
        </div>

        {/* --- Stats Strip --- */}
        <div className="container mx-auto px-6 max-w-[1280px] mb-40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] p-8 md:p-10 rounded-[32px] text-center space-y-2 hover:shadow-xl transition-all group shadow-lg">
                <div className="text-4xl md:text-5xl font-[650] text-[#2d253b] tracking-tighter group-hover:text-[#5e4a7a] transition-colors">{stat.value}</div>
                <div className="text-[0.7rem] font-bold text-[#4a3d58]/60 uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Trust & Engineering Section --- */}
        <div id="trust" className="container mx-auto px-6 max-w-[1280px] grid lg:grid-cols-2 gap-20 mb-40 items-center">
          <div className="space-y-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px] text-[0.7rem] font-bold uppercase tracking-widest text-[#5e4a7a]">
              Reliability Focus
            </span>
            <h2 className="text-4xl md:text-[3.5rem] font-[650] text-[#2d253b] tracking-[-0.02em] leading-[1.1]">Our Foundation is <br /> Built on Trust.</h2>
            <div className="space-y-8">
              {[
                { icon: <ShieldCheck className="h-6 w-6" />, title: "Privacy Compliance", desc: "Every piece of data we handle is processed according to strict privacy standards and secure practices." },
                { icon: <Globe className="h-6 w-6" />, title: "Widespread Systems", desc: "Our engine is distributed across multiple locations to ensure fast posting in every time zone." },
                { icon: <Handshake className="h-6 w-6" />, title: "Official Partnerships", desc: "UNI.social is a verified partner for TikTok, Meta, and Pinterest, ensuring stable and reliable connections." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-14 h-14 bg-[#5e4a7a]/10 rounded-2xl flex items-center justify-center text-[#5e4a7a] flex-shrink-0 border border-[#5e4a7a]/20">
                    {item.icon}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-[#2d253b] tracking-tight">{item.title}</h4>
                    <p className="text-[#4a3d58] font-[420] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] rounded-[40px] aspect-square overflow-hidden relative group shadow-2xl">
            <div className="absolute inset-0 bg-[#5e4a7a]/5 group-hover:bg-transparent transition-colors" />
            <div className="absolute bottom-10 left-10 p-10 bg-[rgba(255,255,255,0.8)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] rounded-[32px] shadow-2xl space-y-4 max-w-[320px] z-10">
              <div className="text-[#5e4a7a] font-bold text-[0.7rem] uppercase tracking-widest">HQ / Remote-First</div>
              <p className="font-bold text-[#2d253b] leading-tight text-lg">Operating from 12+ countries to support a global creator base.</p>
            </div>
          </div>
        </div>

        {/* --- Core Values --- */}
        <div className="container mx-auto px-6 max-w-[1280px] mb-40">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-[650] text-[#2d253b] tracking-tight">The Principles that Drive Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Personalized AI", desc: "We build AI tools that empower you, not replace you. We focus on handling repetitive tasks so you can focus on your strategy." },
              { title: "Complete Transparency", desc: "From our status updates to our pricing, we believe in being open and honest. No hidden limits or complex terms." },
              { title: "Stability & Speed", desc: "We improve our platform quickly, but we never compromise on the reliability of your content. Your posts are our priority." }
            ].map((v, i) => (
              <div key={i} className="p-10 bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] rounded-[32px] hover:shadow-xl transition-all shadow-lg group">
                <h4 className="text-xl font-bold text-[#2d253b] mb-4 group-hover:text-[#5e4a7a] transition-colors">{v.title}</h4>
                <p className="text-[#4a3d58] font-[420] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Contact & Support --- */}
        <div className="container mx-auto px-6 max-w-[1280px] mb-24">
          <div className="bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] rounded-[40px] p-12 md:p-20 text-white flex flex-col items-center text-center space-y-12 relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full group-hover:bg-white/10 transition-colors" />

            <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center relative z-10">
              <Sparkles className="h-8 w-8 text-white fill-current" />
            </div>

            <h3 className="text-3xl md:text-[3.5rem] font-[650] tracking-tight leading-tight relative z-10">Want to join the mission or <br /> need enterprise support?</h3>

            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
              <Link href="mailto:support@uni.social">
                <button className="bg-white text-[#2d253b] font-bold text-[0.95rem] px-12 py-5 rounded-[16px] hover:bg-white/90 transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest">
                  Contact Support
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="border-2 border-white/20 text-white font-bold text-[0.95rem] px-12 py-5 rounded-[16px] hover:bg-white/5 transition-all hover:-translate-y-1 uppercase tracking-widest">
                  View Open Roles
                </button>
              </Link>
            </div>
          </div>
        </div>

        <NewFooter />
      </div>
    </main>
  );
}