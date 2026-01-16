"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Trash2,
  ArrowRight,
  Lock,
  ShieldCheck,
  RefreshCcw,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function DataDeletionPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setSubmitted(true);
  };

  return (
    <main className="bg-white min-h-screen font-inter text-[#3E4652]">
      {/* Minimal Header */}
      <section className="pt-32 pb-16 border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-[1280px]">
          <div className="max-w-3xl space-y-6">
            <Link href="/help" className="inline-flex items-center gap-2 text-[10px] font-black text-[#00A2FF] uppercase tracking-widest hover:-translate-x-1 transition-transform">
              <ArrowRight className="h-4 w-4 rotate-180" /> Intelligence Hub
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] leading-none tracking-tighter font-plus-jakarta uppercase">
              Privacy Control: <br />
              <span className="text-slate-400">Request Data Deletion</span>
            </h1>
            <p className="text-lg text-[#3E4652] font-medium leading-relaxed">
              Protecting your digital identity is our primary mandate. Submit a formal request to purge your account and platform tokens from our encrypted nodes.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-[1280px]">
          <div className="grid lg:grid-cols-12 gap-16">

            {/* Information Area */}
            <div className="lg:col-span-7 space-y-12">
              <div className="space-y-8">
                <h2 className="text-2xl font-extrabold text-[#0C1B33] font-inter uppercase tracking-tight">The Deletion Protocol</h2>
                <p className="text-lg leading-relaxed font-medium">
                  When you submit a deletion request, SocialHub executes a multi-stage purging process across all global distribution nodes:
                </p>
                <ul className="space-y-6">
                  {[
                    { title: "Token Revocation", desc: "Every Instagram, TikTok, and Pinterest node token is immediately revoked and deleted from our hardware-isolated vault.", icon: <Lock className="h-5 w-5" /> },
                    { title: "Media Metadata Purging", desc: "All cached media assets and associated metadata are overwritten using AES-256 standard protocols.", icon: <Trash2 className="h-5 w-5" /> },
                    { title: "Analytic Node Wipe", desc: "Custom resonance weights and historical engagement data are permanently decoupled from your identity.", icon: <RefreshCcw className="h-5 w-5" /> }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-6 items-start group">
                      <div className="w-12 h-12 rounded-[10px] bg-slate-50 flex items-center justify-center text-[#00A2FF] border border-slate-100 group-hover:border-[#00A2FF]/20 transition-all shrink-0">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-[#0C1B33] uppercase text-base">{item.title}</h4>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-10 bg-slate-50 border border-slate-100 rounded-[10px] space-y-6 relative overflow-hidden">
                <ShieldCheck className="h-8 w-8 text-emerald-500 relative z-10" />
                <div className="space-y-2 relative z-10">
                  <h5 className="text-lg font-bold text-[#0C1B33] uppercase">GDPR & CCPA Compliant</h5>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    Our deletion architecture complies with the highest international privacy standards, ensuring your "Right to be Forgotten" is respected across all territories.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Area */}
            <aside className="lg:col-span-5">
              <div className="p-10 bg-white border border-slate-100 rounded-[10px] shadow-subtle space-y-8 sticky top-32">
                {submitted ? (
                  <div className="text-center space-y-6 py-8">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-extrabold text-[#0C1B33] font-inter uppercase tracking-tight">Request Received</h3>
                      <p className="text-sm font-medium text-slate-500">
                        A confirmation link has been sent to your registered email. You must click the link to authorize the deletion protocol.
                      </p>
                    </div>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-[10px] font-black text-[#00A2FF] uppercase tracking-widest hover:underline"
                    >
                      Submit another request
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authentication Required</h4>
                      <h3 className="text-2xl font-extrabold text-[#0C1B33] font-inter uppercase tracking-tight">Initialize Purge</h3>
                    </div>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g., commander@agency.com"
                          className="w-full h-14 bg-slate-50 border border-slate-100 rounded-[6px] px-4 text-sm font-medium focus:outline-none focus:border-[#00A2FF] transition-all font-dm-sans"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deletion Reason (Optional)</label>
                        <select className="w-full h-14 bg-slate-50 border border-slate-100 rounded-[6px] px-4 text-sm font-medium focus:outline-none focus:border-[#00A2FF] transition-all">
                          <option>Closing Business</option>
                          <option>Switching Platforms</option>
                          <option>Privacy Concerns</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-[6px] border border-amber-100 flex gap-4 items-start">
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                        <p className="text-[11px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                          CAUTION: This action is permanent. All historical analytics and nodes will be destroyed.
                        </p>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#EA5455] text-white font-black text-[10px] uppercase tracking-[0.2em] h-16 rounded-[6px] hover:scale-105 transition-all shadow-subtle shadow-[#EA5455]/20 font-inter"
                      >
                        Purge My Data
                      </button>
                    </form>
                  </>
                )}
              </div>
            </aside>

          </div>
        </div>
      </section>
    </main>
  );
}