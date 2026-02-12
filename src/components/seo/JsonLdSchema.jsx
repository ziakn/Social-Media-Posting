export default function JsonLdSchema({ type = "Organization", data = {} }) {
    const baseUrl = "https://social-hub-demo.vercel.app";

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "UNI.social",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.png`,
        "description": "Enterprise-grade social media management and AI-driven distribution hub.",
        "sameAs": [
            "https://twitter.com/unisocial",
            "https://instagram.com/unisocial",
            "https://linkedin.com/company/unisocial"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-555-UNI-SOCIAL",
            "contactType": "customer service",
            "email": "support@uni.social"
        }
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "UNI.social",
        "url": baseUrl,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    const softwareAppSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "UNI.social",
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

    const schemas = [];
    if (type === "Organization") schemas.push(organizationSchema);
    if (type === "WebSite" || type === "All") schemas.push(websiteSchema);
    if (type === "SoftwareApplication" || type === "All") schemas.push(softwareAppSchema);

    // Add custom data if provided
    if (Object.keys(data).length > 0) {
        schemas.push({
            "@context": "https://schema.org",
            ...data
        });
    }

    return (
        <>
            {schemas.map((s, idx) => (
                <script
                    key={idx}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
                />
            ))}
        </>
    );
}
