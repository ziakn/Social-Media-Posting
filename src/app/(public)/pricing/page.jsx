import PricingContent from "./PricingContent";
import { getPublicPackages } from "@/app/actions/website/packages/packagesActions";

export const metadata = {
    title: "Professional Social Media Management Pricing | UNI.social",
    description: "Compare plans for scheduling, posting, and analyzing TikTok, Instagram, Pinterest, and LinkedIn. Start for free and scale with enterprise-grade distribution tools.",
    keywords: [
        "social media tool pricing",
        "affordable social media scheduler",
        "enterprise social management cost",
        "multi-account social posting prices",
        "UNI.social plans"
    ],
    openGraph: {
        title: "Pricing Plans for Social Media Management | UNI.social",
        description: "Compare plans for scheduling, posting, and analyzing TikTok, Instagram, Pinterest, and LinkedIn content.",
        images: ["/og-pricing.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Pricing Plans for Social Media Management | UNI.social",
        description: "Compare plans for scheduling, posting, and analyzing TikTok, Instagram, Pinterest, and LinkedIn content.",
    }
};

export default async function PricingPage() {
    // Fetch active packages from database (using public action)
    const result = await getPublicPackages();
    const packages = result.success ? result.packages : [];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "UNI.social Social Media Management Tool",
        "description": "Multi-platform social media scheduling, analytics, and unified inbox.",
        "brand": {
            "@type": "Brand",
            "name": "UNI.social"
        },
        "offers": [
            {
                "@type": "Offer",
                "url": "https://social-hub-demo.vercel.app/pricing",
                "priceCurrency": "USD",
                "price": "0.00",
                "name": "Free / Starter",
                "availability": "https://schema.org/InStock"
            },
            {
                "@type": "Offer",
                "url": "https://social-hub-demo.vercel.app/pricing",
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
            <PricingContent packages={packages} />
        </>
    );
}
