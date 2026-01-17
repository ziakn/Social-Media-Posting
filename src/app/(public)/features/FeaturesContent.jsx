"use client";

import FeatureHero from "@/components/features/FeatureHero";
import FeatureShowcase from "@/components/features/FeatureShowcase";
import FeatureGrid from "@/components/features/FeatureGrid";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeaturesContent() {
    return (
        <div className="bg-white min-h-screen font-inter">
            <FeatureHero />

            <FeatureShowcase
                title="Multi-Platform Scheduler"
                description="Stop jumping between tabs. Schedule content for Instagram, TikTok, Pinterest, YouTube, and LinkedIn from a single calendar."
                benefits={[
                    "Drag-and-drop calendar interface",
                    "Auto-resize images for each platform",
                    "Bulk upload via CSV",
                    "Preview posts before publishing"
                ]}
                imageSrc="/images/features/scheduler.png"
            />

            <FeatureShowcase
                reversed
                title="AI Content Assistant"
                description="Never stare at a blank screen again. Our AI generates engaging captions, relevant hashtags, and even video scripts in seconds."
                benefits={[
                    "Tone of voice customization",
                    "Keyword-optimized hashtags",
                    "Idea generator for viral content",
                    "Multi-language support"
                ]}
                imageSrc="/images/features/ai.png"
            />

            <FeatureShowcase
                title="Unified Analytics"
                description="Prove your ROI with beautiful, easy-to-understand reports. Track growth across all channels in one dashboard."
                benefits={[
                    "Cross-platform performance metrics",
                    "Exportable PDF & CSV reports",
                    "Competitor benchmarking",
                    "Audience demographics"
                ]}
                imageSrc="/images/features/analytics.png"
            />

            <FeatureGrid />

            {/* Final CTA */}
            <div className="py-24 bg-primary text-white text-center">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h2 className="text-4xl font-bold font-display mb-6">Ready to upgrade your workflow?</h2>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                        Join 50,000+ creators and brands using SocialHub to save time and grow faster.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/auth/register">
                            <Button className="bg-white text-primary hover:bg-gray-100 font-bold text-lg h-14 px-10 rounded-xl">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button variant="outline" className="border-white text-white hover:bg-white/10 font-bold text-lg h-14 px-10 rounded-xl">
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
