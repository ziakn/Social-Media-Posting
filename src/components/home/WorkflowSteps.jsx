"use client";

import { UserCheck, UploadCloud, Rocket, BarChart2 } from "lucide-react";

const steps = [
    {
        icon: <UserCheck className="h-7 w-7" />,
        title: "Connect Your Accounts",
        desc: "Securely link your TikTok, Pinterest, and Instagram accounts in just a few clicks."
    },
    {
        icon: <UploadCloud className="h-7 w-7" />,
        title: "Upload & Optimize",
        desc: "Upload your media and use our AI tools to tailor it for every social network."
    },
    {
        icon: <Rocket className="h-7 w-7" />,
        title: "Publish & Schedule",
        desc: "Share your content instantly or schedule it for the best times to reach your followers."
    },
    {
        icon: <BarChart2 className="h-7 w-7" />,
        title: "Track Your Success",
        desc: "Monitor your engagement and see how your audience is growing across your social profiles."
    }
];

export default function WorkflowSteps() {
    return (
        <section className="w-full my-16 md:my-20">
            <div className="text-center mb-16">
                <span className="bg-[rgba(225,215,245,0.4)] backdrop-blur-[4px] py-2 px-6 rounded-[60px] text-[0.85rem] font-semibold uppercase tracking-[0.04em] text-[#4e3d64] border border-[rgba(255,255,255,0.5)] inline-flex items-center gap-2 mb-6">
                    <i className="fas fa-layer-group"></i> workflow
                </span>
                <h2 className="text-3xl md:text-[2.5rem] font-[650] tracking-[-0.03em] leading-[1.2] text-[#2d253b] m-0">
                    How Multi-Platform <span className="text-[#5e4a7a]">Scheduling Works</span>
                </h2>
                <p className="text-[1.05rem] text-[#4a3d58] mt-4 font-[420] max-w-2xl mx-auto">
                    A high-velocity workflow designed for professional scale.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative px-4">
                {/* Connector Line (Desktop) - Adjusted for new design */}
                <div className="hidden lg:block absolute top-[45px] left-[10%] right-[10%] h-[2px] bg-[rgba(160,140,190,0.2)] z-0 border-t border-[rgba(255,255,255,0.5)] border-dashed border-b-0 h-0" />

                {steps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center text-center relative z-10 group">
                        <div className="w-[90px] h-[90px] rounded-[24px] bg-[rgba(255,255,255,0.6)] border border-[rgba(255,255,255,0.8)] backdrop-blur-[6px] flex items-center justify-center text-[#5e4a7a] shadow-sm mb-6 relative transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:bg-white">
                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#5e4a7a] text-white flex items-center justify-center font-bold text-sm border-2 border-[#f7f4fc]">
                                {i + 1}
                            </div>
                            {step.icon}
                        </div>

                        <div className="bg-[rgba(255,255,255,0.4)] backdrop-blur-[4px] rounded-[24px] p-6 border border-[rgba(255,255,255,0.5)] w-full h-full transition-all hover:bg-[rgba(255,255,255,0.55)]">
                            <h3 className="text-[1.2rem] font-[620] text-[#2d253b] mb-3 tracking-[-0.02em]">{step.title}</h3>
                            <p className="text-[0.95rem] text-[#4a3d58] leading-[1.6] font-[400]">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
