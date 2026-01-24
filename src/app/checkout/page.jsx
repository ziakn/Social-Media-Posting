"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { createSubscriptionCheckout } from "@/app/actions/subscriptions/subscriptionActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Check, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = usePermissions();

    const [loading, setLoading] = useState(false);
    const [packageData, setPackageData] = useState(null);

    const packageName = searchParams.get("package"); // e.g., "Creator"
    const billingCycle = searchParams.get("billing") || "monthly"; // monthly or yearly

    useEffect(() => {
        // Wait for auth to load
        if (authLoading) return;

        // Redirect to login if not authenticated
        if (!user) {
            router.push(`/auth/login?redirect=/checkout?package=${packageName}&billing=${billingCycle}`);
            return;
        }

        // Load package data
        loadPackageData();
    }, [user, packageName, billingCycle, authLoading]);

    const loadPackageData = async () => {
        // In a real implementation, fetch package details from database
        // For now, using static data based on package name
        const packages = {
            Creator: {
                name: "Creator",
                description: "For influencers and serious content creators",
                monthly: 29,
                yearly: 24,
                features: [
                    "10 Social Accounts",
                    "Unlimited Scheduled Posts",
                    "Advanced Analytics",
                    "AI Caption Generator (50/mo)",
                ],
            },
            Pro: {
                name: "Pro",
                description: "For small teams and growing brands",
                monthly: 59,
                yearly: 49,
                features: [
                    "25 Social Accounts",
                    "3 User Seats",
                    "Team Approval Workflow",
                    "AI Caption Generator (Unlimited)",
                ],
            },
            Agency: {
                name: "Agency",
                description: "For agencies managing multiple clients",
                monthly: 149,
                yearly: 129,
                features: [
                    "50 Social Accounts",
                    "10 User Seats",
                    "Client Approval Portals",
                    "White-label Reports",
                ],
            },
        };

        setPackageData(packages[packageName]);
    };

    const handleCheckout = async () => {
        if (!user) {
            toast.error("Please log in to continue");
            return;
        }

        try {
            setLoading(true);

            const result = await createSubscriptionCheckout({
                userId: user.id,
                packageId: packageName,
                billingCycle,
            });

            if (!result.success) {
                toast.error(result.error || "Failed to create checkout session");
                return;
            }

            // Redirect to Stripe Checkout
            window.location.href = result.url;
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!packageData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    const price = billingCycle === "yearly" ? packageData.yearly : packageData.monthly;
    const yearlyTotal = packageData.yearly * 12;
    const monthlySavings = billingCycle === "yearly" ? (packageData.monthly * 12) - yearlyTotal : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push("/pricing")}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Pricing
                </Button>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Package Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{packageData.name} Plan</CardTitle>
                            <CardDescription>{packageData.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Price */}
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold">${price}</span>
                                    <span className="text-gray-600">/month</span>
                                </div>
                                {billingCycle === "yearly" && (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-gray-600">
                                            Billed ${yearlyTotal} annually
                                        </p>
                                        <p className="text-sm text-green-600 font-medium">
                                            Save ${monthlySavings}/year vs monthly
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Trial */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-blue-900">
                                    🎉 14-day free trial included
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    Cancel anytime during trial, no charges
                                </p>
                            </div>

                            {/* Features */}
                            <div>
                                <h3 className="font-semibold mb-3">What's included:</h3>
                                <ul className="space-y-2">
                                    {packageData.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Checkout Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Complete Your Subscription</CardTitle>
                            <CardDescription>
                                You'll be redirected to Stripe to securely enter payment details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* User Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-700">Account</p>
                                <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
                            </div>

                            {/* Order Summary */}
                            <div className="space-y-3">
                                <h3 className="font-semibold">Order Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {packageData.name} Plan ({billingCycle})
                                        </span>
                                        <span className="font-medium">${price}/mo</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">14-day trial</span>
                                        <span className="font-medium text-green-600">FREE</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">Due today</span>
                                            <span className="font-bold">$0.00</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            First charge on {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <Button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    "Continue to Payment"
                                )}
                            </Button>

                            {/* Trust Badges */}
                            <div className="text-center space-y-2">
                                <p className="text-xs text-gray-500">
                                    🔒 Secure payment powered by Stripe
                                </p>
                                <p className="text-xs text-gray-500">
                                    Cancel anytime • No hidden fees
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
