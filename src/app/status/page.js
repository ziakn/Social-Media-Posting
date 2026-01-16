export const metadata = {
    title: 'System Status | SocialHub',
    description: 'Real-time uptime and performance monitoring.'
}

export default function StatusPage() {
    return (
        <div className="pt-32 pb-20 container mx-auto px-6 max-w-[1200px]">
            <div className="max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6 font-display">System Status</h1>
                <div className="flex items-center gap-3 text-success font-bold text-lg">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                    </span>
                    All Systems Operational
                </div>
            </div>
        </div>
    )
}
