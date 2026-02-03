// src/app/portal/social/tiktok/posts/page.jsx
import TikTokPublishedPosts from "@/components/portal/tiktok/PublishedPosts";

export const metadata = {
    title: "Manage TikTok Posts | Social Studio",
    description: "Create, schedule, and analyze your TikTok videos",
};

export default function TikTokPostsPage() {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <TikTokPublishedPosts />
        </div>
    );
}
