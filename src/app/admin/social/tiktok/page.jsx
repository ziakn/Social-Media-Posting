// src/app/admin/social/tiktok/page.jsx
import TikTokPublishedPosts from "@/components/admin/tiktok/PublishedPosts";

export const metadata = {
    title: "TikTok Management | Social Studio",
    description: "Manage and schedule your TikTok videos",
};

export default function TikTokPage() {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <TikTokPublishedPosts />
        </div>
    );
}
