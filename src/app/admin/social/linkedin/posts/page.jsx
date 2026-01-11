"use client";

import PublishedPosts from "@/components/admin/linkedin/PublishedPosts";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

function LinkedinPostsContent() {
    const searchParams = useSearchParams();
    const accountId = searchParams.get("accountId");

    return (
        <div className="container mx-auto py-8 px-4">
            <PublishedPosts accountId={accountId} />
        </div>
    );
}

export default function LinkedinPostsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center mt-20"><Spinner /></div>}>
            <LinkedinPostsContent />
        </Suspense>
    );
}
