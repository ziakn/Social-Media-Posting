"use client";

import Link from "next/link";
import { Check, ArrowRight, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function PricingPreview({ packages = [] }) {
    const [billingCycle, setBillingCycle] = useState("monthly");

    const basePlans = [
        {
            name: "Free",
            monthlyPrice: "0",
            yearlyPrice: "0",
            desc: "Perfect for individuals just starting out.",
            features: ["3 Social Accounts", "1 Team Member", "30 Scheduled Posts / mo", "Basic Analytics", "Centralize Gallery (Video, images)"],
            popular: false
        },
        {
            name: "Creator",
            monthlyPrice: "24",
            yearlyPrice: "19",
            popular: true,
            desc: "For influencers and serious content creators.",
            features: ["10 Social Accounts", "1 Team Member", "100 Monthly Posts", "Priority Support", "Centralize Gallery (Video, images)", "Advanced Scheduling Calendar", "Automatic Failed Post Recovery", "Invoices & Billing History", "Basic Analytics"]
        },
        {
            name: "Pro",
            monthlyPrice: "49",
            yearlyPrice: "39",
            desc: "For small teams and growing brands.",
            features: ["25 Social Accounts", "3 Team Members", "500 Monthly Posts", "Priority Support", "Centralize Gallery (Video, images)", "Advanced Scheduling Calendar", "Automatic Failed Post Recovery", "Invoices & Billing History", "Advanced Analytics"]
        },
        {
            name: "Agency",
            monthlyPrice: "129",
            yearlyPrice: "99",
            desc: "For agencies managing multiple clients.",
            features: ["50 Social Accounts", "10 Team Members", "5000 Monthly Posts", "Priority Support", "Centralize Gallery (Video, images)", "Advanced Scheduling Calendar", "Automatic Failed Post Recovery", "Invoices & Billing History", "Advanced Analytics"]
        }
    ];

    const displayPlans = basePlans;

    return (
        <section className="py-24 relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-[#5e4a7a]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
                <div className="text-center mb-16 space-y-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px] text-[0.8rem] font-bold uppercase tracking-widest text-[#5e4a7a]">
                        <Zap className="h-3.5 w-3.5 fill-[#5e4a7a]" />
                        Flexible Pricing
                    </span>
                    <h2 className="text-3xl md:text-[2.8rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[1.15]">
                        Simple, <span className="text-[#5e4a7a]">Transparent</span> Plans
                    </h2>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span
                            className={cn("text-[0.95rem] font-bold transition-colors cursor-pointer select-none", billingCycle === "monthly" ? "text-[#2d253b]" : "text-[#4a3d58]/60")}
                            onClick={() => setBillingCycle("monthly")}
                        >
                            Monthly
                        </span>

                        <div
                            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                            className="w-16 h-9 bg-[#e0dceb] rounded-full p-1 relative transition-colors duration-300 cursor-pointer hover:bg-[#d1cce0]"
                        >
                            <div className={cn(
                                "w-7 h-7 bg-[#5e4a7a] rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center",
                                billingCycle === "yearly" ? "translate-x-7" : "translate-x-0"
                            )} >
                                <Check className={cn("w-4 h-4 text-white transition-opacity", billingCycle === "yearly" ? "opacity-100" : "opacity-0")} />
                            </div>
                        </div>

                        <span
                            className={cn("text-[0.95rem] font-bold transition-colors flex items-center gap-2 cursor-pointer select-none", billingCycle === "yearly" ? "text-[#2d253b]" : "text-[#4a3d58]/60")}
                            onClick={() => setBillingCycle("yearly")}
                        >
                            Yearly <span className="text-[0.65rem] bg-white text-[#5e4a7a] px-2 py-0.5 rounded-full uppercase tracking-wide font-extrabold shadow-sm border border-[#5e4a7a]/20">Save 20%</span>
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    {displayPlans.map((plan, i) => (
                        <div key={i} className={`p-8 rounded-[32px] border flex flex-col transition-all duration-300 relative group overflow-hidden ${plan.popular
                            ? 'bg-[#5e4a7a] border-[#5e4a7a] text-white shadow-2xl scale-105 z-10'
                            : 'bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border-[rgba(255,255,255,0.6)] text-[#2d253b] shadow-lg hover:bg-[rgba(255,255,255,0.6)]'}`}>

                            {plan.popular && (
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-white to-white/80"></div>
                            )}

                            {plan.popular && (
                                <div className="absolute top-6 right-6">
                                    <span className="bg-white text-[#5e4a7a] font-bold text-[0.65rem] uppercase px-3 py-1 rounded-full tracking-widest shadow-lg"> Most Popular</span>
                                </div>
                            )}

                            <div className="mb-8 space-y-2 mt-2">
                                <h3 className="text-[1.4rem] font-bold tracking-tight">{plan.name}</h3>
                                <p className={`text-[0.9rem] font-normal leading-relaxed ${plan.popular ? 'text-slate-200' : 'text-[#4a3d58]'}`}>{plan.desc}</p>
                            </div>

                            <div className="flex items-baseline mb-8">
                                {plan.monthlyPrice !== "Custom" && <span className="text-3xl font-bold tracking-tighter">$</span>}
                                <span className="text-5xl font-bold tracking-tighter">
                                    {billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                                </span>
                                {plan.monthlyPrice !== "Custom" && <span className={`ml-1 text-[0.9rem] font-bold ${plan.popular ? 'text-slate-300' : 'text-[#6f5b8b]'}`}>/mo</span>}
                            </div>

                            {billingCycle === "yearly" && plan.monthlyPrice !== "0" && (
                                <div className={`-mt-6 mb-6 text-[0.75rem] font-bold ${plan.popular ? 'text-white/90' : 'text-[#5e4a7a]'}`}>
                                    Billed ${Number(plan.yearlyPrice) * 12} yearly
                                </div>
                            )}

                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-start gap-3 text-[0.85rem] font-medium group/item leading-snug">
                                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-white text-[#5e4a7a]' : 'bg-[#5e4a7a]/10 text-[#5e4a7a]'}`}>
                                            <Check className="h-2.5 w-2.5" />
                                        </div>
                                        <span className={plan.popular ? 'text-slate-100' : 'text-[#4a3d58]'}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/pricing" className="block mt-auto">
                                <button className={`w-full py-4 rounded-[16px] font-bold text-[0.85rem] uppercase tracking-widest transition-all shadow-md active:scale-95 ${plan.popular
                                    ? 'bg-white text-[#5e4a7a] hover:bg-white/90 shadow-white/20'
                                    : 'bg-[#2d253b] text-white hover:bg-[#3f3155] shadow-[#2d253b]/10'}`}>
                                    Start Now
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <Link href="/pricing" className="inline-flex items-center gap-2 text-[0.8rem] font-bold text-[#5e4a7a] uppercase tracking-widest hover:text-[#2d253b] transition-colors group">
                        View Full Feature Comparison Matrix <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
