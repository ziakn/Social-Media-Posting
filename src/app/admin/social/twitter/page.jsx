"use client";

import { useEffect, useState } from "react";
import { checkTwitterConnection } from "@/app/actions/social/twitter/connectAccount";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Twitter, MoreVertical, ArrowRight, RefreshCcw, Link as LinkIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TwitterDashboard() {
    const [connection, setConnection] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadConnection = async () => {
        setLoading(true);
        const res = await checkTwitterConnection();
        setConnection(res);
        setLoading(false);
    };

    useEffect(() => {
        loadConnection();
    }, []);

    if (loading) return <Spinner />;

    if (!connection?.connected) {
        return (
            <div className="container mx-auto py-20 text-center max-w-xl">
                <div className="bg-slate-100 rounded-full p-8 mb-6 inline-block shadow-lg">
                    <Twitter className="h-16 w-16 text-slate-900" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Twitter Not Connected</h2>
                <p className="text-lg text-slate-500 mb-8 max-w-md mx-auto">
                    Connect your Twitter account to start managing tweets and analytics.
                </p>
                <Button
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-lg font-semibold shadow-lg rounded-xl"
                    size="lg"
                    onClick={() => router.push("/admin/social/connect")}
                >
                    <Twitter className="h-6 w-6 mr-2 text-white" /> Connect Twitter
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Twitter Manager</h1>
                    <p className="text-slate-500 mt-1 text-base">
                        Manage your tweets, schedule posts, and monitor performance.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={loadConnection}
                    className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm font-semibold rounded-xl"
                >
                    <RefreshCcw className="w-4 h-4" /> Refresh
                </Button>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 bg-white group overflow-hidden">
                    <div className="h-1 bg-slate-900" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <Twitter className="w-6 h-6 text-slate-900" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">
                                    {connection.displayName}
                                </h3>
                                <Badge className="text-[10px] mt-1 bg-emerald-50 text-emerald-600 border-emerald-100 uppercase tracking-wider font-bold">
                                    Connected
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Manage your Twitter presence. Compose new tweets, schedule upcoming content, and review your published history.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-end pb-6">
                        <Button
                            className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 rounded-xl shadow-md"
                            onClick={() => router.push("/admin/social/twitter/posts")}
                        >
                            Manage Posts
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </section>

            <Card className="mt-12 border-slate-100 bg-slate-50/50">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                        <Twitter className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                        <h4 className="font-bold mb-1 text-slate-900">Twitter API Integration</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            This integration uses Twitter's official OAuth 2.0 API. Your access tokens are stored securely and used only for publishing and managing your tweets.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
