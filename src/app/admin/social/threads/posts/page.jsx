"use server";

import PublishedPosts from "@/components/admin/threads/PublishedPosts";

export default async function ManageThreadsPosts() {
    return (
        <div className="min-h-screen bg-gray-50/30">
            <PublishedPosts />
        </div>
    );
}
