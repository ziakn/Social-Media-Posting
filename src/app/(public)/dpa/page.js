import Link from "next/link";
import { Shield, FileCheck, Users, Globe, Lock, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
    title: "Data Processing Agreement (DPA) | UNI.social",
    description: "Our Data Processing Agreement (DPA) outlines how we handle personal data on behalf of our customers.",
};

export default function DPAPage() {
    return (
        <main className="bg-white min-h-screen font-[420] text-slate-600 leading-relaxed">
            {/* 🚀 Simple Header */}
            <section className="pt-32 pb-16 bg-slate-50 border-b border-slate-100">
                <div className="container mx-auto px-6 max-w-[800px]">
                    <Link href="/" className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-8 hover:gap-4 transition-all">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Link>
                    <div className="space-y-4">
                        <Badge className="bg-primary/5 text-primary border-primary/10 uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-bold">Privacy Center</Badge>
                        <h1 className="text-4xl md:text-5xl font-[650] text-slate-900 uppercase tracking-tighter">Data Processing Agreement</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Last Updated: February 12, 2026</p>
                    </div>
                </div>
            </section>

            {/* 📄 Content */}
            <section className="py-24 container mx-auto px-6 max-w-[800px] prose prose-slate">
                <div className="space-y-16">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <Shield className="h-6 w-6 text-primary" /> 1. Overview
                        </h2>
                        <p>
                            This Data Processing Agreement ("DPA") forms part of the Terms of Service between UNI.social and the Customer.
                            It reflects the parties' agreement with regard to the processing of Personal Data.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <FileCheck className="h-6 w-6 text-primary" /> 2. Roles and Responsibilities
                        </h2>
                        <ul className="list-disc pl-6 space-y-4">
                            <li><strong>Customer as Controller:</strong> The Customer determines the purposes and means of processing Personal Data.</li>
                            <li><strong>UNI.social as Processor:</strong> UNI.social processes Personal Data only on behalf of and in accordance with the Customer’s instructions.</li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <Users className="h-6 w-6 text-primary" /> 3. Sub-processors
                        </h2>
                        <p>
                            UNI.social may engage sub-processors to provide aspects of the Service. A current list of sub-processors (including AWS, Firebase, Stripe)
                            is available upon request or via our Security Portal.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <Globe className="h-6 w-6 text-primary" /> 4. Data Transfers
                        </h2>
                        <p>
                            Personal Data may be processed in the United States or any other country in which UNI.social or its sub-processors maintain facilities.
                            We ensure all transfers comply with applicable data protection laws.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <Lock className="h-6 w-6 text-primary" /> 5. Security Measures
                        </h2>
                        <p>
                            UNI.social maintains appropriate technical and organizational measures to protect Personal Data against unauthorized or unlawful processing,
                            as detailed in our Security Policy.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
