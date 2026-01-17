"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Mail, Lock, Building2, Globe, Chrome, Github } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { API_ROUTES } from "@/constants/api";
import { ROUTES } from "@/constants/routes";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    country: "United States"
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      return setAlert("Terms acceptance required to proceed.");
    }

    setLoading(true);
    setAlert("");

    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const userId = userCredential.user.uid;

      // 2️⃣ Save user in Firestore
      await addDoc(collection(db, "users"), {
        id: userId,
        name: form.name,
        email: form.email,
        company: form.company,
        country: form.country,
        role_id: "user", // Default role
        role_name: "User",
        coinBalance: 100, // Initial free coins
        created_at: new Date(),
        receiveUpdates: receiveUpdates
      });

      router.push(ROUTES.AUTH_LOGIN || "/auth/login");
    } catch (error) {
      console.error("Error registering user:", error);
      setAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia",
    "Germany", "France", "Japan", "India", "United Arab Emirates", "Other"
  ];

  return (
    <AuthLayout
      title="Join the Network"
      subtitle="Start your zero-friction content scale today."
    >
      <div className="space-y-6">
        {alert && (
          <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-600 rounded-lg">
            <AlertDescription className="font-bold text-xs uppercase tracking-tight">{alert}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
              <User className="h-3 w-3 text-[#3B82F6]" /> Creator Name
            </label>
            <Input
              type="text"
              placeholder="Zia Muhammad"
              required
              className="h-12 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
              <Mail className="h-3 w-3 text-[#3B82F6]" /> Communications
            </label>
            <Input
              type="email"
              placeholder="zia@example.com"
              required
              className="h-12 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
              <Lock className="h-3 w-3 text-[#3B82F6]" /> Secure Key
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              required
              className="h-12 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
                <Building2 className="h-3 w-3 text-[#3B82F6]" /> Brand
              </label>
              <Input
                type="text"
                placeholder="Agency X"
                className="h-12 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
                <Globe className="h-3 w-3 text-[#3B82F6]" /> Origin
              </label>
              <select
                className="flex h-12 w-full rounded-[6px] border border-slate-200 bg-slate-50/50 px-3 py-2 text-[10px] font-black uppercase tracking-widest ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-plus-jakarta"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={setAgreeToTerms}
                className="mt-1 border-slate-300 data-[state=checked]:bg-[#3B82F6] data-[state=checked]:border-[#3B82F6]"
              />
              <label htmlFor="terms" className="text-[10px] font-bold text-[#3E4652] leading-normal uppercase tracking-widest font-plus-jakarta">
                Agree to <Link href="/terms" className="text-[#3B82F6] font-black">Terms</Link> & <Link href="/privacy" className="text-[#3B82F6] font-black">Privacy</Link>.
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="updates"
                checked={receiveUpdates}
                onCheckedChange={setReceiveUpdates}
                className="mt-1 border-slate-300 data-[state=checked]:bg-[#3B82F6] data-[state=checked]:border-[#3B82F6]"
              />
              <label htmlFor="updates" className="text-[10px] font-bold text-[#3E4652] leading-normal uppercase tracking-widest font-plus-jakarta">
                Receive release node protocols.
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 bg-[#F9C80E] hover:bg-[#eac00d] text-[#0C1B33] rounded-[6px] font-black text-sm uppercase tracking-[0.15em] transition-all active:scale-[0.98] shadow-subtle mt-4 font-plus-jakarta"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Deploy Account"}
          </Button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
            <span className="bg-white px-4 font-plus-jakarta">Native Integration</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 rounded-[6px] border-slate-200 font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-slate-50 text-[#0C1B33]">
            <Chrome className="h-3 w-3 text-[#3B82F6]" /> Google
          </Button>
          <Button variant="outline" className="h-12 rounded-[6px] border-slate-200 font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-slate-50 text-[#0C1B33]">
            <Github className="h-3 w-3" /> GitHub
          </Button>
        </div>

        <div className="pt-6 text-center">
          <p className="text-xs font-bold text-[#3E4652] uppercase tracking-widest font-plus-jakarta">
            Already registered?{" "}
            <Link href="/auth/login" className="text-[#3B82F6] font-black hover:underline ml-1">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
