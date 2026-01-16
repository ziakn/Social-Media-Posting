import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function BlogSidebar() {
    return (
        <aside className="lg:col-span-4 space-y-12 pl-0 lg:pl-12 border-l-0 lg:border-l border-gray-100">

            {/* Search Widget */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 font-display">Subscribe to our newsletter</h3>
                <p className="text-sm text-gray-600 mb-4">Get the latest social media tips delivered to your inbox weekly.</p>
                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold">
                        Subscribe
                    </Button>
                </div>
            </div>

            {/* Popular Lists */}
            <div>
                <h3 className="font-bold text-lg text-gray-900 mb-6 font-display border-b border-gray-100 pb-2">Top Categories</h3>
                <ul className="space-y-3">
                    {["Platform Guides", "Strategy & Insights", "Creator Growth"].map(cat => (
                        <li key={cat}>
                            <Link href="#" className="flex items-center justify-between text-gray-600 hover:text-primary transition-colors font-medium">
                                <span>{cat}</span>
                                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Banner Ad */}
            <div className="bg-primary text-white p-8 rounded-2xl text-center space-y-4">
                <h3 className="text-2xl font-bold font-display">Start Growing Today</h3>
                <p className="text-white/80 text-sm">Join 10,000+ creators using SocialHub.</p>
                <Link href="/auth/register">
                    <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold">
                        Start Free Trial
                    </Button>
                </Link>
            </div>

        </aside>
    );
}
