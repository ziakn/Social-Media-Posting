import Link from "next/link";
import { ShieldCheck, Lock, Globe, FileText, ArrowLeft, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import NewFooter from "@/components/home/NewFooter";

export const metadata = {
  title: "Privacy Policy | UNI.social Social Media Tool",
  description: "Our privacy policy explains how we protect your data and stay compliant with global standards.",
};

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Authorized Data Collection",
      content: "We only collect data necessary to provide and improve our social management services. This includes OAuth tokens granted via authorized platform flows, basic account metadata, and content assets you explicitly upload to our secure DAM (Digital Asset Management) system."
    },
    {
      title: "2. Technical Security Standards",
      content: "All social credentials and sensitive tokens are encrypted using AES-256 GCM at rest. In-transit data is protected via TLS 1.3. We perform regular third-party security audits to ensure your platform standings remain secure."
    },
    {
      title: "3. Third-Party Platform Terms",
      content: "Our service integrates with official APIs from Meta, ByteDance, Google, and others. Your use of UNI.social is also subject to the respective Privacy Policies of these platforms. We never scrape or utilize grey-market API endpoints."
    },
    {
      title: "4. Data Retention & Deletion",
      content: "You maintain full ownership of your data. Upon account termination, all OAuth tokens are instantly revoked and content assets are purged from our primary S3 storage within 30 days, unless required otherwise by localized data laws."
    }
  ];

  return (
    <main className="flex flex-col min-h-screen relative font-sans">
      <BackgroundCanvas />

      <div className="relative z-20 flex flex-col w-full">
        <div className="container mx-auto px-6 max-w-[1240px] pt-32 pb-24 lg:pt-40 lg:pb-32">
          {/* --- Header --- */}
          <div className="max-w-4xl mb-24 space-y-10">
            <Link href="/portal" className="inline-flex items-center gap-2 text-[0.75rem] font-bold text-[#5e4a7a] uppercase tracking-widest hover:-translate-x-1 transition-transform group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Return to Dashboard
            </Link>
            <div className="space-y-6 text-left">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px] text-[0.7rem] font-bold uppercase tracking-widest text-[#5e4a7a]">
                Legal Disclosure
              </span>
              <h1 className="text-5xl md:text-[5.5rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[0.9] uppercase">
                Privacy <br /> <span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent italic">Protocol.</span>
              </h1>
            </div>
            <p className="text-xl font-[420] text-[#4a3d58] max-w-2xl leading-relaxed">
              Effective: January 01, 2026. This document outlines the technical and legal frameworks we use to protect your digital presence and authorization tokens at <span className="font-bold">UNI.social</span>.
            </p>
          </div>

          {/* --- Policy Content --- */}
          <div className="grid lg:grid-cols-12 gap-20 lg:gap-32">
            <div className="lg:col-span-8 space-y-20">
              {sections.map((section, i) => (
                <section key={i} className="space-y-8 group">
                  <h2 className="text-2xl font-[650] text-[#2d253b] uppercase tracking-tight group-hover:text-[#5e4a7a] transition-colors">{section.title}</h2>
                  <p className="text-[1.1rem] font-[420] leading-relaxed text-[#4a3d58]">
                    {section.content}
                  </p>
                </section>
              ))}

              <div className="p-10 md:p-12 bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[12px] rounded-[32px] space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#5e4a7a]/5 blur-3xl pointer-events-none" />
                <div className="flex items-center gap-4 text-[#5e4a7a]">
                  <div className="w-10 h-10 rounded-xl bg-[#5e4a7a]/10 flex items-center justify-center border border-[#5e4a7a]/20">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-lg uppercase tracking-tight">GDPR & CCPA Rights</h4>
                </div>
                <p className="text-[0.95rem] font-[420] leading-relaxed text-[#4a3d58]/80">
                  If you are a resident of the European Economic Area (EEA) or California, you have specific data protection rights. To exercise your right to access, rectify, or delete your personal data, please contact our Data Protection Officer at <span className="text-[#5e4a7a] font-bold">dpo@uni.social</span>.
                </p>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-4 space-y-10">
              <div className="p-8 md:p-10 bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] rounded-[40px] text-white space-y-10 relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 blur-[120px] pointer-events-none group-hover:bg-white/10 transition-colors" />
                <h4 className="text-xl font-[650] uppercase italic flex items-center gap-4 relative z-10">
                  <Sparkles className="h-6 w-6 text-white fill-current" /> Trust Summary
                </h4>
                <ul className="space-y-6 relative z-10">
                  {[
                    { icon: <Lock className="h-5 w-5" />, text: "AES-256 GCM Key Encryption" },
                    { icon: <ShieldCheck className="h-5 w-5" />, text: "No Data Reselling Policy" },
                    { icon: <Globe className="h-5 w-5" />, text: "Global GDPR/CCPA Compliance" }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-5 items-center text-[0.85rem] font-bold text-white/80">
                      <span className="text-white bg-white/10 p-2.5 rounded-xl border border-white/20">{item.icon}</span> {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-10 bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] rounded-[40px] shadow-xl space-y-8">
                <h5 className="text-[0.65rem] font-bold text-[#4a3d58]/60 uppercase tracking-[0.2em] px-2">Related Documents</h5>
                <div className="space-y-4">
                  {[
                    { label: "Terms of Service", href: "/terms-of-service" },
                    { label: "Cookie Policy", href: "/cookie-policy" },
                    { label: "Data Processing Agreement", href: "/dpa" }
                  ].map((link, idx) => (
                    <Link
                      key={idx}
                      href={link.href}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/60 hover:bg-[#5e4a7a] transition-all duration-300"
                    >
                      <span className="text-[0.95rem] font-bold text-[#2d253b] group-hover:text-white transition-colors">{link.label}</span>
                      <ArrowRight className="h-4 w-4 text-[#5e4a7a] group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <NewFooter />
      </div>
    </main>
  );
}