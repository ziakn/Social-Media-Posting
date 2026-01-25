export default function JsonLdSchema() {
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "SocialHub",
        "url": "https://social-hub-demo.vercel.app",
        "logo": "https://social-hub-demo.vercel.app/logo.png",
        "sameAs": [
            "https://twitter.com/socialhub",
            "https://instagram.com/socialhub",
            "https://linkedin.com/company/socialhub"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-555-SOCIAL-HUB",
            "contactType": "customer service",
            "email": "support@socialhub.com"
        }
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "SocialHub",
        "url": "https://social-hub-demo.vercel.app",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://social-hub-demo.vercel.app/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };

    const softwareAppSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "SocialHub",
        "operatingSystem": "Web",
        "applicationCategory": "Social Media Management",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1250"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
            />
        </>
    );
}
