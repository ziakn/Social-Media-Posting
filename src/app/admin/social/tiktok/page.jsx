"use client";

import { useEffect, useState } from "react";
import { getUserTikTokAccounts } from "@/app/actions/social/tiktok/getAccounts";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { MoreVertical, ArrowRight, RefreshCcw } from "lucide-react";
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TikTokAccountsDashboard() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const res = await getUserTikTokAccounts();
            if (!res.success) throw new Error(res.message || "Failed to load accounts");
            setAccounts(res.accounts || []);
        } catch (err) {
            toast.error(err.message);
            setAccounts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Spinner className="h-8 w-8" />
        </div>
    );

    if (accounts.length === 0)
        return (
            <div className="container mx-auto py-20 text-center max-w-xl">
                <div className="bg-black rounded-full p-8 mb-6 inline-block shadow-lg">
                    <TiktokLogo className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-neutral-800 mb-3">No TikTok Accounts Found</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                    Connect your TikTok account to manage your videos, schedule content, and track performance.
                </p>
                <Button
                    className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg font-semibold shadow-lg rounded-xl flex items-center justify-center gap-2 mx-auto transition-all active:scale-95"
                    size="lg"
                    onClick={() => router.push("/admin/social/connect")}
                >
                    <TiktokLogo className="h-6 w-6 text-white" /> Connect Account
                </Button>
            </div>
        );

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            {/* Header */}
            <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-800 mb-2 font-black uppercase tracking-tighter">TikTok Studio</h1>
                    <p className="text-muted-foreground text-base font-medium">
                        Manage your TikTok presence, schedule viral content, and track engagement.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={loadAccounts}
                        className="flex items-center gap-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-sm font-bold rounded-xl h-12"
                    >
                        <RefreshCcw className="w-4 h-4" /> Refresh
                    </Button>
                    <Button
                        onClick={() => router.push("/admin/social/connect")}
                        className="bg-black hover:bg-gray-800 text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-black/10 transition-all active:scale-95"
                    >
                        Add Account
                    </Button>
                </div>
            </header>

            {/* Account Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {accounts.map((account) => (
                    <Card
                        key={account.id}
                        className="border border-neutral-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-neutral-50 to-neutral-100 group overflow-hidden flex flex-col"
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-neutral-100">
                                        <AvatarImage src={account.profilePicture} />
                                        <AvatarFallback className="bg-neutral-50 text-neutral-400 font-bold">T</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 bg-black rounded-md p-1 shadow-lg border-2 border-white">
                                        <TiktokLogo className="w-2.5 h-2.5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-neutral-900 group-hover:text-black transition-colors duration-200 tracking-tight">
                                        @{account.username || "TikTok User"}
                                    </h3>
                                    <Badge variant="secondary" className="text-[10px] mt-1 bg-green-50 text-green-600 border-green-100 font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                        Connected
                                    </Badge>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-black rounded-full h-10 w-10">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl p-2 border-neutral-100 shadow-2xl">
                                    <DropdownMenuItem
                                        onClick={() => router.push(ROUTES.ADMIN_TIKTOK_POSTS)}
                                        className="rounded-xl font-bold text-sm py-2.5 px-4"
                                    >
                                        Manage Content
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => toast("Advanced insights coming soon!")}
                                        className="rounded-xl font-bold text-sm py-2.5 px-4"
                                    >
                                        View Insights
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold text-sm py-2.5 px-4 text-red-600 focus:text-red-600 focus:bg-red-50">
                                        Disconnect
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>

                        <CardContent className="flex-1">
                            <p className="text-sm text-neutral-500 font-medium leading-relaxed line-clamp-2">
                                Manage your TikTok presence, schedule videos, and track engagement metrics directly from your dashboard.
                            </p>
                        </CardContent>

                        <CardFooter className="pt-4 border-t border-neutral-50 flex justify-end">
                            <Button
                                size="sm"
                                className="bg-black hover:bg-neutral-900 text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-xl flex items-center gap-2 shadow-sm transition-all group/btn"
                                onClick={() => router.push(ROUTES.ADMIN_TIKTOK_POSTS)}
                            >
                                Manage account
                                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </section>

            {/* Info Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-2xl border-neutral-100 shadow-sm bg-neutral-50/50">
                    <CardContent className="p-8 flex items-start gap-4">
                        <div className="bg-black p-3 rounded-2xl shadow-lg rotate-3 overflow-hidden">
                            <TiktokLogo className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-black mb-1.5 text-neutral-900 uppercase tracking-tight">Official SDK Integration</h4>
                            <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                                We use the official TikTok Content Posting API. Upload videos up to 1GB, set privacy, and enable comments directly from our studio.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-neutral-100 shadow-sm bg-neutral-50/50">
                    <CardContent className="p-8 flex items-start gap-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-neutral-200 -rotate-3 overflow-hidden">
                            <RefreshCcw className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <h4 className="font-black mb-1.5 text-neutral-900 uppercase tracking-tight">Real-time Performance</h4>
                            <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                                Track likes, comments, and views for every post. Our analytics sync directly with your TikTok profile to give you accurate insights.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
