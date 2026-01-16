"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Code2,
    Terminal,
    Cpu,
    ShieldCheck,
    Zap,
    ArrowRight,
    FileCode,
    Key,
    Webhook,
    Server,
    Cloud
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DevelopersPage() {
    const [activeTab, setActiveTab] = useState("nodejs");

    const codeExamples = {
        nodejs: `const socialhub = require('@socialhub/sdk');\n\nconst client = new socialhub.Client({\n  apiKey: process.env.SOCIALHUB_API_KEY\n});\n\nawait client.posts.create({\n  content: "Hello from the 2026 API!",\n  platforms: ["tiktok", "threads"],\n  scheduledAt: "2026-06-01T12:00:00Z"\n});`,
        python: `import socialhub\n\nclient = socialhub.Client(api_key='YOUR_API_KEY')\n\nclient.posts.create(\n    content="Hello from the 2026 API!",\n    platforms=["tiktok", "threads"],\n    scheduled_at="2026-06-01T12:00:00Z"\n)`,
        curl: `curl -X POST https://api.socialhub.com/v4/posts \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "content": "Hello from the 2026 API!",\n    "platforms": ["tiktok", "threads"]\n  }'`
    };

    return (
        <div className="bg-white pt-32 pb-24 font-plus-jakarta text-[#3E4652]">
            <div className="container mx-auto px-6 max-w-[1280px]">

                {/* --- Hero --- */}
                <div className="max-w-4xl mx-auto text-center mb-32 space-y-6">
                    <Badge className="bg-slate-50 text-[#00A2FF] border-[#E1E7EF] uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black">Engineering Portal</Badge>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-[#0C1B33] tracking-tighter leading-none font-plus-jakarta lowercase">
                        Programmatic <span className="text-[#00A2FF]">influence.</span>
                    </h1>
                    <p className="text-xl text-[#3E4652] font-medium leading-relaxed max-w-2xl mx-auto">
                        Integrate 2026-grade social automation into your own stack. Robust REST APIs, real-time webhooks, and official SDKs.
                    </p>
                </div>

                {/* --- Tooling Grid --- */}
                <div className="grid md:grid-cols-3 gap-8 mb-40">
                    {[
                        { icon: <FileCode className="h-5 w-5" />, title: "REST API v4", desc: "Predictable, resource-oriented URLs with JSON-encoded responses and OAuth 2.0." },
                        { icon: <Webhook className="h-5 w-5" />, title: "Webhooks", desc: "Real-time event streaming for publish events, analytics updates, and incoming DMs." },
                        { icon: <Server className="h-5 w-5" />, title: "Official SDKs", desc: "Native wrappers for Node.js, Python, Go, and Ruby to accelerate your integration." }
                    ].map((tech, i) => (
                        <div key={i} className="p-8 border border-[#E1E7EF] rounded-[10px] bg-white hover:border-[#00A2FF] shadow-sm hover:shadow-subtle hover:-translate-y-1 transition-all group">
                            <div className="w-12 h-12 bg-[#F5F8FB] rounded-[6px] flex items-center justify-center text-[#0C1B33] mb-8 group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-colors">{tech.icon}</div>
                            <h3 className="text-lg font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight mb-4">{tech.title}</h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">{tech.desc}</p>
                            <Link href="#" className="flex items-center gap-2 text-[10px] font-black uppercase text-[#00A2FF] tracking-widest pt-4 border-t border-slate-50">
                                Read Documentation <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* --- Code Preview Section --- */}
                <div className="mb-40 grid lg:grid-cols-2 gap-20 items-stretch">
                    <div className="space-y-8 py-10">
                        <h2 className="text-4xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tighter uppercase leading-tight">Scale with <br /> authorized code.</h2>
                        <p className="text-lg font-medium leading-relaxed max-w-md text-slate-500">
                            Our SDKs follow best practices for concurrency and token management. Built-in retry logic and rate-limit handling come standard.
                        </p>
                        <div className="space-y-4">
                            {[
                                "OAuth 2.0 Auth Code Flow support",
                                "Automatic Token Refresh handling",
                                "Idempotency Keys for all writes",
                                "TLS 1.3 End-to-end encryption"
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-center font-bold text-[#0C1B33]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00A2FF]" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0C1B33] rounded-[10px] border border-white/10 shadow-subtle relative overflow-hidden flex flex-col hover:shadow-lg transition-all">
                        <div className="flex bg-white/5 border-b border-white/10">
                            {["nodejs", "python", "curl"].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setActiveTab(lang)}
                                    className={cn(
                                        "px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors font-plus-jakarta",
                                        activeTab === lang ? "bg-white/10 text-[#F9C80E] border-b-2 border-[#F9C80E]" : "text-slate-500 hover:text-white"
                                    )}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                        <div className="p-8 flex-1 overflow-auto scrollbar-hide">
                            <pre className="font-mono text-sm leading-relaxed text-blue-100">
                                <code>{codeExamples[activeTab]}</code>
                            </pre>
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center px-8">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">socialhub-sdk-v4.0.2</span>
                            <button className="text-[9px] font-black text-[#F9C80E] uppercase tracking-widest hover:underline">Copy snippet</button>
                        </div>
                    </div>
                </div>

                {/* --- System Performance --- */}
                <div className="bg-[#F5F8FB] rounded-[10px] border border-[#E1E7EF] p-12 md:p-20 relative overflow-hidden mb-40">
                    <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                        <div className="space-y-6">
                            <Badge className="bg-[#0C1B33] text-white uppercase text-[9px] px-3 font-black">Authorized API Connections</Badge>
                            <h2 className="text-3xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">Zero-Brittle <br /> Infrastructure.</h2>
                            <p className="text-[#3E4652] font-medium leading-relaxed">
                                SocialHub avoids web-scrapers and grey-market APIs. We utilize direct, enterprise-authorized endpoints granted by platform providers.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { icon: <Zap className="h-5 w-5" />, label: "Peak Capacity", value: "2M ops/sec" },
                                { icon: <ShieldCheck className="h-5 w-5" />, label: "Encryption", value: "AES-256" },
                                { icon: <Cloud className="h-5 w-5" />, label: "Edge Zones", value: "6 Global" },
                                { icon: <ArrowRight className="h-5 w-5 rotate-45" />, label: "Success Rate", value: "99.9%" }
                            ].map((stat, i) => (
                                <div key={i} className="p-6 bg-white border border-[#E1E7EF] rounded-[10px] space-y-3 shadow-sm hover:shadow-subtle hover:-translate-y-0.5 transition-all">
                                    <div className="text-[#00A2FF]">{stat.icon}</div>
                                    <div className="space-y-0.5">
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                        <div className="text-2xl font-black text-[#0C1B33] font-plus-jakarta tracking-tighter">{stat.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Call to Action --- */}
                <div className="bg-[#0C1B33] rounded-[10px] p-12 md:p-24 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/4 h-full bg-[#00A2FF]/10 blur-3xl pointer-events-none" />
                    <h2 className="text-4xl md:text-6xl font-extrabold font-plus-jakarta tracking-tighter mb-10">Start building <br /> your voice.</h2>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/auth/register">
                            <button className="bg-[#F9C80E] text-[#0C1B33] rounded-[6px] px-12 h-16 font-black text-lg hover:bg-[#eac00d] transition-all hover:shadow-subtle hover:-translate-y-0.5 active:scale-95">
                                Get API Credentials
                            </button>
                        </Link>
                        <Link href="mailto:api@socialhub.com">
                            <button className="border-2 border-white/20 text-white rounded-[6px] px-12 h-16 font-bold text-lg hover:bg-white/5 transition-all hover:-translate-y-0.5 active:scale-95">
                                Talk to API Support
                            </button>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
