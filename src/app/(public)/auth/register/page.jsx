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
    } finally {
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
        <div className="bg-[rgba(255,255,255,0.4)] border border-[rgba(160,140,190,0.2)] rounded-3xl p-5 mb-2 backdrop-blur-[2px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#a08cbc] font-sans">Protocol Selection</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border font-sans ${selectedPlan.name.toLowerCase() === 'free' ? 'bg-[#f5f1fc] border-[rgba(160,140,190,0.3)] text-[#5e4a7a]' : 'bg-[#e1d7f5] border-[rgba(94,74,122,0.3)] text-[#3a2e4a]'}`}>
              {selectedPlan.name}
            </span>
          </div>
          <select
            className="w-full bg-white/50 border border-[rgba(160,140,190,0.2)] rounded-2xl px-4 py-2 text-xs font-semibold outline-none focus:ring-[rgba(94,74,122,0.1)] focus:border-[#5e4a7a] transition-all font-sans h-[48px] cursor-pointer"
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
        <Alert variant="destructive" className="bg-[rgba(255,100,100,0.1)] border-[rgba(255,100,100,0.2)] text-[#e5484d] rounded-2xl backdrop-blur-[4px] py-4">
          <AlertDescription className="font-semibold text-xs tracking-tight">{alert}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#4a3c60] flex items-center gap-2 font-sans ml-1">
            <User className="h-3.5 w-3.5 text-[#5e4a7a]" /> Creator Name
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Zia Muhammad"
            required
            className="h-[50px] rounded-[20px] border-[rgba(160,140,190,0.25)] bg-[rgba(255,255,255,0.4)] focus:bg-[rgba(255,255,255,0.6)] focus:ring-[rgba(94,74,122,0.1)] focus:border-[#5e4a7a] font-medium text-sm placeholder:text-[#a08cbc] transition-all backdrop-blur-[2px] text-[#201c2b]"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#4a3c60] flex items-center gap-2 font-sans ml-1">
            <Mail className="h-3.5 w-3.5 text-[#5e4a7a]" /> Communications
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="zia@example.com"
            required
            className="h-[50px] rounded-[20px] border-[rgba(160,140,190,0.25)] bg-[rgba(255,255,255,0.4)] focus:bg-[rgba(255,255,255,0.6)] focus:ring-[rgba(94,74,122,0.1)] focus:border-[#5e4a7a] font-medium text-sm placeholder:text-[#a08cbc] transition-all backdrop-blur-[2px] text-[#201c2b]"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#4a3c60] flex items-center gap-2 font-sans ml-1">
              <Lock className="h-3.5 w-3.5 text-[#5e4a7a]" /> Secure Key
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••"
              required
              className="h-[50px] rounded-[20px] border-[rgba(160,140,190,0.25)] bg-[rgba(255,255,255,0.4)] focus:bg-[rgba(255,255,255,0.6)] focus:ring-[rgba(94,74,122,0.1)] focus:border-[#5e4a7a] font-medium text-sm placeholder:text-[#a08cbc] transition-all backdrop-blur-[2px] text-[#201c2b]"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#4a3c60] flex items-center gap-2 font-sans ml-1">
              <Lock className="h-3.5 w-3.5 text-[#5e4a7a]" /> Confirm Key
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••"
              required
              className={`h-[50px] rounded-[20px] border-[rgba(160,140,190,0.25)] bg-[rgba(255,255,255,0.4)] focus:bg-[rgba(255,255,255,0.6)] focus:ring-[rgba(94,74,122,0.1)] focus:border-[#5e4a7a] font-medium text-sm placeholder:text-[#a08cbc] transition-all backdrop-blur-[2px] text-[#201c2b] ${form.password && form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-300 ring-red-100' : ''}`}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="creatorType" className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#4a3c60] flex items-center gap-2 font-sans ml-1">
              <Building2 className="h-3.5 w-3.5 text-[#5e4a7a]" /> Identity
            </label>
            <select
              id="creatorType"
              className="flex h-[50px] w-full rounded-[20px] border border-[rgba(160,140,190,0.25)] bg-[rgba(255,255,255,0.4)] px-4 py-2 text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-[rgba(94,74,122,0.1)] focus:border-[#5e4a7a] disabled:cursor-not-allowed disabled:opacity-50 font-sans transition-all text-[#201c2b] cursor-pointer"
              value={form.creatorType}
              onChange={(e) => setForm({ ...form, creatorType: e.target.value })}
            >
              {creatorTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="country" className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#4a3c60] flex items-center gap-2 font-sans ml-1">
              <Globe className="h-3.5 w-3.5 text-[#5e4a7a]" /> Origin
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "h-[50px] w-full justify-between rounded-[20px] border border-[rgba(160,140,190,0.25)] bg-[rgba(255,255,255,0.4)] px-4 py-2 text-xs font-bold uppercase tracking-widest font-sans transition-all hover:bg-[rgba(255,255,255,0.5)] text-[#201c2b]",
                    !form.country && "text-muted-foreground"
                  )}
                >
                  {form.country
                    ? allCountries.find((c) => c === form.country)
                    : "Search..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-[20px] overflow-hidden border-[rgba(160,140,190,0.2)]" align="start">
                <Command className="font-sans">
                  <CommandInput placeholder="Search Country..." className="h-10 text-xs font-bold uppercase tracking-widest border-none focus:ring-0" />
                  <CommandList className="max-h-[200px]">
                    <CommandEmpty className="text-xs font-bold uppercase py-4 text-center">Unknown Sector.</CommandEmpty>
                    <CommandGroup heading="Priorities" className="text-[10px] font-black uppercase opacity-40 px-3 py-2">
                      {priorities.map((c) => (
                        <CommandItem
                          key={c}
                          value={c}
                          onSelect={() => {
                            setForm({ ...form, country: c });
                            setOpen(false);
                          }}
                          className="text-xs font-bold uppercase cursor-pointer py-2 px-3 hover:bg-[#f5f1fc] transition-colors"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-[#5e4a7a]",
                              form.country === c ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {c}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandGroup heading="Global Registry" className="text-[10px] font-black uppercase opacity-40 px-3 py-2">
                      {allCountries.map((c) => (
                        <CommandItem
                          key={c}
                          value={c}
                          onSelect={() => {
                            setForm({ ...form, country: c });
                            setOpen(false);
                          }}
                          className="text-xs font-bold uppercase cursor-pointer py-2 px-3 hover:bg-[#f5f1fc] transition-colors"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-[#5e4a7a]",
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

        <div className="space-y-3 pt-2">
          <div className="flex items-start space-x-3 ml-1">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={setAgreeToTerms}
              className="mt-1 border-[rgba(160,140,190,0.4)] data-[state=checked]:bg-[#5e4a7a] data-[state=checked]:border-[#5e4a7a] rounded-md transition-all h-5 w-5"
            />
            <label htmlFor="terms" className="text-[11px] font-bold text-[#4a3c60] leading-normal uppercase tracking-widest font-sans cursor-pointer">
              Agree to <Link href="/terms" className="text-[#5e4a7a] font-bold hover:underline transition-all">Terms</Link> & <Link href="/privacy" className="text-[#5e4a7a] font-bold hover:underline transition-all">Privacy</Link>.
            </label>
          </div>

          <div className="flex items-start space-x-3 ml-1">
            <Checkbox
              id="updates"
              checked={receiveUpdates}
              onCheckedChange={setReceiveUpdates}
              className="mt-1 border-[rgba(160,140,190,0.4)] data-[state=checked]:bg-[#5e4a7a] data-[state=checked]:border-[#5e4a7a] rounded-md transition-all h-5 w-5"
            />
            <label htmlFor="updates" className="text-[11px] font-bold text-[#4a3c60] leading-normal uppercase tracking-widest font-sans cursor-pointer">
              Receive release node protocols.
            </label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-[54px] bg-[#2d253b] hover:bg-[#3e3152] text-white rounded-[60px] font-bold text-sm uppercase tracking-[0.1em] transition-all active:scale-[0.98] shadow-lg shadow-[#2d253b]/10 mt-4 cursor-pointer border-none"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Deploy Account"}
        </Button>
      </form>



      <div className="pt-6 text-center border-t border-[rgba(160,140,190,0.1)]">
        <p className="text-sm font-medium text-[#4a3c60] font-sans">
          Already registered?{" "}
          <Link href="/auth/login" className="text-[#5e4a7a] font-bold hover:underline ml-1 transition-all decoration-[#5e4a7a]/30 underline-offset-4">
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
      visualTitle={<>Deploy your <br /><span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent font-bold">Social Influence</span> <br />with Intelligence.</>}
      visualFeatures={[
        "Multi-platform scheduling across every major node.",
        "AI-powered resonance optimization for peak window triggers.",
        "Unified analytics tracking your entire social graph."
      ]}
    >
      <Suspense fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#5e4a7a]" />
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
