import BlogPostContent from "./BlogPostContent";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const title = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return {
        title: `${title} | SocialHub Blog`,
        description: `Expert insights on ${title}. Read our comprehensive guide on social media strategy, platform growth, and AI automation.`,
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            title: `${title} | SocialHub Blog`,
            description: `Expert insights on ${title}. Read our comprehensive guide on social media strategy.`,
            url: `https://social-hub-demo.vercel.app/blog/${slug}`,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | SocialHub Blog`,
            description: `Expert insights on ${title}.`,
        },
    };
}

export default function BlogPostPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Social Media Strategy Insight",
        "description": "Expert social media strategy insights from the SocialHub team.",
        "author": {
            "@type": "Organization",
            "name": "SocialHub"
        },
        "publisher": {
            "@type": "Organization",
            "name": "SocialHub"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogPostContent />
        </>
    );
}
