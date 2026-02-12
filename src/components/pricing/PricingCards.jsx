import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PricingCards({ plans, isAnnual, onCheckout, loadingPrice }) {
    return (
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-32 relative z-10">
            {plans.map((plan) => (
                <div
                    key={plan.id}
                    className={cn(
                        "p-8 rounded-[32px] border flex flex-col transition-all duration-300 relative group overflow-hidden h-full",
                        plan.popular
                            ? 'bg-[#5e4a7a] border-[#5e4a7a] text-white shadow-2xl scale-105 z-10'
                            : 'bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border-[rgba(255,255,255,0.6)] text-[#2d253b] shadow-lg hover:bg-[rgba(255,255,255,0.6)]'
                    )}
                >
                    {plan.popular && (
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-white to-white/80"></div>
                    )}

                    {plan.popular && (
                        <div className="absolute top-6 right-6">
                            <span className="bg-white text-[#5e4a7a] font-bold text-[0.65rem] uppercase px-3 py-1 rounded-full tracking-widest shadow-lg"> Most Popular</span>
                        </div>
                    )}

                    <div className="mb-8 space-y-2 mt-2">
                        <h3 className="text-[1.4rem] font-bold tracking-tight">{plan.name}</h3>
                        <p className={cn(
                            "text-[0.9rem] font-normal leading-relaxed h-10",
                            plan.popular ? 'text-slate-200' : 'text-[#4a3d58]'
                        )}>
                            {plan.description}
                        </p>
                    </div>

                    <div className="flex items-baseline mb-8">
                        {plan.price !== "Custom" && <span className="text-3xl font-bold tracking-tighter">$</span>}
                        <span className="text-5xl font-bold tracking-tighter">
                            {plan.price}
                        </span>
                        {plan.price !== "Custom" && (
                            <span className={cn(
                                "ml-1 text-[0.9rem] font-bold",
                                plan.popular ? 'text-slate-300' : 'text-[#6f5b8b]'
                            )}>
                                /{plan.interval === 'year' ? 'yr' : 'mo'}
                            </span>
                        )}
                    </div>

                    {isAnnual && plan.price > 0 && (
                        <div className={cn(
                            "-mt-6 mb-6 text-[0.75rem] font-bold",
                            plan.popular ? 'text-white/90' : 'text-[#5e4a7a]'
                        )}>
                            Billed ${plan.price * 12} yearly
                        </div>
                    )}

                    <ul className="space-y-4 mb-10 flex-1">
                        {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-[0.85rem] font-medium group/item leading-snug">
                                <div className={cn(
                                    "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                                    plan.popular ? 'bg-white text-[#5e4a7a]' : 'bg-[#5e4a7a]/10 text-[#5e4a7a]'
                                )}>
                                    <Check className="h-2.5 w-2.5" />
                                </div>
                                <span className={plan.popular ? 'text-slate-100' : 'text-[#4a3d58]'}>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {plan.priceId ? (
                        <button
                            className={cn(
                                "w-full py-4 rounded-[16px] font-bold text-[0.85rem] uppercase tracking-widest transition-all shadow-md active:scale-95",
                                plan.popular
                                    ? 'bg-white text-[#5e4a7a] hover:bg-white/90 shadow-white/20'
                                    : 'bg-[#2d253b] text-white hover:bg-[#3f3155] shadow-[#2d253b]/10'
                            )}
                            onClick={() => onCheckout && onCheckout(plan.priceId)}
                            disabled={loadingPrice === plan.priceId}
                        >
                            {loadingPrice === plan.priceId ? "Redirecting..." : "Start Now"}
                        </button>
                    ) : (
                        <Link href="/auth/register" className="block mt-auto">
                            <button className={cn(
                                "w-full py-4 rounded-[16px] font-bold text-[0.85rem] uppercase tracking-widest transition-all shadow-md active:scale-95",
                                plan.popular
                                    ? 'bg-white text-[#5e4a7a] hover:bg-white/90 shadow-white/20'
                                    : 'bg-[#2d253b] text-white hover:bg-[#3f3155] shadow-[#2d253b]/10'
                            )}>
                                Start Now
                            </button>
                        </Link>
                    )}
                </div>
            ))}
        </div>
    );
}
