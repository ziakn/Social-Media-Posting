"use client";

import React, { useState } from "react";

// Sub-components
import HelpHero from "@/components/help/HelpHero";
import HelpSidebar from "@/components/help/HelpSidebar";
import HelpFaqAccordion from "@/components/help/HelpFaqAccordion";
import HelpContactSection from "@/components/help/HelpContactSection";

// Data
import { faqs } from "@/lib/constants/help-data";

export default function HelpCenterPage() {
    const [activeCategory, setActiveCategory] = useState(0);
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <main className="bg-white min-h-screen font-inter text-gray-900">
            <HelpHero />

            <section className="py-24">
                <div className="container mx-auto px-6 max-w-[1280px]">
                    <div className="grid lg:grid-cols-12 gap-16">
                        <HelpSidebar
                            categories={faqs}
                            activeCategory={activeCategory}
                            setActiveCategory={(i) => {
                                setActiveCategory(i);
                                setOpenIndex(0);
                            }}
                        />
                        <HelpFaqAccordion
                            questions={faqs[activeCategory].questions}
                        />
                    </div>
                </div>
            </section>

            <HelpContactSection />
        </main>
    );
}
