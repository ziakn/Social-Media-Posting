import Link from "next/link";
import { Cookie, ShieldCheck, Lock, Eye, Bell, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
    title: "Cookie Policy | UNI.social",
    description: "Learn how UNI.social uses cookies and similar technologies to provide, customize, and improve our services.",
};

export default function CookiePolicyPage() {
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
                        <h1 className="text-4xl md:text-5xl font-[650] text-slate-900 uppercase tracking-tighter">Cookie Policy</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Last Updated: February 12, 2026</p>
                    </div>
                </div>
            </section>

            {/* 📄 Content */}
            <section className="py-24 container mx-auto px-6 max-w-[800px] prose prose-slate">
                <div className="space-y-16">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <Cookie className="h-6 w-6 text-primary" /> 1. What are cookies?
                        </h2>
                        <p>
                            Cookies are small text files that are stored on your browser or device by websites, apps, online media, and advertisements.
                            UNI.social uses cookies and other identification technologies for various purposes, including authenticating users,
                            remembering user preferences and settings, and analyzing site traffic and trends.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <ShieldCheck className="h-6 w-6 text-primary" /> 2. Our Use of Cookies
                        </h2>
                        <p>
                            We use cookies to enhance your experience as follows:
                        </p>
                        <ul className="list-disc pl-6 space-y-4">
                            <li><strong>Essential Cookies:</strong> These are required for the operation of our service. They include, for example, cookies that enable you to log into secure areas.</li>
                            <li><strong>Analytical/Performance Cookies:</strong> They allow us to recognize and count the number of visitors and to see how visitors move around our website.</li>
                            <li><strong>Functionality Cookies:</strong> Used to recognize you when you return to our website. This enables us to personalize our content for you.</li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <Lock className="h-6 w-6 text-primary" /> 3. Third-party Cookies
                        </h2>
                        <p>
                            Please note that third parties (including, for example, advertising networks and providers of external services like
                            web traffic analysis services) may also use cookies, over which we have no control.
                            These cookies are likely to be analytical/performance cookies or targeting cookies.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <Bell className="h-6 w-6 text-primary" /> 4. Managing Cookies
                        </h2>
                        <p>
                            Most browsers allow you to refuse to accept cookies and to delete cookies. The methods for doing so vary from
                            browser to browser, and from version to version. You can however obtain up-to-date information about blocking
                            and deleting cookies via these links:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                            {["Chrome", "Firefox", "Safari", "Edge"].map((browser, i) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-xl text-center font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer border border-slate-100 italic">
                                    {browser}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
