"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { confirmResetAction } from "@/app/actions/auth/authActions";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setAlert("Protocol Error: Missing security token. Please request a new link.");
        }
    }, [token]);

    const handleReset = async (e) => {
        e.preventDefault();
        if (!token) return;

        if (password !== confirmPassword) {
            setAlert("Encryption keys do not match. Please verify your new password.");
            return;
        }

        if (password.length < 8) {
            setAlert("Security Requirement: Access key must be at least 8 characters long.");
            return;
        }

        setAlert("");
        setLoading(true);

        try {
            const res = await confirmResetAction(token, password);
            setLoading(false);

            if (!res.success) {
                setAlert(res.error);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (error) {
            console.error(error);
            setLoading(false);
            setAlert("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="space-y-6">
            {alert && (
                <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-600 rounded-lg">
                    <AlertDescription className="font-bold text-xs uppercase tracking-tight">{alert}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert variant="default" className="bg-emerald-50 border-emerald-100 text-emerald-600 rounded-lg">
                    <AlertDescription className="font-bold text-xs uppercase tracking-tight">
                        Key Reset Successful. Redirecting to Login...
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
                        <Lock className="h-3 w-3 text-[#3B82F6]" /> New Access Key
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-14 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50 pr-12 transition-all shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
                        <ShieldCheck className="h-3 w-3 text-[#3B82F6]" /> Verify Access Key
                    </label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-14 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50 transition-all shadow-sm"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading || success || !token}
                    className="w-full h-14 bg-[#F9C80E] hover:bg-[#eac00d] text-[#0C1B33] rounded-[6px] font-black text-sm uppercase tracking-[0.15em] transition-all active:scale-[0.98] shadow-subtle font-plus-jakarta"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        "Establish New Access"
                    )}
                </Button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <AuthLayout
            title="Secure Reset"
            subtitle="Define a new cryptographic access key to restore your network connectivity."
        >
            <Suspense fallback={
                <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </AuthLayout>
    );
}
