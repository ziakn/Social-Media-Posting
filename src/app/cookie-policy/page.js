import Link from "next/link";
import { Cookie, ShieldCheck, Zap, FileText, ArrowLeft, Info, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = {
    title: "Cookie Policy | SocialHub Social Media Tool",
    description: "Our cookie policy explains how we use cookies and similar technologies to enhance your experience.",
};

export default function CookiePolicy() {
    const cookieTypes = [
        {
            title: "Essential Cookies",
            desc: "These are required for technical operations. They handle your login session, security tokens (OAuth), and core dashboard functionality. You cannot disable these without breaking the service.",
            status: "Required"
        },
        {
            title: "Analytical Cookies",
            desc: "We use these to understand how you interact with our tools. This data is anonymized and helps us optimize the 'Smart Scheduler' and 'AI Media Lab' based on global usage patterns.",
            status: "Optional"
        },
        {
            title: "Functional Cookies",
            desc: "These remember your preferences, such as your preferred social platform filters, dashboard theme, and localized timezones for scheduling.",
            status: "Optional"
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
                        <Badge className="bg-[#0C1B33] text-white uppercase text-[9px] px-3 font-black tracking-widest">Network Tracking Disclosure</Badge>
                        <h1 className="text-4xl md:text-7xl font-extrabold text-[#0C1B33] tracking-tighter leading-[0.9] font-plus-jakarta uppercase">
                            Cookie <br /> <span className="text-[#3B82F6]">Policy.</span>
                        </h1>
                    </div>
                    <p className="text-xl font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Updated: January 10, 2026. We use cookies to maintain your authenticated state and ensure high-velocity performance for your cross-platform dashboard.
                    </p>
                </div>

                {/* --- Content --- */}
                <div className="grid lg:grid-cols-12 gap-20">
                    <div className="lg:col-span-8 space-y-16">
                        {cookieTypes.map((type, i) => (
                            <section key={i} className="p-10 border border-[#E1E7EF] rounded-[10px] space-y-6 relative overflow-hidden group hover:border-[#3B82F6] transition-all">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">{type.title}</h3>
                                    <Badge className={cn(
                                        "font-black text-[8px] uppercase tracking-widest px-3",
                                        type.status === "Required" ? "bg-[#0C1B33] text-white" : "bg-slate-100 text-slate-400"
                                    )}>{type.status}</Badge>
                                </div>
                                <p className="text-sm font-medium leading-relaxed text-[#505d72]">
                                    {type.desc}
                                </p>
                            </section>
                        ))}

                        <section className="space-y-6">
                            <h2 className="text-2xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">Managing Preferences</h2>
                            <p className="text-lg font-medium leading-relaxed text-[#505d72]">
                                You can adjust your cookie settings at any time within your browser or by using our centralized preference manager. Note that disabling essential cookies will revoke your current OAuth sessions and require re-authentication.
                            </p>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-8 bg-[#0C1B33] rounded-[10px] text-white space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-3xl" />
                            <h4 className="text-xl font-extrabold font-plus-jakarta uppercase italic flex items-center gap-3">
                                <Cookie className="h-5 w-5 text-[#F9C80E]" /> Summary
                            </h4>
                            <ul className="space-y-4">
                                {[
                                    { icon: <ShieldCheck className="h-4 w-4" />, text: "Zero Third-Party Ad-Selling" },
                                    { icon: <Settings className="h-4 w-4" />, text: "Granular Control Center" },
                                    { icon: <Info className="h-4 w-4" />, text: "Anonymized Analytics Only" }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 items-center text-xs font-bold text-slate-300">
                                        <span className="text-[#3B82F6]">{item.icon}</span> {item.text}
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
