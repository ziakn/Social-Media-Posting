"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingCards({ plans, isAnnual }) {
    return (
        <div className="grid md:grid-cols-3 gap-8 mb-32 items-stretch">
            {plans.map((plan) => (
                <div
                    key={plan.id}
                    className={cn(
                        "relative p-10 rounded-[10px] border transition-all duration-500 flex flex-col hover:shadow-subtle hover:-translate-y-2",
                        plan.popular
                            ? "border-[#00A2FF] bg-white ring-1 ring-[#00A2FF] shadow-subtle scale-105 z-10"
                            : "border-[#E1E7EF] bg-white hover:border-slate-300 shadow-sm"
                    )}
                >
                    {plan.popular && (
                        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#0C1B33] text-[#F9C80E] text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg font-plus-jakarta">
                            Protocol Recommendation
                        </div>
                    )}

                    <div className="mb-10 space-y-4">
                        <h3 className="text-2xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">{plan.name}</h3>
                        <p className="text-[#3E4652] font-medium text-sm leading-relaxed font-inter">{plan.description}</p>
                    </div>

                    <div className="mb-10">
                        <div className="flex items-baseline">
                            {!plan.price.includes("Custom") && <span className="text-5xl font-extrabold text-[#0C1B33] tracking-tighter font-plus-jakarta">$</span>}
                            <span className={cn("font-extrabold text-[#0C1B33] tracking-tighter font-plus-jakarta", plan.price.includes("Custom") ? "text-4xl" : "text-6xl")}>{plan.price}</span>
                            {!plan.price.includes("Custom") && <span className="ml-2 text-slate-400 font-bold text-lg font-inter">/mo</span>}
                        </div>
                        {isAnnual && !plan.price.includes("Custom") && (
                            <p className="text-[10px] text-[#28C76F] font-black mt-2 uppercase tracking-widest font-plus-jakarta">Billed annually</p>
                        )}
                    </div>

                    <ul className="space-y-4 mb-12 flex-1 font-inter">
                        {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-4">
                                <Check className="h-4 w-4 mt-0.5 text-[#00A2FF] flex-shrink-0" strokeWidth={3} />
                                <span className="text-[#3E4652] font-bold text-sm tracking-tight">{f}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        className={cn(
                            "w-full h-16 rounded-[6px] text-sm font-black transition-all font-plus-jakarta uppercase tracking-widest active:scale-95 hover:-translate-y-0.5 shadow-sm hover:shadow-subtle mt-auto",
                            plan.popular
                                ? "bg-[#F9C80E] text-[#0C1B33] hover:bg-[#eac00d]"
                                : plan.id === "enterprise"
                                    ? "bg-[#0C1B33] text-white hover:bg-slate-800"
                                    : "border-2 border-[#0C1B33] text-[#0C1B33] hover:bg-slate-50"
                        )}
                    >
                        {plan.cta}
                    </button>
                    {plan.id !== "enterprise" && (
                        <p className="text-[10px] text-center text-slate-400 font-bold mt-4 uppercase tracking-widest font-plus-jakarta">Zero Latency Setup</p>
                    )}
                </div>
            ))}
        </div>
    );
}
