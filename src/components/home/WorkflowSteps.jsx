"use client";

import { UserCheck, UploadCloud, Rocket, BarChart2 } from "lucide-react";

const steps = [
    {
        icon: <UserCheck className="h-6 w-6" />,
        title: "Connect Accounts",
        desc: "Authorize your TikTok, Pinterest, and Instagram nodes via secure OAuth."
    },
    {
        icon: <UploadCloud className="h-6 w-6" />,
        title: "Upload & AI Lab",
        desc: "Sync media and let AI Lab v4.0 generate platform-optimized resonance."
    },
    {
        icon: <Rocket className="h-6 w-6" />,
        title: "Instant Publish",
        desc: "Execute multi-platform distribution or schedule for peak window triggers."
    },
    {
        icon: <BarChart2 className="h-6 w-6" />,
        title: "Track Entropy",
        desc: "Monitor engagement data and ROI signals across your entire social graph."
    }
];

export default function WorkflowSteps() {
    return (
        <section id="how-it-works" className="py-32 bg-slate-50 border-y border-slate-100 font-inter">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="text-center mb-24 space-y-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight uppercase">
                        How <span className="text-[#00A2FF]">Multi-Platform</span> Scheduling Works
                    </h2>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                        A high-velocity workflow designed for professional scale.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-12 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-12 z-0" />

                    {steps.map((step, i) => (
                        <div key={i} className="text-center space-y-8 relative z-10 group">
                            <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center text-[#0C1B33] mx-auto shadow-subtle group-hover:border-[#00A2FF]/20 group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-all duration-500 relative">
                                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#00A2FF] text-white flex items-center justify-center font-black text-sm font-plus-jakarta group-hover:bg-[#F9C80E] group-hover:text-[#0C1B33] transition-colors">
                                    {i + 1}
                                </div>
                                {step.icon}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">{step.title}</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
