import Link from "next/link";
import { ShieldCheck, FileText, Globe, Scale, ArrowLeft, Handshake, Database, Lock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
    title: "Data Processing Agreement (DPA) | SocialHub",
    description: "Our Data Processing Agreement outlines our commitment to data security and GDPR compliance.",
};

export default function DPA() {
    const principles = [
        {
            title: "Data Protection Role",
            desc: "SocialHub acts as the 'Data Processor' for the content and metadata you distribute. You remain the 'Data Controller'. We only process data upon your explicit instruction via the dashboard or API."
        },
        {
            title: "Security Measures",
            desc: "Our technical stack includes AES-256 GCM encryption at rest, TLS 1.3 in transit, and continuous DDoS mitigation via our edge network. System access is restricted by granular internal RBAC."
        },
        {
            title: "Sub-processors",
            desc: "We utilize authorized sub-processors like AWS (S3/CloudFront) and Stripe for infrastructure and billing. Every partner is audited for SOC 2 Type II or equivalent security standards."
        }
    ];

    return (
        <div className="bg-white pt-32 pb-24 font-plus-jakarta text-[#3E4652]">
            <div className="container mx-auto px-6 max-w-[1200px]">

                {/* --- Header --- */}
                <div className="max-w-4xl mb-20 space-y-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-[#00A2FF] uppercase tracking-widest hover:-translate-x-1 transition-transform">
                        <ArrowLeft className="h-4 w-4" /> Return to Dashboard
                    </Link>
                    <div className="space-y-4">
                        <Badge className="bg-[#0C1B33] text-white uppercase text-[9px] px-3 font-black tracking-widest">Enterprise Compliance</Badge>
                        <h1 className="text-4xl md:text-7xl font-extrabold text-[#0C1B33] tracking-tighter leading-[0.9] font-plus-jakarta uppercase">
                            Data <br /> <span className="text-[#00A2FF]">Agreement.</span>
                        </h1>
                    </div>
                    <p className="text-xl font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Updated: January 18, 2026. This DPA serves as an addendum to our Terms of Service, detailing how we process 'Authorized Content' across our global node network.
                    </p>
                </div>

                {/* --- Content --- */}
                <div className="grid lg:grid-cols-12 gap-20">
                    <div className="lg:col-span-8 space-y-16">
                        {principles.map((p, i) => (
                            <section key={i} className="space-y-6">
                                <h2 className="text-2xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">{p.title}</h2>
                                <p className="text-lg font-medium leading-relaxed text-[#505d72]">
                                    {p.desc}
                                </p>
                            </section>
                        ))}

                        <div className="p-10 bg-[#F5F8FB] border border-[#E1E7EF] rounded-[10px] space-y-8">
                            <h4 className="font-extrabold text-[#0C1B33] font-plus-jakarta uppercase">Audit & Transparency</h4>
                            <p className="text-sm font-medium leading-relaxed text-slate-500">
                                Enterprise clients can request our latest SOC 2 security summary or perform independent API security reviews upon entering a Master Service Agreement (MSA).
                            </p>
                            <Link href="mailto:compliance@socialhub.com">
                                <button className="bg-[#0C1B33] text-white px-8 py-4 rounded-[8px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                                    Request Full Audit Pack
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-8 bg-[#0C1B33] rounded-[10px] text-white space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1/3 h-full bg-[#00A2FF]/10 blur-3xl" />
                            <h4 className="text-xl font-extrabold font-plus-jakarta uppercase italic flex items-center gap-3">
                                <Database className="h-5 w-5 text-[#F9C80E]" /> Security Deck
                            </h4>
                            <ul className="space-y-4">
                                {[
                                    { icon: <Lock className="h-4 w-4" />, text: "End-to-End Encryption" },
                                    { icon: <ShieldCheck className="h-4 w-4" />, text: "GDPR/CCPA Aligned" },
                                    { icon: <Zap className="h-4 w-4" />, text: "Official Partner APIs Only" }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 items-center text-xs font-bold text-slate-300">
                                        <span className="text-[#00A2FF]">{item.icon}</span> {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
