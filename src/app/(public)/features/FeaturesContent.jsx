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
            <div className="py-24 bg-primary text-white text-center">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h2 className="text-4xl font-bold font-display mb-6">Ready to elevate your social media strategy?</h2>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                        Join 12,000+ creators and brands using SocialHub to save time and grow faster.
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
