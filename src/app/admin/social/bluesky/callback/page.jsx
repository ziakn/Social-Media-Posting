"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";
import { Loader2, ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function BlueSkyCallbackPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({ identifier: "", password: "" });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.identifier || !formData.password) {
            setError("Please fill in all fields");
            return;
        }

        startTransition(async () => {
            try {
                const response = await fetch("/api/admin/bluesky/callback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    toast.success("Successfully connected to BlueSky!");
                    router.push("/admin/social/connect");
                } else {
                    setError(result.error || "Failed to connect");
                }
            } catch (err) {
                setError("An unexpected error occurred");
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <Button
                    variant="ghost"
                    className="text-slate-500 hover:text-slate-900 -ml-4"
                    onClick={() => router.push("/admin/social/connect")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Connections
                </Button>

                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <BlueSkyLogo className="h-10 w-10 text-[#0085ff]" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Connect BlueSky</h1>
                    <p className="text-slate-500 text-sm max-w-xs">
                        Enter your BlueSky handle and App Password to authorize posting access.
                    </p>
                </div>

                <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-xl">Account Login</CardTitle>
                            <CardDescription>
                                We recommend using an App Password instead of your main password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-100">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="identifier">Handle or Email</Label>
                                <Input
                                    id="identifier"
                                    placeholder="e.g. alice.bsky.social"
                                    value={formData.identifier}
                                    onChange={(e) => setFormData(p => ({ ...p, identifier: e.target.value }))}
                                    disabled={isPending}
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">App Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="xxxx-xxxx-xxxx-xxxx"
                                    value={formData.password}
                                    onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                                    disabled={isPending}
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors font-mono"
                                />
                                <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs">
                                    <KeyRound className="h-4 w-4 shrink-0 mt-0.5" />
                                    <div>
                                        <strong>Security Tip:</strong> Go to Settings &gt; Privacy & Security &gt; App Passwords in BlueSky to generate a unique password for this app.
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full bg-[#0085ff] hover:bg-blue-600 text-white font-bold h-11"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Connect Account"
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>Credentials are encrypted and stored securely</span>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
