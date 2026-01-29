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
      const redirectPath = searchParams.get("redirect") || ROUTES.ADMIN_DASHBOARD;
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
        <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-600 rounded-lg">
          <AlertDescription className="font-bold text-xs uppercase tracking-tight">{alert}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-emerald-50 border-emerald-100 text-emerald-600 rounded-lg">
          <AlertDescription className="font-bold text-xs uppercase tracking-tight">Access Granted. Synchronizing...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
            <Mail className="h-3 w-3 text-[#3B82F6]" /> Email Identity
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="zia@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-14 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50 placeholder:text-slate-300 transition-all"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
              <Lock className="h-3 w-3 text-[#3B82F6]" /> Access Key
            </label>
            <Link href="/auth/reset" className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6] hover:text-[#0081cc] transition-colors">
              Recovery?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50 placeholder:text-slate-300 pr-12 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || success}
          className="w-full h-14 bg-[#F9C80E] hover:bg-[#eac00d] text-[#0C1B33] rounded-[6px] font-black text-sm uppercase tracking-[0.15em] transition-all active:scale-[0.98] shadow-subtle font-plus-jakarta"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Authorize Access"
          )}
        </Button>
      </form>



      <div className="pt-6 text-center">
        <p className="text-xs font-bold text-[#3E4652] uppercase tracking-widest font-plus-jakarta">
          New to the network?{" "}
          <Link href="/auth/register" className="text-[#3B82F6] font-black hover:underline ml-1 transition-all">
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
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
