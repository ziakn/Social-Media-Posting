import BlogContent from "./BlogContent";
import { getPaginatedPosts } from "@/app/actions/website/blog/blogActions";

export const metadata = {
    title: "Social Media Growth, Tips, & Automation Blog | SocialHub",
    description: "Read expert social media strategies, platform guides, and AI posting tips to grow your presence on TikTok, Instagram, Pinterest, and more.",
};

export default async function BlogPage() {
    // Fetch initial batch (Page 1, All Categories)
    const { posts = [] } = await getPaginatedPosts({ category: "All", pageSize: 6 });
    console.log("BlogPage initial load:", posts.length);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "SocialHub Blog",
        "description": "Read expert social media strategies, platform guides, and AI posting tips to grow your presence on TikTok, Instagram, Pinterest, and more.",
        "publisher": {
            "@type": "Organization",
            "name": "SocialHub",
            "logo": {
                "@type": "ImageObject",
                "url": "https://social-hub-demo.vercel.app/og-image.png"
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogContent initialPosts={posts} />
        </>
    );
}
