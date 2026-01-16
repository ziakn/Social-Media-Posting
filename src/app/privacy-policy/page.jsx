import Link from "next/link";
import { ShieldCheck, Lock, Globe, FileText, ArrowLeft, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Privacy Policy | SocialHub Social Media Tool",
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
      content: "Our service integrates with official APIs from Meta, ByteDance, Google, and others. Your use of SocialHub is also subject to the respective Privacy Policies of these platforms. We never scrape or utilize grey-market API endpoints."
    },
    {
      title: "4. Data Retention & Deletion",
      content: "You maintain full ownership of your data. Upon account termination, all OAuth tokens are instantly revoked and content assets are purged from our primary S3 storage within 30 days, unless required otherwise by localized data laws."
    }
  ];

  return (
    <div className="bg-white pt-32 pb-24 font-plus-jakarta text-[#3E4652]">
      <div className="container mx-auto px-6 max-w-[1200px]">

        {/* --- Header --- */}
        <div className="max-w-4xl mb-20 space-y-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-[#3B82F6] uppercase tracking-widest hover:-translate-x-1 transition-transform">
            <ArrowLeft className="h-4 w-4" /> Return to Dashboard
          </Link>
          <div className="space-y-4">
            <Badge className="bg-[#0C1B33] text-white uppercase text-[9px] px-3 font-black tracking-widest">Legal Disclosure</Badge>
            <h1 className="text-4xl md:text-7xl font-extrabold text-[#0C1B33] tracking-tighter leading-[0.9] font-plus-jakarta uppercase">
              Privacy <br /> <span className="text-[#3B82F6]">Protocol.</span>
            </h1>
          </div>
          <p className="text-xl font-medium text-slate-500 max-w-2xl leading-relaxed">
            Effective: January 01, 2026. This document outlines the technical and legal frameworks we use to protect your digital presence and authorization tokens.
          </p>
        </div>

        {/* --- Policy Content --- */}
        <div className="grid lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-16">
            {sections.map((section, i) => (
              <section key={i} className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">{section.title}</h2>
                <p className="text-lg font-medium leading-relaxed text-[#505d72]">
                  {section.content}
                </p>
              </section>
            ))}

            <div className="p-10 bg-[#F5F8FB] border border-[#E1E7EF] rounded-[10px] space-y-6">
              <div className="flex items-center gap-3 text-[#0C1B33]">
                <ShieldAlert className="h-5 w-5" />
                <h4 className="font-extrabold text-sm uppercase tracking-tight font-plus-jakarta">GDPR & CCPA Rights</h4>
              </div>
              <p className="text-sm font-medium leading-relaxed text-slate-500">
                If you are a resident of the European Economic Area (EEA) or California, you have specific data protection rights. To exercise your right to access, rectify, or delete your personal data, please contact our Data Protection Officer at <strong>dpo@socialhub.com</strong>.
              </p>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 bg-[#0C1B33] rounded-[10px] text-white space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-3xl" />
              <h4 className="text-xl font-extrabold font-plus-jakarta uppercase italic flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#F9C80E]" /> Trust Summary
              </h4>
              <ul className="space-y-4">
                {[
                  { icon: <Lock className="h-4 w-4" />, text: "AES-256 GCM Key Encryption" },
                  { icon: <ShieldCheck className="h-4 w-4" />, text: "No Data Reselling Policy" },
                  { icon: <Globe className="h-4 w-4" />, text: "Global GDPR/CCPA Compliance" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-center text-xs font-bold text-slate-300">
                    <span className="text-[#3B82F6]">{item.icon}</span> {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 border border-[#E1E7EF] rounded-[10px] space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Related Documents</h5>
              <div className="space-y-2">
                <Link href="/terms-of-service" className="block text-sm font-bold text-[#3B82F6] hover:underline">Terms of Service</Link>
                <Link href="/cookie-policy" className="block text-sm font-bold text-[#3B82F6] hover:underline">Cookie Policy</Link>
                <Link href="/dpa" className="block text-sm font-bold text-[#3B82F6] hover:underline">Data Processing Agreement (DPA)</Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}