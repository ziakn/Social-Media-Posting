export default function FailedPage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Failed Posts</h1>
            <p className="text-gray-500">Review posts that failed to publish and retry them.</p>
        </div>
    );
}
