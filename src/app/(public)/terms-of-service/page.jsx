import Link from "next/link";
import { Scale, ShieldCheck, Zap, FileText, ArrowLeft, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import NewFooter from "@/components/home/NewFooter";

export const metadata = {
  title: "Terms of Service | UNI.social Social Media Tool",
  description: "Read our terms of service to understand your rights and responsibilities when using UNI.social.",
};

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Authorized Use of Service",
      content: "UNI.social provides a programmatic interface for social media distribution. By using our service, you affirm that you have the legal right and authorization from the respective social platform holders (Meta, TikTok, LinkedIn, etc.) to manage the accounts connected to your dashboard."
    },
    {
      title: "2. Account Security & Token Responsibility",
      content: "You are solely responsible for maintaining the confidentiality of your account credentials and OAuth tokens. Any action taken via your authenticated dashboard is deemed to be authorized by you. We encrypt all tokens using AES-256 standards, but your local session security remains your responsibility."
    },
    {
      title: "3. Prohibited Conduct",
      content: "Users are strictly prohibited from utilizing UNI.social for spam, automated botting patterns that violate network TOCs, or any activity that compromises the integrity of the social graphs we interact with. Violation of these terms will result in immediate API revocation."
    },
    {
      title: "4. Service Level & Limitations",
      content: "While we aim for 99.9% uptime, UNI.social is subject to the availability of external platform APIs. We are not liable for outages, algorithm shifts, or account restrictions imposed by third-party social networks."
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
                Master Service Agreement
              </span>
              <h1 className="text-5xl md:text-[5.5rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[0.9] uppercase">
                Terms of <br /> <span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent italic">Service.</span>
              </h1>
            </div>
            <p className="text-xl font-[420] text-[#4a3d58] max-w-2xl leading-relaxed">
              Updated: January 15, 2026. This MSA governs your access to the <span className="font-bold">UNI.social</span> ecosystem and your use of our authorized platform connections.
            </p>
          </div>

          {/* --- Terms Content --- */}
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
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-[#5e4a7a]/10">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <h4 className="font-bold text-lg uppercase tracking-tight">Termination Clause</h4>
                </div>
                <p className="text-[0.95rem] font-[420] leading-relaxed text-[#4a3d58]/80">
                  UNI.social reserves the right to suspend or terminate access for any account found to be engaging in "high-velocity spam" patterns or utilizing unauthorized API workarounds. We maintain a zero-tolerance policy for network integrity violations.
                </p>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-4 space-y-10">
              <div className="p-8 md:p-10 bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] rounded-[40px] text-white space-y-10 relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 blur-[120px] pointer-events-none group-hover:bg-white/10 transition-colors" />
                <h4 className="text-xl font-[650] uppercase italic flex items-center gap-4 relative z-10">
                  <Scale className="h-6 w-6 text-white fill-current" /> Policy Compliance
                </h4>
                <ul className="space-y-6 relative z-10">
                  {[
                    { icon: <Zap className="h-5 w-5" />, text: "Official Platform API User" },
                    { icon: <ShieldCheck className="h-5 w-5" />, text: "Authorized OAuth 2.0 Flow" },
                    { icon: <FileText className="h-5 w-5" />, text: "Enterprise SLA Support" }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-5 items-center text-[0.85rem] font-bold text-white/80">
                      <span className="text-white bg-white/10 p-2.5 rounded-xl border border-white/20">{item.icon}</span> {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-10 bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] rounded-[40px] shadow-xl space-y-8">
                <h5 className="text-[0.65rem] font-bold text-[#4a3d58]/60 uppercase tracking-[0.2em] px-2">Questions?</h5>
                <p className="text-[0.85rem] font-bold text-[#4a3d58]/50 leading-relaxed max-w-[200px]">For legal clarifications regarding our MSA, contact:</p>
                <Link
                  href="mailto:legal@uni.social"
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/60 hover:bg-[#5e4a7a] transition-all duration-300"
                >
                  <span className="text-[0.95rem] font-bold text-[#2d253b] group-hover:text-white transition-colors">legal@uni.social</span>
                  <ArrowRight className="h-4 w-4 text-[#5e4a7a] group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <NewFooter />
      </div>
    </main>
  );
}