"use client";

import { CheckCircle } from "lucide-react";

export default function TestimonialsSection() {
    return (
        <section className="py-20 bg-white relative overflow-hidden font-inter">
            {/* Background Noise/Texture Effect would be nice here, keeping it clean for now */}
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="text-center mb-24 space-y-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight leading-tight uppercase">
                        The Professional <br /> <span className="text-[#3B82F6]">Standard for 12k+</span> Teams
                    </h2>
                    <div className="flex justify-center gap-4 pt-4">
                        <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 border border-slate-100 rounded-full">
                            <CheckCircle className="h-4 w-4 text-[#27C93F]" />
                            <span className="text-[10px] font-black text-[#0C1B33] uppercase tracking-widest font-plus-jakarta">Verified Results</span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {[
                        {
                            name: "Sarah Miller",
                            role: "Sr. Agency Lead",
                            text: "SocialHub has cut our client reporting time by 60%. The normalized metrics across TikTok and Insta are game-changers for our high-velocity units.",
                            img: "SM"
                        },
                        {
                            name: "David Chen",
                            role: "Solo Creator",
                            text: "The AI Media Lab handles all my resizing instantly. I went from 2 to 6 platforms overnight without an assistant. Pure operational efficiency.",
                            img: "DC"
                        },
                        {
                            name: "Global Retail",
                            role: "E-comm Brand",
                            text: "Enterprise security and team permissions were the selling point for us. It just works, every single time. Our distribution nodes are 100% reliable.",
                            img: "GR"
                        }
                    ].map((test, i) => (
                        <div key={i} className="p-10 bg-[#F5F8FB] rounded-[10px] border border-slate-100 hover:border-[#3B82F6]/20 hover:shadow-subtle hover:-translate-y-1 transition-all relative group">
                            <div className="text-5xl font-black text-[#0C1B33]/5 absolute top-4 right-6 pointer-events-none group-hover:text-[#3B82F6]/10 transition-colors">"</div>
                            <p className="text-lg text-[#3E4652] font-medium leading-relaxed italic mb-10 relative z-10 transition-colors group-hover:text-[#0C1B33]">"{test.text}"</p>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-full bg-[#0C1B33] flex items-center justify-center text-[#F9C80E] font-black text-sm font-plus-jakarta border-2 border-white shadow-sm">
                                    {test.img}
                                </div>
                                <div>
                                    <div className="text-sm font-black text-[#0C1B33] uppercase tracking-widest font-plus-jakarta">{test.name}</div>
                                    <div className="text-xs font-bold text-slate-400 font-inter">{test.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
