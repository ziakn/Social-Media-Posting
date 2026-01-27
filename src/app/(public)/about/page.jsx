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
  Shield
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "About Us | The Mission Behind SocialHub Social Media Tool",
  description: "Learn about SocialHub's mission to simplify social media management for creators and agencies with AI-powered tools.",
};

const stats = [
  { label: "Accounts connected", value: "250K+" },
  { label: "Posts published", value: "12M+" },
  { label: "Countries reached", value: "140+" },
  { label: "Core engineering", value: "24/7" }
];

export default function AboutPage() {
  return (
    <div className="bg-white pt-32 pb-24 font-plus-jakarta text-[#3E4652]">
      <div className="container mx-auto px-6 max-w-[1280px]">
        {/* --- Hero Section --- */}
        <div className="max-w-4xl mx-auto text-center mb-32 space-y-6">
          <Badge className="bg-slate-50 text-[#3B82F6] border-[#E1E7EF] uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black">Our Narrative</Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#0C1B33] tracking-tighter leading-none font-plus-jakarta uppercase">
            The Mission Behind <span className="text-[#3B82F6]">SocialHub</span>
          </h1>
          <p className="text-xl text-[#3E4652] font-medium leading-relaxed max-w-2xl mx-auto">
            SocialHub provides the stability and clear insights you need to maintain a strong digital presence. We're building the tools for the next generation of digital creators.
          </p>
        </div>

        {/* --- The Problem we solve (Stats Strip) --- */}
        <div className="grid md:grid-cols-4 gap-4 mb-40">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#F5F8FB] border border-[#E1E7EF] p-10 rounded-[10px] text-center space-y-2 hover:border-[#3B82F6] transition-colors group">
              <div className="text-4xl font-black text-[#0C1B33] font-plus-jakarta tracking-tighter group-hover:text-[#3B82F6] transition-colors">{stat.value}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
              <span className="sr-only">Company statistic showing {stat.value} {stat.label}</span>
            </div>
          ))}
        </div>

        {/* --- Trust & Engineering Section --- */}
        <div id="trust" className="grid lg:grid-cols-2 gap-20 mb-40 items-center">
          <div className="space-y-10">
            <Badge className="bg-[#F9C80E] text-[#0C1B33] border-none uppercase text-[9px] font-black px-3">Reliability Focus</Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tighter leading-tight uppercase">Our Foundation is <br /> Built on Trust.</h2>
            <div className="space-y-8">
              {[
                { icon: <ShieldCheck className="h-6 w-6" />, title: "Privacy Compliance", desc: "Every piece of data we handle is processed according to strict privacy standards and secure practices." },
                { icon: <Globe className="h-6 w-6" />, title: "Widespread Systems", desc: "Our engine is distributed across multiple locations to ensure fast posting in every time zone." },
                { icon: <Handshake className="h-6 w-6" />, title: "Official Partnerships", desc: "SocialHub is a verified partner for TikTok, Meta, and Pinterest, ensuring stable and reliable connections." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-[#F5F8FB] rounded-lg flex items-center justify-center text-[#0C1B33] flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">{item.title}</h4>
                    <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Placeholder for real team photo logic */}
          <div className="bg-[#F5F8FB] border border-[#E1E7EF] rounded-[10px] aspect-square overflow-hidden relative group">
            <div className="absolute inset-0 bg-[#0C1B33]/5 group-hover:bg-transparent transition-colors" />
            <div className="absolute bottom-10 left-10 p-8 bg-white border border-[#E1E7EF] rounded-lg shadow-xl space-y-4 max-w-[280px]">
              <div className="text-[#3B82F6] font-black text-[10px] uppercase tracking-widest">HQ / Remote-First</div>
              <p className="font-bold text-[#0C1B33] leading-tight">Operating from 12+ countries to support a global creator base.</p>
            </div>
            <span className="sr-only">Photo of the SocialHub core engineering team collaborating at our headquarters.</span>
          </div>
        </div>

        {/* --- Core Values --- */}
        <div className="mb-40">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">The Principles that Drive Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Personalized AI", desc: "We build AI tools that empower you, not replace you. We focus on handling repetitive tasks so you can focus on your strategy." },
              { title: "Complete Transparency", desc: "From our status updates to our pricing, we believe in being open and honest. No hidden limits or complex terms." },
              { title: "Stability & Speed", desc: "We improve our platform quickly, but we never compromise on the reliability of your content. Your posts are our priority." }
            ].map((v, i) => (
              <div key={i} className="p-10 bg-white border border-[#E1E7EF] rounded-[10px] hover:border-[#3B82F6] transition-all">
                <h4 className="text-xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase mb-4">{v.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Contact & Support --- */}
        <div className="bg-[#0C1B33] rounded-[10px] p-12 md:p-20 text-white flex flex-col items-center text-center space-y-10">
          <h3 className="text-4xl font-extrabold font-plus-jakarta tracking-tighter uppercase leading-tight">Want to join the mission or <br /> need enterprise support?</h3>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link href="mailto:support@socialhub.com">
              <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-lg px-12 h-16 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle hover:-translate-y-0.5 active:scale-95">
                Contact Support
              </button>
            </Link>
            <Link href="/pricing">
              <button className="border-2 border-white/20 text-white font-bold text-lg px-12 h-16 rounded-[6px] hover:bg-white/5 transition-all hover:-translate-y-0.5 uppercase tracking-widest">
                View Open Roles
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}