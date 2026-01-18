"use server";

import PublishedPinterestPosts from "@/components/admin/pinterest/PublishedPinterestPosts";

export default async function ManagePinterestPosts() {
    return (
        <div className="min-h-screen bg-gray-50/30">
            <PublishedPinterestPosts />
        </div>
    );
}
