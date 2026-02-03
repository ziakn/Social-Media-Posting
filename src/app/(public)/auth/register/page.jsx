"use client";

import { useState, useEffect, Suspense } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Mail, Lock, Building2, Globe, Check, ChevronDown } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { ROUTES } from "@/constants/routes";
import { registerUserAction } from "@/app/actions/website/register/registerActions";
import { createCheckoutSession } from "@/app/actions/billing/stripeActions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Default Free Plan Details
  const DEFAULT_FREE_PLAN = {
    id: "XX7Bf4wU3MkJAHu6Ohzm",
    name: "Free",
    limits: {
      socialAccounts: 3,
      scheduledPosts: 30,
      userSeats: 1,
      aiCaptions: 0
    }
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    creatorType: "Content Creator",
    country: "United Arab Emirates"
  });
  const [packages, setPackages] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "packages"));
        const plans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPackages(plans);

        // Match plan from URL
        const pkgParam = searchParams.get("package");
        const billingParam = searchParams.get("billing") || "monthly";

        const matched = plans.find(p =>
          p.name.toLowerCase() === (pkgParam?.toLowerCase() || "free") &&
          p.billingCycle.toLowerCase() === billingParam.toLowerCase()
        );

        setSelectedPlan(matched || plans.find(p => p.name === "Free" && p.billingCycle === "monthly") || DEFAULT_FREE_PLAN);
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      }
    };
    fetchPlans();
  }, [searchParams]);

  // Helper to resolve Price ID from Env based on package name/cycle
  const getStripePriceId = (pkgName, cycle) => {
    const name = pkgName?.toLowerCase();
    const isYearly = cycle === 'yearly';

    if (name.includes('creator') || name.includes('starter')) {
      return isYearly ? process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY : process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY;
    }
    if (name.includes('professional') || name.includes('pro')) {
      return isYearly ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;
    }
    if (name.includes('agency')) {
      return isYearly ? process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_YEARLY : process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY;
    }
    // Fallback to specific IDs if set
    if (name.includes('starter')) return process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER;
    if (name.includes('pro')) return process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setAlert("Encryption keys do not match. Please verify your password.");
    }
    if (!agreeToTerms) {
      return setAlert("Terms acceptance required to proceed.");
    }

    setLoading(true);
    setAlert("");

    try {
      const res = await registerUserAction(form, selectedPlan, receiveUpdates);

      if (!res.success) {
        throw new Error(res.error || "Registry authorization failed.");
      }

      // Seamless Transition via Action Metadata
      if (res.isPaid) {
        // Initiate Stripe Checkout
        const priceId = getStripePriceId(res.planName, res.billingCycle);

        if (priceId) {
          const checkoutRes = await createCheckoutSession(priceId,
            `${window.location.origin}/portal/subscription?success=true`, // Success URL
            `${window.location.origin}/portal/subscription?canceled=true`  // Cancel URL
          );

          if (checkoutRes.success) {
            window.location.href = checkoutRes.url;
            return; // Stop execution to allow redirect
          } else {
            console.error("Checkout Init Failed:", checkoutRes.error);
            // Fallback to dashboard with error state potentially
            router.push(ROUTES.PORTAL_DASHBOARD || "/portal");
          }
        } else {
          // Configuration error fallback
          router.push(ROUTES.PORTAL_DASHBOARD || "/portal");
        }
      } else {
        router.push(ROUTES.PORTAL_DASHBOARD || "/portal");
      }
    } catch (error) {
      console.error("Critical Registration Error:", error);
      setAlert(error.message);
    } finally {
      // Only stop loading if we are NOT redirecting (on failure)
      if (loading) {
        // If we are here, it means we caught an error or we fell through to finally block without redirecting
        // But since redirect is async, we can't be sure easily. 
        // However, react state update on unmounted component (due to redirect) is harmless warning usually.
        // For UX, if error alert is set, stop loading.
        // If successfully redirecting, we want loading spin to stay until page unload.
        // We can check if alert is set. But alert is set in catch.
        // So we check if we have error.
        // Actually, 'loading' state inside handleSubmit closure is stale.
        // We will rely on setAlert to determine failure.
      }
      // Simple logic: if error occurred, stop loading. If success, let it spin until nav.
      // But we can't access 'error' here easily.
      // So we will setLoading(false) only in catch block? No, standard is finally.
      // Let's just setLoading(false) here. If nav happens fast, it doesn't matter.
      setLoading(false);
    }
  };

  const [open, setOpen] = useState(false);

  const creatorTypes = [
    "Influencer", "Content Creator", "Agency", "Digital Artist", "Social Marketer"
  ];

  const priorities = ["United Arab Emirates", "United States", "United Kingdom", "Canada", "Australia", "Saudi Arabia", "Qatar"];
  const allCountries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
    "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic",
    "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti",
    "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
    "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland",
    "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
    "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
    "Mozambique", "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan",
    "Palestine", "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Singapore", "Slovakia",
    "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Vietnam"
  ].sort();

  return (
    <div className="space-y-5">
      {selectedPlan && (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 mb-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-plus-jakarta">Protocol Selection</span>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border font-plus-jakarta ${selectedPlan.name.toLowerCase() === 'free' ? 'bg-slate-200 border-slate-300 text-slate-600' : 'bg-blue-100 border-blue-200 text-blue-600'}`}>
              {selectedPlan.name}
            </span>
          </div>
          <select
            className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-plus-jakarta h-10"
            value={selectedPlan.id}
            onChange={(e) => {
              const pkg = packages.find(p => p.id === e.target.value);
              if (pkg) setSelectedPlan(pkg);
            }}
          >
            {/* Monthly Plans */}
            <optgroup label="Monthly Protocols">
              {packages
                .filter(p => p.name.toLowerCase() !== 'free' && (p.billingCycle === 'monthly' || !p.billingCycle))
                .sort((a, b) => a.price - b.price)
                .map(p => (
                  <option key={p.id} value={p.id}>{p.name} — ${p.price}/mo</option>
                ))}
            </optgroup>

            {/* Yearly Plans */}
            <optgroup label="Yearly Protocols (Save ~20%)">
              {packages
                .filter(p => p.name.toLowerCase() !== 'free' && p.billingCycle === 'yearly')
                .sort((a, b) => a.price - b.price)
                .map(p => (
                  <option key={p.id} value={p.id}>{p.name} — ${p.price * 12}/yr</option>
                ))}
            </optgroup>

            {/* Free Tier */}
            <optgroup label="Starter Access">
              {packages.filter(p => p.name.toLowerCase() === 'free').map(p => (
                <option key={p.id} value={p.id}>{p.name} — Free</option>
              ))}
            </optgroup>
          </select>
        </div>
      )}

      {alert && (
        <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-600 rounded-lg py-3">
          <AlertDescription className="font-bold text-[10px] uppercase tracking-tight font-plus-jakarta">{alert}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
            <User className="h-3 w-3 text-[#3B82F6]" /> Creator Name
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Zia Muhammad"
            required
            className="h-11 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50 transition-all text-[#0C1B33]"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
            <Mail className="h-3 w-3 text-[#3B82F6]" /> Communications
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="zia@example.com"
            required
            className="h-11 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50 transition-all text-[#0C1B33]"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
              <Lock className="h-3 w-3 text-[#3B82F6]" /> Secure Key
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••"
              required
              className="h-11 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50 transition-all text-[#0C1B33]"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
              <Lock className="h-3 w-3 text-[#3B82F6]" /> Confirm Key
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••"
              required
              className={`h-11 rounded-[6px] border-slate-200 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold text-sm bg-slate-50/50 transition-all text-[#0C1B33] ${form.password && form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-300 ring-red-100' : ''}`}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label htmlFor="creatorType" className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
              <Building2 className="h-3 w-3 text-[#3B82F6]" /> Identity
            </label>
            <select
              id="creatorType"
              className="flex h-11 w-full rounded-[6px] border border-slate-200 bg-slate-50/50 px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-50 font-plus-jakarta transition-all text-[#0C1B33]"
              value={form.creatorType}
              onChange={(e) => setForm({ ...form, creatorType: e.target.value })}
            >
              {creatorTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="country" className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0C1B33] flex items-center gap-2 font-plus-jakarta">
              <Globe className="h-3 w-3 text-[#3B82F6]" /> Origin
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "h-11 w-full justify-between rounded-[6px] border border-slate-200 bg-slate-50/50 px-3 py-2 text-[10px] font-black uppercase tracking-widest font-plus-jakarta transition-all hover:bg-slate-50 text-[#0C1B33]",
                    !form.country && "text-muted-foreground"
                  )}
                >
                  {form.country
                    ? allCountries.find((c) => c === form.country)
                    : "Search..."}
                  <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command className="font-plus-jakarta">
                  <CommandInput placeholder="Search Country..." className="h-9 text-[10px] font-bold uppercase tracking-widest" />
                  <CommandList className="max-h-[200px]">
                    <CommandEmpty className="text-[10px] font-bold uppercase py-4">Unknown Sector.</CommandEmpty>
                    <CommandGroup heading="Priorities" className="text-[9px] font-black uppercase opacity-60">
                      {priorities.map((c) => (
                        <CommandItem
                          key={c}
                          value={c}
                          onSelect={() => {
                            setForm({ ...form, country: c });
                            setOpen(false);
                          }}
                          className="text-[10px] font-bold uppercase cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-3 w-3",
                              form.country === c ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {c}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandGroup heading="Global Registry" className="text-[9px] font-black uppercase opacity-60">
                      {allCountries.map((c) => (
                        <CommandItem
                          key={c}
                          value={c}
                          onSelect={() => {
                            setForm({ ...form, country: c });
                            setOpen(false);
                          }}
                          className="text-[10px] font-bold uppercase cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-3 w-3",
                              form.country === c ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {c}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={setAgreeToTerms}
              className="mt-1 border-slate-300 data-[state=checked]:bg-[#3B82F6] data-[state=checked]:border-[#3B82F6] transition-all"
            />
            <label htmlFor="terms" className="text-[9px] font-bold text-[#3E4652] leading-normal uppercase tracking-widest font-plus-jakarta cursor-pointer">
              Agree to <Link href="/terms" className="text-[#3B82F6] font-black hover:underline transition-all">Terms</Link> & <Link href="/privacy" className="text-[#3B82F6] font-black hover:underline transition-all">Privacy</Link>.
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="updates"
              checked={receiveUpdates}
              onCheckedChange={setReceiveUpdates}
              className="mt-1 border-slate-300 data-[state=checked]:bg-[#3B82F6] data-[state=checked]:border-[#3B82F6] transition-all"
            />
            <label htmlFor="updates" className="text-[9px] font-bold text-[#3E4652] leading-normal uppercase tracking-widest font-plus-jakarta cursor-pointer">
              Receive release node protocols.
            </label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-[#F9C80E] hover:bg-[#eac00d] text-[#0C1B33] rounded-[6px] font-black text-xs uppercase tracking-[0.15em] transition-all active:scale-[0.98] shadow-subtle mt-2 font-plus-jakarta"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Account"}
        </Button>
      </form>



      <div className="pt-6 text-center">
        <p className="text-xs font-bold text-[#3E4652] uppercase tracking-widest font-plus-jakarta">
          Already registered?{" "}
          <Link href="/auth/login" className="text-[#3B82F6] font-black hover:underline ml-1">
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <AuthLayout
      title="Join the Network"
      subtitle="Start your zero-friction content scale today."
      visualTitle={<>Deploy your <br /><span className='text-[#3B82F6]'>Social Influence</span> <br />with Intelligence.</>}
      visualFeatures={[
        "Multi-platform scheduling across every major node.",
        "AI-powered resonance optimization for peak window triggers.",
        "Unified analytics tracking your entire social graph."
      ]}
    >
      <Suspense fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
