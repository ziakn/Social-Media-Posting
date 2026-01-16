import PricingContent from "./PricingContent";

export const metadata = {
    title: "Pricing Plans for Social Media Management | SocialHub",
    description: "Compare plans for scheduling, posting, and analyzing TikTok, Instagram, Pinterest, Bluesky and YouTube content. Start for free and upgrade when you need more power.",
    openGraph: {
        title: "Pricing Plans for Social Media Management | SocialHub",
        description: "Compare plans for scheduling, posting, and analyzing TikTok, Instagram, Pinterest, Bluesky and YouTube content.",
        images: ["/og-pricing.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Pricing Plans for Social Media Management | SocialHub",
        description: "Compare plans for scheduling, posting, and analyzing TikTok, Instagram, Pinterest, Bluesky and YouTube content.",
    }
};

export default function PricingPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "SocialHub Social Media Management Tool",
        "description": "Multi-platform social media scheduling, analytics, and unified inbox.",
        "brand": {
            "@type": "Brand",
            "name": "SocialHub"
        },
        "offers": [
            {
                "@type": "Offer",
                "url": "https://socialhub.ai/pricing",
                "priceCurrency": "USD",
                "price": "0.00",
                "name": "Free / Starter",
                "availability": "https://schema.org/InStock"
            },
            {
                "@type": "Offer",
                "url": "https://socialhub.ai/pricing",
                "priceCurrency": "USD",
                "price": "39.00",
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
                "name": "Is the free plan free forever?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, our Free plan is free forever, designed for creators and small businesses to get started."
                }
            },
            {
                "@type": "Question",
                "name": "Can I upgrade anytime?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, you can upgrade to a higher tier at any time from your account settings."
                }
            },
            {
                "@type": "Question",
                "name": "Can I cancel anytime?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we offer monthly flexibility. You can cancel your subscription at any time."
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
