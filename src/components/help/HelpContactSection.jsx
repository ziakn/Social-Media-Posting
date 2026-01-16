"use client";

import { Mail, MessageSquare } from "lucide-react";

export default function HelpContactSection() {
    return (
        <section className="py-24 bg-slate-50 border-t border-slate-100 font-inter">
            <div className="container mx-auto px-6 max-w-[1280px] text-center space-y-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">Still Need Assistance?</h2>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="p-10 bg-white border border-slate-100 rounded-[10px] shadow-sm hover:shadow-subtle transition-all text-center space-y-6">
                        <Mail className="h-8 w-8 text-[#00A2FF] mx-auto" />
                        <h4 className="text-xl font-bold text-[#0C1B33] font-plus-jakarta uppercase">Email Resonance</h4>
                        <p className="text-sm font-medium text-slate-500 font-inter">Typical response time: &lt; 2 hours for protocol members.</p>
                        <a href="mailto:support@socialhub.ai" className="text-[#00A2FF] font-black text-sm uppercase tracking-widest hover:underline font-plus-jakarta">support@socialhub.ai</a>
                    </div>
                    <div className="p-10 bg-white border border-slate-100 rounded-[10px] shadow-sm hover:shadow-subtle transition-all text-center space-y-6">
                        <MessageSquare className="h-8 w-8 text-[#00A2FF] mx-auto" />
                        <h4 className="text-xl font-bold text-[#0C1B33] font-plus-jakarta uppercase">Priority Live Chat</h4>
                        <p className="text-sm font-medium text-slate-500 font-inter">Direct access to growth engineers for active subscribers.</p>
                        <button className="text-[#00A2FF] font-black text-sm uppercase tracking-widest hover:underline font-plus-jakarta">Start Chat Now</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
