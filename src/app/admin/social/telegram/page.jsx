"use client";

import { useEffect, useState } from "react";
import { checkTelegramConnection } from "@/app/actions/social/telegram/connectAccount";
import { saveTelegramAccount } from "@/app/actions/social/telegram/saveAccount";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, MoreVertical, ArrowRight, RefreshCcw, Link as LinkIcon, Bot, MessageSquare, Info } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TelegramDashboard() {
    const [connection, setConnection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        botToken: "",
        chatId: "",
        displayName: ""
    });
    const router = useRouter();

    const loadConnection = async () => {
        setLoading(true);
        const res = await checkTelegramConnection();
        setConnection(res);
        setLoading(false);
    };

    useEffect(() => {
        loadConnection();
    }, []);

    const handleConnect = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await saveTelegramAccount(formData);
            if (res.success) {
                toast.success(res.message);
                loadConnection();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Spinner />;

    if (!connection?.connected) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <div className="bg-blue-50 rounded-full p-6 mb-4 inline-block shadow-sm">
                        <Send className="h-12 w-12 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Telegram Not Connected</h2>
                    <p className="text-lg text-slate-500 mb-0 max-w-md mx-auto">
                        Connect your Telegram Bot to start publishing messages and media to your channels.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden">
                        <div className="h-2 bg-blue-600" />
                        <CardHeader>
                            <h3 className="text-xl font-bold text-slate-900">Configure Connection</h3>
                            <p className="text-sm text-slate-500">Enter your bot details to bridge the connection.</p>
                        </CardHeader>
                        <form onSubmit={handleConnect}>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="botToken" className="text-sm font-semibold text-slate-700">Bot Token</Label>
                                    <Input
                                        id="botToken"
                                        placeholder="123456789:ABCDefgh..."
                                        value={formData.botToken}
                                        onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                                        required
                                        className="rounded-xl border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="chatId" className="text-sm font-semibold text-slate-700">Chat ID (Channel or Group)</Label>
                                    <Input
                                        id="chatId"
                                        placeholder="-100123456789"
                                        value={formData.chatId}
                                        onChange={(e) => setFormData({ ...formData, chatId: e.target.value })}
                                        required
                                        className="rounded-xl border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="displayName" className="text-sm font-semibold text-slate-700">Display Name (Optional)</Label>
                                    <Input
                                        id="displayName"
                                        placeholder="My Community Bot"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        className="rounded-xl border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl shadow-lg transition-all"
                                >
                                    {submitting ? <Spinner className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-5 w-5" />}
                                    Connect Telegram Bot
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Bot className="w-5 h-5 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-slate-900">How to get a Bot Token?</h4>
                            </div>
                            <ol className="text-sm text-slate-600 space-y-3 list-decimal pl-4">
                                <li>Message <a href="https://t.me/BotFather" target="_blank" className="text-blue-600 font-semibold hover:underline">@BotFather</a> on Telegram.</li>
                                <li>Use the <code className="bg-slate-100 px-1 rounded text-blue-700">/newbot</code> command to create a bot.</li>
                                <li>Copy the API Token provided at the end.</li>
                            </ol>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <MessageSquare className="w-5 h-5 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-slate-900">How to get Chat ID?</h4>
                            </div>
                            <ul className="text-sm text-slate-600 space-y-3 list-disc pl-4">
                                <li>Add your bot as an <strong>Administrator</strong> to your channel or group.</li>
                                <li>Forward a message from your channel to <a href="https://t.me/userinfobot" target="_blank" className="text-blue-600 font-semibold hover:underline">@userinfobot GET ID</a> to see the Chat ID.</li>
                                <li>Channel IDs usually start with <code className="bg-slate-100 px-1 rounded text-blue-700">-100</code>.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Send className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Telegram Manager</h1>
                    </div>
                    <p className="text-slate-500 mt-1 text-base">
                        Manage your bot integrations and broadcast messages to your community.
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
                    <div className="h-1 bg-blue-600" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Bot className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">
                                    {connection.displayName}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Badge className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-100 uppercase tracking-wider font-bold">
                                        Active
                                    </Badge>
                                    <span className="text-[10px] text-slate-400 font-mono">{connection.chatId}</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Your Telegram bot is ready to publish. Cross-post your content to this channel automatically or schedule manual broadcasts.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-end pb-6">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 rounded-xl shadow-md"
                            onClick={() => router.push("/admin/social/telegram/posts")}
                        >
                            Manage Broadcasts
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </section>

            <Card className="mt-12 border-slate-100 bg-slate-50/50 rounded-2xl overflow-hidden">
                <CardContent className="p-8 flex items-start gap-5">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                        <Info className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-bold mb-1 text-slate-900 text-lg">Telegram Bot Integration</h4>
                        <p className="text-slate-500 leading-relaxed max-w-3xl">
                            Unlike traditional OAuth connections, Telegram integration uses your unique Bot Token. 
                            Ensure your bot has <strong>Administrator</strong> permissions in the target channel to successfully post. 
                            Your token is encrypted and stored securely to authorize API requests on your behalf.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
