"use client";

import { useEffect, useState } from "react";
import { fetchLinkedinAccounts } from "@/app/actions/social/linkedin/linkedinPostsActions";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { MoreVertical, ArrowRight, RefreshCcw, Globe } from "lucide-react";
import { LinkedinLogo } from "@/components/icons/LinkedinLogo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function LinkedinAccountsDashboard() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const res = await fetchLinkedinAccounts();
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
                <div className="bg-[#0077b5] rounded-3xl p-8 mb-6 inline-block shadow-2xl rotate-3">
                    <LinkedinLogo className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Expand Your Network</h2>
                <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto font-medium">
                    Connect your LinkedIn account to share professional updates, articles, and media with your network.
                </p>
                <Button
                    className="bg-[#0077b5] hover:bg-[#006396] text-white px-10 py-4 text-lg font-black shadow-xl rounded-2xl flex items-center justify-center gap-3 mx-auto uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                    size="lg"
                    onClick={() => router.push("/admin/social/connect")}
                >
                    <LinkedinLogo className="h-6 w-6 text-white" /> Start Connecting
                </Button>
            </div>
        );

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            {/* Header */}
            <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-[#0077b5] rounded-xl flex items-center justify-center shadow-lg">
                        <LinkedinLogo className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">LinkedIn Professional</h1>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em]">
                            Command center for your professional presence
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onClick={loadAccounts}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0077b5] hover:bg-blue-50 px-6 py-6 border-none"
                >
                    <RefreshCcw className="w-4 h-4" /> Sync Accounts
                </Button>
            </header>

            {/* Account Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {accounts.map((account) => (
                    <Card
                        key={account.accountId}
                        className="group relative border-none rounded-[2.5rem] shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 bg-white overflow-hidden p-2"
                    >
                        <div className="p-6">
                            <CardHeader className="flex flex-row items-center justify-between p-0 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="h-14 w-14 rounded-2xl bg-gray-50 border-2 border-white shadow-md overflow-hidden ring-1 ring-gray-100">
                                            {account.profilePicture ? (
                                                <img src={account.profilePicture} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-blue-50 text-[#0077b5] font-black text-xl">
                                                    {account.displayName?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-[#0077b5] rounded-lg p-1.5 border-2 border-white shadow-sm">
                                            <LinkedinLogo className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h3 className="font-black text-lg text-gray-900 truncate tracking-tight group-hover:text-[#0077b5] transition-colors leading-none mb-1">
                                            {account.displayName || "LinkedIn Member"}
                                        </h3>
                                        <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-widest border-green-100 bg-green-50 text-green-600 rounded-lg py-0.5">
                                            Verified
                                        </Badge>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-300 hover:text-gray-900 rounded-2xl transition-all">
                                            <MoreVertical className="w-5 h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[200px] rounded-[24px] shadow-2xl border-none p-2 translate-y-2">
                                        <DropdownMenuItem onClick={() => router.push(`/admin/social/linkedin/posts`)} className="p-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50">
                                            Manage Dashboard
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toast("Advanced Analytics coming in v2.0")} className="p-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50">
                                            Market Insights
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>

                            <CardContent className="p-0">
                                <p className="text-sm text-gray-500 font-medium leading-relaxed italic mb-6">
                                    "{account.headline || "Transforming the professional landscape through strategic updates and meaningful connections."}"
                                </p>
                            </CardContent>

                            <CardFooter className="p-0 flex justify-between items-center mt-auto">
                                <div className="flex items-center gap-1.5 opacity-50">
                                    <Globe className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Public profile</span>
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-gray-900 hover:bg-black text-white px-6 py-5 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg transition-all hover:scale-105"
                                    onClick={() => router.push(`/admin/social/linkedin/posts`)}
                                >
                                    Dashboard
                                    <ArrowRight className="ml-2 w-3.5 h-3.5" />
                                </Button>
                            </CardFooter>
                        </div>
                    </Card>
                ))}
            </section>

            {/* Info Card */}
            <Card className="mt-16 bg-[#0077b5] border-none rounded-[3rem] shadow-2xl shadow-blue-900/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <LinkedinLogo className="w-80 h-80 text-white" />
                </div>
                <CardContent className="p-12 relative z-10 flex flex-col md:flex-row items-center gap-8 text-white">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] rotate-3 shadow-2xl">
                        <LinkedinLogo className="w-12 h-12 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-2xl font-black mb-2 tracking-tight">Enterprise LinkedIn Integration</h4>
                        <p className="text-blue-50 text-lg font-medium max-w-2xl opacity-80 leading-relaxed">
                            Power your B2B strategy with seamless post scheduling, rich media support (up to 4K pictures), and real-time engagement monitoring through the professional API.
                        </p>
                    </div>
                    <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20 border-none font-bold px-8 py-7 rounded-2xl">
                        Learn More
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
