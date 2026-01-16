import PricingContent from "./PricingContent";

export const metadata = {
    title: "Pricing Plans for Multi-Platform Social Media Tool | SocialHub",
    description: "Compare Starter, Professional, and Enterprise plans for TikTok, Instagram, Pinterest, and more. Free trial available.",
};

export default function PricingPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "SocialHub Social Media Tool",
        "description": "Multi-platform social media scheduling and automation tool.",
        "brand": {
            "@type": "Brand",
            "name": "SocialHub"
        },
        "offers": [
            {
                "@type": "Offer",
                "url": "https://social-hub-demo.vercel.app/pricing",
                "priceCurrency": "USD",
                "price": "0.00",
                "name": "Starter",
                "availability": "https://schema.org/InStock"
            },
            {
                "@type": "Offer",
                "url": "https://social-hub-demo.vercel.app/pricing",
                "priceCurrency": "USD",
                "price": "29.00",
                "name": "Professional",
                "availability": "https://schema.org/InStock"
            }
        ]
    };

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How does the 14-day free trial work?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You get full access to the Professional plan for 14 days. No credit card is required to start. At the end of the trial, you can choose to subscribe or move to the Free plan."
                }
            },
            {
                "@type": "Question",
                "name": "Can I change plans at any time?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, you can upgrade or downgrade your plan at any time from your dashboard. If you upgrade, the new price will be prorated."
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <PricingContent />
        </>
    );
}
