"use client";

import { useState } from "react";
import { Check, Zap, Rocket, ShieldCheck } from "lucide-react";

const plans = [
  {
    name: "Starter Kit",
    price: "0",
    description: "New to the platform? Get started with free credits.",
    features: [
      "100 Free Coins",
      "All Social Platforms",
      "Basic Analytics",
      "Single Account",
    ],
    coinAmount: 100,
    isFree: true,
    buttonText: "Claimed",
    disabled: true,
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    name: "Starter Package",
    price: "20",
    description: "Ideal for growing creators who need more reach.",
    features: [
      "200 Coins",
      "No Expiry",
      "Priority Support",
      "3 Social Accounts",
    ],
    coinAmount: 200,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || "price_starter_placeholder",
    isFree: false,
    buttonText: "Buy 200 Coins",
    popular: true,
    icon: <Rocket className="w-6 h-6 text-purple-500" />,
    gradient: "from-purple-50 to-pink-50",
  },
  {
    name: "Pro Package",
    price: "50",
    description: "For professionals and agencies managing multiple brands.",
    features: [
      "800 Coins",
      "Premium Templates",
      "24/7 Support",
      "Unlimited Accounts",
    ],
    coinAmount: 800,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || "price_pro_placeholder",
    isFree: false,
    buttonText: "Buy 800 Coins",
    icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
    gradient: "from-blue-50 to-cyan-50",
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (plan) => {
    if (plan.isFree) return;
    setLoading(plan.name);
 
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          priceId: plan.priceId,
          coinAmount: plan.coinAmount 
        }),
      });
 
      const { url, error: apiError } = await response.json();
      if (apiError) throw new Error(apiError);
 
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received from Stripe.");
      }
      
    } catch (err) {
      console.error("Stripe checkout error:", err);
      alert(err.message || "Failed to initiate checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">Pricing</h2>
          <h1 className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Choose Your Growth Path
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Simple, transparent plans designed to scale with your social media presence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-8 bg-white border border-gray-100 rounded-3xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.popular ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -translate-y-1/2 px-4 py-1 bg-indigo-500 text-white text-sm font-bold rounded-full mr-8">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center justify-between mb-8">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${plan.gradient}`}>
                  {plan.icon}
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold tracking-tight text-gray-900">${plan.price}</span>
                  <span className="ml-1 text-xl font-medium text-gray-500">/mo</span>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <ul className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-600">{feature}</p>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={plan.disabled || (loading === plan.name)}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 transform active:scale-95 ${
                    plan.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                      : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200"
                  } ${plan.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading === plan.name ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm italic">
            One-time payment for lifetime credits. Secure payment via Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
