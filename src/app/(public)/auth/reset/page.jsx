"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { requestResetAction } from "@/app/actions/auth/authActions";

export default function ResetRequestPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState("");
    const [success, setSuccess] = useState(false);

    const handleRequest = async (e) => {
        e.preventDefault();
        setAlert("");
        setLoading(true);

        try {
            const res = await requestResetAction(email);
            setLoading(false);

            if (!res.success) {
                setAlert(res.error);
                return;
            }

            setSuccess(true);
        } catch (error) {
            console.error(error);
            setLoading(false);
            setAlert("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <AuthLayout
            title="Request Reset"
            subtitle="Enter your email identity to receive a secure recovery protocol."
        >
            <div className="space-y-6">
                {alert && (
                    <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-600 rounded-lg">
                        <AlertDescription className="font-bold text-xs uppercase tracking-tight">{alert}</AlertDescription>
                    </Alert>
                )}

                {success ? (
                    <div className="space-y-6 text-center">
                        <Alert variant="default" className="bg-emerald-50 border-emerald-100 text-emerald-600 rounded-lg">
                            <AlertDescription className="font-bold text-xs uppercase tracking-tight">
                                Instructions dispatched. Please verify your communications.
                            </AlertDescription>
                        </Alert>
                        <p className="text-sm text-slate-500 font-medium">
                            We've sent a secure recovery link to <span className="font-bold text-[#0C1B33]">{email}</span>.
                            The link will expire in 15 minutes for your security.
                        </p>
                        <Button
                            asChild
                            className="w-full h-14 bg-[#F9C80E] hover:bg-[#eac00d] text-[#0C1B33] rounded-[6px] font-black text-sm uppercase tracking-[0.15em] transition-all"
                        >
                            <Link href="/auth/login">Return to Keypad</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleRequest} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
                                <Mail className="h-3 w-3 text-[#3B82F6]" /> Registered Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="zia@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-14 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50 transition-all shadow-sm"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-[#F9C80E] hover:bg-[#eac00d] text-[#0C1B33] rounded-[6px] font-black text-sm uppercase tracking-[0.15em] transition-all active:scale-[0.98] shadow-subtle font-plus-jakarta"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Dispatch Reset Protocol"
                            )}
                        </Button>

                        <div className="text-center pt-2">
                            <Link href="/auth/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#3B82F6] transition-colors">
                                <ArrowLeft className="h-3 w-3" /> Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
}
