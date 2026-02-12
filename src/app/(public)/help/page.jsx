"use client";

import React, { useState } from "react";

// Components
import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import HelpHero from "@/components/help/HelpHero";
import HelpSidebar from "@/components/help/HelpSidebar";
import HelpFaqAccordion from "@/components/help/HelpFaqAccordion";
import HelpContactSection from "@/components/help/HelpContactSection";
import NewFooter from "@/components/home/NewFooter";

// Data
import { faqs } from "@/lib/constants/help-data";

export default function HelpCenterPage() {
    const [activeCategory, setActiveCategory] = useState(0);

    return (
        <main className="flex flex-col min-h-screen relative font-sans">
            <BackgroundCanvas />

            <div className="relative z-20 flex flex-col w-full">
                <HelpHero />

                <section className="py-24">
                    <div className="container mx-auto px-6 max-w-[1280px]">
                        <div className="grid lg:grid-cols-12 gap-16">
                            <HelpSidebar
                                categories={faqs}
                                activeCategory={activeCategory}
                                setActiveCategory={(i) => {
                                    setActiveCategory(i);
                                }}
                            />
                            <HelpFaqAccordion
                                questions={faqs[activeCategory].questions}
                            />
                        </div>
                    </div>
                </section>

                <HelpContactSection />

                <NewFooter />
            </div>
        </main>
    );
}
