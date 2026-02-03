"use client";

import { useEffect, useState } from "react";
import { fetchBlueSkyAccounts } from "@/app/actions/social/bluesky/getAccounts";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { MoreVertical, ArrowRight, RefreshCcw } from "lucide-react";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function BlueSkyAccountsDashboard() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const res = await fetchBlueSkyAccounts();
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

    if (loading) return <Spinner className="mx-auto mt-20" />;

    if (accounts.length === 0)
        return (
            <div className="container mx-auto py-20 text-center max-w-xl">
                <div className="bg-[#0085ff] rounded-full p-8 mb-6 inline-block shadow-lg">
                    <BlueSkyLogo className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-neutral-800 mb-3">No BlueSky Accounts Found</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                    Connect your BlueSky account to share text updates and join public conversations programmatically.
                </p>
                <Button
                    className="bg-[#0085ff] hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold shadow-lg rounded-xl flex items-center justify-center gap-2 mx-auto"
                    size="lg"
                    onClick={() => window.location.href = "/api/portal/bluesky/connect"}
                >
                    <BlueSkyLogo className="h-6 w-6 text-white" /> Connect Account
                </Button>
            </div>
        );

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            {/* Header */}
            <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-800 mb-2">BlueSky Account Manager</h1>
                    <p className="text-muted-foreground text-base">
                        Manage your BlueSky presence, posts, and engagement.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={loadAccounts}
                    className="flex items-center gap-2 border-neutral-300 text-neutral-700 hover:bg-neutral-100 shadow-sm font-semibold"
                >
                    <RefreshCcw className="w-4 h-4" /> Refresh
                </Button>
            </header>

            {/* Account Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {accounts.map((account) => (
                    <Card
                        key={account.accountId}
                        className="border border-neutral-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100 group"
                    >
                        <CardHeader className="flex items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-[#0085ff] rounded-lg">
                                    <BlueSkyLogo className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-neutral-800 group-hover:text-neutral-900 transition-colors duration-200">
                                        {account.username || account.pageName || "BlueSky Account"}
                                    </h3>
                                    <Badge variant="secondary" className="text-xs mt-1 bg-neutral-200 text-neutral-700">
                                        Connected
                                    </Badge>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-neutral-500">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => router.push(`${ROUTES.PORTAL_BLUESKY}/posts`)}>
                                        Manage Posts
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toast("Insights feature coming soon!")}>
                                        View Insights
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toast("Disconnect not implemented yet")}>
                                        Disconnect
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-snug">
                                Manage your text updates, image sharing, and engagement on BlueSky. Schedule content and track your profile's performance.
                            </p>
                        </CardContent>

                        <CardFooter className="flex justify-end">
                            <Button
                                size="sm"
                                className="bg-[#0085ff] hover:bg-blue-600 text-white flex items-center gap-1 rounded-lg shadow"
                                onClick={() => router.push(`${ROUTES.PORTAL_BLUESKY}/posts`)}
                            >
                                Manage Posts
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </section>

            {/* Info Card */}
            <Card className="mt-12">
                <CardContent className="p-6 flex items-start gap-3">
                    <div className="bg-[#0085ff] p-2 rounded-lg">
                        <BlueSkyLogo className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1 text-neutral-800">About BlueSky Integration</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This integration uses the official BlueSky API. Share 500-character updates, images, and videos directly from your dashboard.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
