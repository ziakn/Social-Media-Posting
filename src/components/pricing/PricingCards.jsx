import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PricingCards({ plans, isAnnual, onCheckout, loadingPrice }) {
    return (
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 mb-32">
            {plans.map((plan) => (
                <div
                    key={plan.id}
                    className={cn(
                        "relative flex flex-col p-6 rounded-2xl bg-white border h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1",
                        plan.popular ? "border-primary shadow-lg ring-2 ring-primary/10" : "border-gray-200 shadow-sm"
                    )}
                >
                    {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            Most Popular
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 font-display mb-2">{plan.name}</h3>
                        <p className="text-gray-500 text-sm h-10">{plan.description}</p>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-gray-900 tracking-tight">${plan.price}</span>
                            <span className="text-gray-500 text-sm font-medium">/{plan.interval}</span>
                        </div>
                        {isAnnual && plan.price > 0 && (
                            <div className="text-xs text-success font-medium mt-1">
                                Billed ${plan.price * 12} yearly
                            </div>
                        )}
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {
                        plan.priceId ? (
                            <Button
                                className={cn(
                                    "w-full font-bold",
                                    plan.popular
                                        ? "bg-primary hover:bg-primary/90 text-white"
                                        : "bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-200"
                                )}
                                variant={plan.popular ? "default" : "outline"}
                                onClick={() => onCheckout && onCheckout(plan.priceId)}
                                disabled={loadingPrice === plan.priceId}
                            >
                                {loadingPrice === plan.priceId ? "Redirecting..." : plan.cta}
                            </Button>
                        ) : (
                            <Link href="/auth/register" className="mt-auto">
                                <Button
                                    className={cn(
                                        "w-full font-bold",
                                        plan.popular
                                            ? "bg-primary hover:bg-primary/90 text-white"
                                            : "bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-200"
                                    )}
                                    variant={plan.popular ? "default" : "outline"}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>
                        )
                    }
                </div>
            ))
            }
        </div >
    );
}
