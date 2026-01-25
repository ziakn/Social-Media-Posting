"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export default function PricingPreview({ packages = [] }) {
    // Transform database packages into the format expected by the UI
    const plans = (packages || []).reduce((acc, pkg) => {
        // Find existing plan or create new one
        let plan = acc.find(p => p.name === pkg.name);

        // Prefer annual pricing for the homepage preview if both exist
        if (!plan || pkg.billingCycle === 'yearly') {
            const transformed = {
                name: pkg.name,
                price: pkg.price === 0 ? "0" : pkg.price || "Custom",
                desc: pkg.description,
                features: pkg.features || [],
                popular: pkg.isPopular || false,
                order: pkg.order || 0
            };

            if (!plan) {
                acc.push(transformed);
            } else {
                // Update existing plan with annual data
                Object.assign(plan, transformed);
            }
        }
        return acc;
    }, []).sort((a, b) => a.order - b.order);

    // Provide fallback if no packages in DB
    const displayPlans = plans.length > 0 ? plans : [
        {
            name: "Starter",
            price: "0",
            desc: "Perfect for solo creators",
            features: ["3 Social Profiles", "15 Posts / Month", "AI Basic Lab", "Standard Analytics"]
        },
        {
            name: "Professional",
            price: "49",
            popular: true,
            desc: "For high-velocity teams",
            features: ["15 Social Profiles", "Unlimited Posts", "AI Lab v4.0 Full", "Advanced ROI Tracking"]
        },
        {
            name: "Agency",
            price: "199",
            desc: "For growing agencies",
            features: ["50 Social Profiles", "Bulk Scheduling", "Multi-User Access", "White-Label Reports"]
        },
        {
            name: "Enterprise",
            price: "Custom",
            desc: "Global infrastructure",
            features: ["Unlimited Nodes", "Custom API Access", "99.9% SLA Protocol", "Dedicated Support"]
        }
    ];

    return (
        <section className="py-32 bg-white font-inter">
            <div className="container mx-auto px-6 max-w-[1400px]">
                <div className="text-center mb-24 space-y-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight leading-tight uppercase">
                        Simple, <span className="text-[#3B82F6]">Transparent</span> Protocol
                    </h2>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto font-inter">
                        Scale your social graph with zero hidden latency.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayPlans.map((plan, i) => (
                        <div key={i} className={`p-8 rounded-[10px] border flex flex-col transition-all duration-500 relative group ${plan.popular ? 'bg-[#0C1B33] border-[#0C1B33] text-white shadow-2xl -translate-y-4' : 'bg-white border-slate-200 text-[#0C1B33] shadow-sm hover:shadow-subtle hover:border-[#3B82F6]/30'}`}>

                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#F9C80E] text-[#0C1B33] font-black text-[10px] uppercase px-4 py-1.5 rounded-full tracking-widest z-10 animate-pulse">Most Popular Protocol</div>
                            )}

                            <div className="mb-10 space-y-3">
                                <h3 className="text-2xl font-extrabold font-plus-jakarta uppercase tracking-tight">{plan.name}</h3>
                                <p className={`text-sm font-medium ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                            </div>

                            <div className="flex items-baseline mb-10">
                                {plan.price !== "Custom" && <span className="text-4xl font-black font-plus-jakarta tracking-tighter">$</span>}
                                <span className="text-6xl font-black font-plus-jakarta tracking-tighter">{plan.price}</span>
                                {plan.price !== "Custom" && <span className="ml-2 text-slate-500 font-bold">/mo</span>}
                            </div>

                            <ul className="space-y-6 mb-12 flex-1">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-center gap-4 text-xs font-bold font-inter group/item">
                                        <Check className={`h-4 w-4 shrink-0 transition-transform group-hover/item:scale-150 ${plan.popular ? 'text-[#F9C80E]' : 'text-[#3B82F6]'}`} />
                                        <span className={plan.popular ? 'text-slate-300' : 'text-slate-500'}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/pricing" className="block">
                                <button className={`w-full py-5 rounded-[6px] font-black text-sm uppercase tracking-widest transition-all font-plus-jakarta active:scale-95 ${plan.popular ? 'bg-[#F9C80E] text-[#0C1B33] hover:bg-[#eac00d]' : 'bg-[#0C1B33] text-white hover:bg-slate-800'}`}>
                                    Deploy Protocol
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <Link href="/pricing" className="inline-flex items-center gap-2 text-[10px] font-black text-[#3B82F6] uppercase tracking-widest hover:underline font-plus-jakarta">
                        View Full Feature Comparison Matrix <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
