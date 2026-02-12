"use client";

import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import FeatureHero from "@/components/features/FeatureHero";
import FeatureShowcase from "@/components/features/FeatureShowcase";
import FeatureGrid from "@/components/features/FeatureGrid";
import NewFooter from "@/components/home/NewFooter";
import Link from "next/link";

export default function FeaturesContent() {
    return (
        <main className="flex flex-col min-h-screen relative font-sans">
            <BackgroundCanvas />

            <div className="relative z-20 flex flex-col w-full max-w-[1440px] mx-auto px-4 md:px-8">
                <FeatureHero />

                <FeatureShowcase
                    title="Unified Social Media Scheduler"
                    description="Manage all your social media accounts from one clear view. Schedule content for Instagram, TikTok, Pinterest, YouTube, and LinkedIn in seconds."
                    benefits={[
                        "Drag-and-drop calendar interface",
                        "Automatic image resizing for every network",
                        "Bulk upload from your spreadsheets",
                        "Preview posts before they go live"
                    ]}
                    imageSrc="/images/features/scheduler.png"
                />

                <FeatureShowcase
                    reversed
                    title="AI Content Assistant"
                    description="Create engaging content instantly. Our AI generates personalized captions, popular discovery tags, and video scripts in seconds."
                    benefits={[
                        "Your unique tone of voice",
                        "Optimized tags for better reach",
                        "Ideas for high-engagement content",
                        "Support for multiple languages"
                    ]}
                    imageSrc="/images/features/ai.png"
                />

                <FeatureShowcase
                    title="Clear Performance Analytics"
                    description="Visualize your growth with beautiful, easy-to-understand reports. Track your progress across all channels in one simple dashboard."
                    benefits={[
                        "Performance metrics for every network",
                        "Simple, downloadable reports",
                        "Compare your progress with others",
                        "Detailed audience insights"
                    ]}
                    imageSrc="/images/features/analytics.png"
                />

                <FeatureGrid />

                {/* Final CTA */}
                <div className="py-16 container mx-auto px-6 max-w-[1280px] font-sans">
                    <div className="bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] rounded-[40px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl">
                        {/* Background Decorations */}
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 blur-[120px] pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />

                        <div className="space-y-6 relative z-10">
                            <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                                <i className="fas fa-rocket text-white text-3xl"></i>
                            </div>
                            <h2 className="text-4xl md:text-[3.5rem] font-[650] tracking-[-0.02em] max-w-4xl mx-auto leading-[1.1]">
                                Ready to elevate your social media strategy?
                            </h2>
                            <p className="text-[1.15rem] text-white/80 font-[420] max-w-2xl mx-auto leading-relaxed">
                                Join 12,000+ creators and brands using UNI.social to save time and grow faster.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 relative z-10">
                            <Link href="/auth/register">
                                <button className="bg-white text-[#2d253b] font-bold text-[0.95rem] px-12 py-5 rounded-[16px] hover:bg-white/90 transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest">
                                    Get Started Free
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button className="bg-transparent border-2 border-white/30 text-white font-bold text-[0.95rem] px-12 py-5 rounded-[16px] hover:bg-white/10 transition-all hover:border-white/50 hover:-translate-y-1 active:scale-95 flex items-center gap-3 uppercase tracking-widest mx-auto sm:mx-0">
                                    View Pricing
                                </button>
                            </Link>
                        </div>

                        <div className="pt-12 text-white/60 font-bold text-[0.7rem] uppercase tracking-[0.15em] relative z-10">
                            No Credit Card Required | Set Up in Seconds | AI Optimization Ready
                        </div>
                    </div>
                </div>

                <NewFooter />
            </div>
        </main>
    );
}
