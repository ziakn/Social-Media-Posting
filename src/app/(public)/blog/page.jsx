import BlogContent from "./BlogContent";
import { getPaginatedPosts } from "@/app/actions/website/blog/blogActions";
import JsonLdSchema from "@/components/seo/JsonLdSchema";

export const metadata = {
    title: "UNI.social Blog | Expert Social Media Strategy & AI Insights",
    description: "Read expert social media strategies, platform guides, and AI posting tips to grow your presence on TikTok, Instagram, Pinterest, and more.",
    keywords: [
        "social media strategy blog",
        "AI posting tips 2026",
        "TikTok growth automation",
        "Instagram business strategy",
        "social media distribution hub"
    ]
};

export default async function BlogPage() {
    // Fetch initial batch (Page 1, All Categories)
    const { posts = [] } = await getPaginatedPosts({ category: "All", pageSize: 6 });

    return (
        <>
            <JsonLdSchema type="WebSite" data={{ "@type": "Blog", "name": "UNI.social Blog" }} />
            <BlogContent initialPosts={posts} />
        </>
    );
}
