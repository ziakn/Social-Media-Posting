"use client";

import { Check, X } from "lucide-react";

export default function PricingFeatureMatrix({ features }) {
    return (
        <div className="hidden lg:block mb-32">
            <div className="text-center mb-16 space-y-2">
                <h2 className="text-2xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight uppercase">Technical Matrix</h2>
                <div className="w-12 h-1.5 bg-[#00A2FF] mx-auto rounded-full" />
            </div>
            <div className="overflow-hidden rounded-[10px] border border-[#E1E7EF] bg-white shadow-subtle">
                <table className="w-full text-left font-inter border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-[#E1E7EF]">
                            <th className="p-8 text-[#0C1B33] font-black uppercase text-[10px] tracking-widest font-plus-jakarta">Protocol Specs</th>
                            <th className="p-8 text-center font-black text-[#0C1B33] uppercase text-xs font-plus-jakarta">Starter</th>
                            <th className="p-8 text-center font-black text-[#00A2FF] uppercase text-xs font-plus-jakarta">Professional</th>
                            <th className="p-8 text-center font-black text-[#0C1B33] uppercase text-xs font-plus-jakarta">Enterprise</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-medium">
                        {features.map((f, i) => (
                            <tr key={i} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                <td className="p-8">
                                    <span className="text-[#3E4652] font-extrabold uppercase text-[11px] tracking-tight">{f.name}</span>
                                </td>
                                <td className="p-8 text-center">
                                    {typeof f.starter === 'boolean' ? (f.starter ? <Check className="h-4 w-4 mx-auto text-slate-400" /> : <X className="h-4 w-4 mx-auto text-slate-200" />) : <span className="text-slate-500 font-bold">{f.starter}</span>}
                                </td>
                                <td className="p-8 text-center bg-slate-50/30">
                                    {typeof f.pro === 'boolean' ? (f.pro ? <Check className="h-4 w-4 mx-auto text-[#00A2FF]" /> : <X className="h-4 w-4 mx-auto text-slate-200" />) : <span className="text-[#00A2FF] font-black">{f.pro}</span>}
                                </td>
                                <td className="p-8 text-center">
                                    {typeof f.enterprise === 'boolean' ? (f.enterprise ? <Check className="h-4 w-4 mx-auto text-[#0C1B33]" /> : <X className="h-4 w-4 mx-auto text-slate-200" />) : <span className="text-[#0C1B33] font-black">{f.enterprise}</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
