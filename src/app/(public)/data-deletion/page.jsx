import Link from "next/link";
import { Trash2, ShieldAlert, Database, Info, ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Data Deletion | UNI.social",
  description: "Information on how to request the deletion of your data from the UNI.social platform.",
};

export default function DataDeletionPage() {
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
            <h1 className="text-4xl md:text-5xl font-[650] text-slate-900 uppercase tracking-tighter">Data Deletion</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Last Updated: February 12, 2026</p>
          </div>
        </div>
      </section>

      {/* 📄 Content */}
      <section className="py-24 container mx-auto px-6 max-w-[800px] prose prose-slate">
        <div className="space-y-16">
          {/* Introduction */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <h2 className="text-xl font-bold uppercase tracking-tight text-white m-0">Respecting Your Privacy</h2>
              <p className="text-slate-400 font-medium m-0">
                At UNI.social, we believe you should have full control over your data. If you wish to delete your account or any specific data associated with it,
                we provide a straightforward process to do so.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <Trash2 className="h-6 w-6 text-primary" /> 1. How to Delete Your Account
            </h2>
            <p>
              The easiest way to delete your data is to delete your account directly through the portal. This will trigger the permanent deletion of your
              profile, connected platform credentials, and scheduled posts.
            </p>
            <div className="pt-4">
              <Link href="/portal/settings" className="inline-flex items-center gap-3 bg-slate-100 px-6 py-4 rounded-2xl font-bold text-slate-900 hover:bg-primary hover:text-white transition-all group">
                Go to Settings <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <Database className="h-6 w-6 text-primary" /> 2. Manual Deletion Request
            </h2>
            <p>
              If you cannot access your account or wish to request the deletion of specific data points, you can contact our privacy team.
              Please include your account email and a description of the data you wish to be removed.
            </p>
            <a href="mailto:privacy@uni.social" className="text-primary font-bold hover:underline">privacy@uni.social</a>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-primary" /> 3. Data Retention
            </h2>
            <p>
              Upon receiving a deletion request, we will remove your data from our active databases within 30 days. Please note that some
              anonymized data may persist in our logs for security and analytical purposes, as permitted by law.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" /> 4. Platform-Specific Data
            </h2>
            <p>
              Data that has already been published to third-party social media platforms (like TikTok, Instagram, or Pinterest)
              through UNI.social must be deleted directly on those platforms.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}