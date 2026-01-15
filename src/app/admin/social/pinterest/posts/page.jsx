"use server";

import PinterestPosts from "@/components/admin/pinterest/PinterestPosts";

export default async function ManagePinterestPosts() {
    return (
        <div className="min-h-screen bg-gray-50/30">
            <PinterestPosts />
        </div>
    );
}
