"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { API_ROUTES } from "@/constants/api";
import { ROUTES } from "@/constants/routes";
import AuthLayout from "@/components/auth/AuthLayout";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "zia@gmail.com");
  const [password, setPassword] = useState("asdasdasd");
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setAlert("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(API_ROUTES.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setAlert(data.error || "Invalid credentials. Please try again.");
        return;
      }

      setSuccess(true);
      const redirectPath = searchParams.get("redirect") || ROUTES.PORTAL_DASHBOARD;
      setTimeout(() => router.push(redirectPath), 800);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setAlert("Login failed: " + (error.message || "Unexpected error"));
    }
  };

  return (
    <div className="space-y-6">
      {alert && (
        <Alert variant="destructive" className="bg-[rgba(255,100,100,0.1)] border-[rgba(255,100,100,0.2)] text-[#e5484d] rounded-2xl backdrop-blur-[4px]">
          <AlertDescription className="font-semibold text-xs tracking-tight">{alert}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-[rgba(50,200,150,0.1)] border-[rgba(50,200,150,0.2)] text-[#30a46c] rounded-2xl backdrop-blur-[4px]">
          <AlertDescription className="font-semibold text-xs tracking-tight">Access Granted. Synchronizing...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#4a3c60] flex items-center gap-2 font-sans ml-1">
            <Mail className="h-3.5 w-3.5 text-[#5e4a7a]" /> Email Identity
          </label>
          <div className="relative group">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="zia@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-[54px] rounded-[20px] border-[rgba(160,140,190,0.25)] bg-[rgba(255,255,255,0.4)] focus:bg-[rgba(255,255,255,0.6)] focus:ring-[rgba(94,74,122,0.1)] focus:border-[#5e4a7a] font-medium text-sm placeholder:text-[#a08cbc] transition-all backdrop-blur-[2px]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#4a3c60] flex items-center gap-2 font-sans">
              <Lock className="h-3.5 w-3.5 text-[#5e4a7a]" /> Access Key
            </label>
            <Link href="/auth/reset" className="text-[11px] font-bold text-[#5e4a7a] hover:text-[#4a3c60] transition-colors underline decoration-[#5e4a7a]/20 underline-offset-4">
              Recovery?
            </Link>
          </div>
          <div className="relative group">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-[54px] rounded-[20px] border-[rgba(160,140,190,0.25)] bg-[rgba(255,255,255,0.4)] focus:bg-[rgba(255,255,255,0.6)] focus:ring-[rgba(94,74,122,0.1)] focus:border-[#5e4a7a] font-medium text-sm placeholder:text-[#a08cbc] pr-12 transition-all backdrop-blur-[2px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a08cbc] hover:text-[#5e4a7a] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || success}
          className="w-full h-[54px] bg-[#2d253b] hover:bg-[#3e3152] text-white rounded-[60px] font-bold text-sm uppercase tracking-[0.1em] transition-all active:scale-[0.98] shadow-lg shadow-[#2d253b]/10 mt-2 cursor-pointer border-none"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Authorize Access"
          )}
        </Button>
      </form>

      <div className="pt-6 text-center border-t border-[rgba(160,140,190,0.1)]">
        <p className="text-sm font-medium text-[#4a3c60] font-sans">
          New to the network?{" "}
          <Link href="/auth/register" className="text-[#5e4a7a] font-bold hover:underline ml-1 transition-all decoration-[#5e4a7a]/30 underline-offset-4">
            Join Today
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <AuthLayout
      title="Access Control"
      subtitle="Authenticate your identity to manage your multi-platform network."
    >
      <Suspense fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#5e4a7a]" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
