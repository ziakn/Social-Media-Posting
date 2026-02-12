import BlogPostContent from "./BlogPostContent";
import { getBlogPostBySlug } from "@/app/actions/website/blog/blogActions";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const { post } = await getBlogPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found | UNI.social Blog",
        };
    }

    return {
        title: `${post.title} | UNI.social Blog`,
        description: post.excerpt || `Expert insights on ${post.title}. Read our comprehensive guide on social media strategy.`,
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            title: `${post.title} | UNI.social Blog`,
            description: post.excerpt,
            url: `https://uni.social/blog/${slug}`,
            type: "article",
            images: post.image ? [{ url: post.image }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: `${post.title} | UNI.social Blog`,
            description: post.excerpt,
            images: post.image ? [post.image] : [],
        },
    };
}

export default async function BlogPostPage({ params }) {
    const { slug } = await params;
    const { post } = await getBlogPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt,
        "author": {
            "@type": "Person",
            "name": post.author || "UNI.social Team"
        },
        "publisher": {
            "@type": "Organization",
            "name": "UNI.social"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogPostContent post={post} />
        </>
    );
}
