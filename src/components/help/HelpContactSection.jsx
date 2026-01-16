import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";

export default function HelpContactSection() {
    return (
        <section className="py-24 bg-gray-50 border-t border-gray-100">
            <div className="container mx-auto px-6 max-w-4xl text-center">
                <h2 className="text-3xl font-bold text-gray-900 font-display mb-6">Still need answers?</h2>
                <p className="text-gray-600 mb-10 text-lg">
                    Our team is available 24/7 to help you with any issues.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link href="/contact">
                        <Button className="h-14 px-8 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 flex items-center gap-3 text-base shadow-sm">
                            <Mail className="h-5 w-5" />
                            Email Support
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-white flex items-center gap-3 text-base shadow-md">
                            <MessageSquare className="h-5 w-5" />
                            Live Chat
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
