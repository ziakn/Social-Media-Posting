"use client";

import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingFeatureMatrix({ features }) {
    return (
        <div className="hidden lg:block mb-32 font-inter">
            <div className="text-center mb-16 space-y-2">
                <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Compare Plans & Features</h2>
                <p className="text-[#6B7280] font-medium text-sm">Everything you need to grow your social presence.</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                            <th className="p-6 text-[#111827] font-semibold text-sm">Feature</th>
                            <th className="p-6 text-center text-[#111827] font-semibold text-sm">Free</th>
                            <th className="p-6 text-center text-[#4F46E5] font-semibold text-sm">Professional</th>
                            <th className="p-6 text-center text-[#111827] font-semibold text-sm">Enterprise</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {features.map((f, i) => (
                            <tr key={i} className="group hover:bg-gray-50/50 transition-colors border-b border-[#E5E7EB] last:border-0">
                                <td className="p-6">
                                    <span className="text-[#374151] font-medium">{f.name}</span>
                                </td>
                                <td className="p-6 text-center">
                                    {typeof f.free === 'boolean' ? (
                                        f.free ? <Check className="h-5 w-5 mx-auto text-green-500" /> : <Minus className="h-5 w-5 mx-auto text-gray-300" />
                                    ) : (
                                        <span className="text-[#6B7280] font-medium">{f.free}</span>
                                    )}
                                </td>
                                <td className="p-6 text-center bg-indigo-50/20">
                                    {typeof f.pro === 'boolean' ? (
                                        f.pro ? <Check className="h-5 w-5 mx-auto text-[#4F46E5]" /> : <Minus className="h-5 w-5 mx-auto text-gray-300" />
                                    ) : (
                                        <span className="text-[#4F46E5] font-bold">{f.pro}</span>
                                    )}
                                </td>
                                <td className="p-6 text-center">
                                    {typeof f.enterprise === 'boolean' ? (
                                        f.enterprise ? <Check className="h-5 w-5 mx-auto text-[#111827]" /> : <Minus className="h-5 w-5 mx-auto text-gray-300" />
                                    ) : (
                                        <span className="text-[#111827] font-bold">{f.enterprise}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
