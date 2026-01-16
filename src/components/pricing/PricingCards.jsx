"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function PricingCards({ plans, isAnnual }) {
    return (
        <div className="grid md:grid-cols-3 gap-6 mb-24 items-stretch">
            {plans.map((plan) => (
                <div
                    key={plan.id}
                    className={cn(
                        "relative p-8 rounded-[10px] border transition-all duration-300 flex flex-col hover:shadow-lg hover:-translate-y-1 bg-white",
                        plan.popular
                            ? "border-[#FBBF24] ring-1 ring-[#FBBF24] shadow-md z-10"
                            : "border-[#E5E7EB] hover:border-gray-300 shadow-sm"
                    )}
                >
                    {plan.popular && (
                        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#FBBF24] text-[#111827] text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm font-inter">
                            Most Popular
                        </div>
                    )}

                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-[#111827] font-inter mb-2">
                            {plan.name}
                        </h3>
                        <p className="text-[#6B7280] text-sm leading-relaxed font-inter">
                            {plan.description}
                        </p>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-[#111827] tracking-tight font-inter">
                                {plan.price === "0" ? "Free" : `$${plan.price}`}
                            </span>
                            {plan.price !== "0" && plan.id !== "enterprise" && (
                                <span className="text-[#6B7280] font-medium text-base font-inter">/mo</span>
                            )}
                            {plan.id === "enterprise" && (
                                <span className="text-[#6B7280] font-medium text-base font-inter">+</span>
                            )}
                        </div>
                        {isAnnual && plan.price !== "0" && plan.id !== "enterprise" && (
                            <p className="text-[11px] text-[#166534] font-semibold mt-1 uppercase tracking-wider font-inter">
                                Billed annually
                            </p>
                        )}
                    </div>

                    <ul className="space-y-3.5 mb-10 flex-1 font-inter">
                        {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-1 bg-indigo-50 rounded-full p-0.5">
                                    <Check className="h-3 w-3 text-[#4F46E5]" strokeWidth={3} />
                                </div>
                                <span className="text-[#374151] font-medium text-sm tracking-tight">{f}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-auto">
                        <Link href={plan.id === "enterprise" ? "/contact" : "/auth/signup"} className="block w-full">
                            <button
                                className={cn(
                                    "w-full h-12 rounded-lg text-sm font-semibold transition-all font-inter active:scale-95 shadow-sm",
                                    plan.popular
                                        ? "bg-[#4F46E5] text-white hover:bg-indigo-700 shadow-indigo-100"
                                        : plan.id === "enterprise"
                                            ? "bg-white border-2 border-[#111827] text-[#111827] hover:bg-gray-50"
                                            : "bg-white border border-[#E5E7EB] text-[#111827] hover:bg-gray-50"
                                )}
                            >
                                {plan.cta}
                            </button>
                        </Link>
                        {plan.id === "free" && (
                            <p className="text-[11px] text-center text-[#6B7280] font-medium mt-3 font-inter uppercase tracking-wide">
                                No credit card required
                            </p>
                        )}
                        {plan.id === "pro" && (
                            <p className="text-[11px] text-center text-[#6B7280] font-medium mt-3 font-inter uppercase tracking-wide">
                                Start with 14-day free trial
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
