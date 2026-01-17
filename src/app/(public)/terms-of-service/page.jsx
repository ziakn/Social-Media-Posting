
import Link from "next/link";
import { Scale, ShieldCheck, Zap, FileText, ArrowLeft, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Terms of Service | SocialHub Social Media Tool",
  description: "Read our terms of service to understand your rights and responsibilities when using SocialHub.",
};

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Authorized Use of Service",
      content: "SocialHub provides a programmatic interface for social media distribution. By using our service, you affirm that you have the legal right and authorization from the respective social platform holders (Meta, TikTok, LinkedIn, etc.) to manage the accounts connected to your dashboard."
    },
    {
      title: "2. Account Security & Token Responsibility",
      content: "You are solely responsible for maintaining the confidentiality of your account credentials and OAuth tokens. Any action taken via your authenticated dashboard is deemed to be authorized by you. We encrypt all tokens using AES-256 standards, but your local session security remains your responsibility."
    },
    {
      title: "3. Prohibited Conduct",
      content: "Users are strictly prohibited from utilizing SocialHub for spam, automated botting patterns that violate network TOCs, or any activity that compromises the integrity of the social graphs we interact with. Violation of these terms will result in immediate API revocation."
    },
    {
      title: "4. Service Level & Limitations",
      content: "While we aim for 99.9% uptime, SocialHub is subject to the availability of external platform APIs. We are not liable for outages, algorithm shifts, or account restrictions imposed by third-party social networks."
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
            <Badge className="bg-[#0C1B33] text-white uppercase text-[9px] px-3 font-black tracking-widest">Master Service Agreement</Badge>
            <h1 className="text-4xl md:text-7xl font-extrabold text-[#0C1B33] tracking-tighter leading-[0.9] font-plus-jakarta uppercase">
              Terms of <br /> <span className="text-[#3B82F6]">Service.</span>
            </h1>
          </div>
          <p className="text-xl font-medium text-slate-500 max-w-2xl leading-relaxed">
            Updated: January 15, 2026. This MSA governs your access to the SocialHub ecosystem and your use of our authorized platform connections.
          </p>
        </div>

        {/* --- Terms Content --- */}
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
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h4 className="font-extrabold text-sm uppercase tracking-tight font-plus-jakarta">Termination Clause</h4>
              </div>
              <p className="text-sm font-medium leading-relaxed text-slate-500">
                SocialHub reserves the right to suspend or terminate access for any account found to be engaging in "high-velocity spam" patterns or utilizing unauthorized API workarounds. We maintain a zero-tolerance policy for network integrity violations.
              </p>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 bg-[#0C1B33] rounded-[10px] text-white space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-3xl" />
              <h4 className="text-xl font-extrabold font-plus-jakarta uppercase italic flex items-center gap-3">
                <Scale className="h-5 w-5 text-[#F9C80E]" /> Policy Compliance
              </h4>
              <ul className="space-y-4">
                {[
                  { icon: <Zap className="h-4 w-4" />, text: "Official Platform API User" },
                  { icon: <ShieldCheck className="h-4 w-4" />, text: "Authorized OAuth 2.0 Flow" },
                  { icon: <FileText className="h-4 w-4" />, text: "Enterprise SLA Support" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-center text-xs font-bold text-slate-300">
                    <span className="text-[#3B82F6]">{item.icon}</span> {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 border border-[#E1E7EF] rounded-[10px] space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions?</h5>
              <p className="text-xs font-bold text-slate-400">For legal clarifications regarding our MSA, contact:</p>
              <Link href="mailto:legal@socialhub.com" className="block text-sm font-black text-[#3B82F6] uppercase tracking-widest hover:underline">legal@socialhub.com</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}