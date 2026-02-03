"use server";

import PublishedPosts from "@/components/portal/bluesky/PublishedPosts";

export default async function ManageBlueSkyPosts() {
    return (
        <div className="min-h-screen bg-gray-50/30">
            <PublishedPosts />
        </div>
    );
}
