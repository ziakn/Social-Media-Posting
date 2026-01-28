"use client";

import { useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { getBillingProfile, getLatestInvoice } from "@/app/actions/billing/billingActions";
import { createCheckoutSession, createPortalSession } from "@/app/actions/billing/stripeActions";
import { syncSubscription } from "@/app/actions/billing/syncActions";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Check,
    ArrowRight,
    ShieldCheck,
    Zap,
    XCircle,
    Info,
    ExternalLink,
    AlertCircle,
    Clock
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function SubscriptionPage() {
    const { user } = usePermissions();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [profile, setProfile] = useState(null);
    const [latestInvoice, setLatestInvoice] = useState(null);
    const [allPackages, setAllPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [managementLoading, setManagementLoading] = useState(false);

    // UI States
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [targetPlan, setTargetPlan] = useState(null);

    useEffect(() => {
        if (user?.id) {
            checkSuccess();
            fetchData();
        }
    }, [user, searchParams]);

    const checkSuccess = async () => {
        if (searchParams.get('success') === 'true') {
            setLoading(true); // Don't block whole UI, maybe just a toast
            toast.info("Verifying payment with Stripe...");
            const res = await syncSubscription();
            if (res.success) {
                toast.success("Subscription activated successfully!");
                // Clear URL param
                router.replace('/admin/subscription');
                fetchData(); // Reload data
            } else {
                toast.warning("Payment successful, but syncing is delayed. Refresh shortly.");
            }
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const profileRes = await getBillingProfile(user.id);
            if (profileRes.success) setProfile(profileRes.profile);

            const invoiceRes = await getLatestInvoice(user.id);
            if (invoiceRes.success) setLatestInvoice(invoiceRes.invoice);

            const pkgSnap = await getDocs(query(collection(db, "packages"), where("isActive", "==", true)));
            const pkgs = pkgSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => (a.price || 0) - (b.price || 0));
            setAllPackages(pkgs);
        } catch (error) {
            console.error("Error fetching subscription data:", error);
            toast.error("Failed to load subscription details.");
        } finally {
            setLoading(false);
        }
    };

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

    const handleUpdateSubscription = async () => {
        setManagementLoading(true);
        try {
            // Case 1: Switching to Free -> Just cancel in Portal (Redirect)
            // Case 2: Changing Paid Plan -> Check if we already have a subscription
            const isSubscribed = profile?.status === 'active' || profile?.status === 'past_due';

            if (isSubscribed) {
                // Redirect to Portal for upgrades/downgrades/cancellation
                const res = await createPortalSession();
                if (res.success) {
                    window.location.href = res.url;
                } else {
                    toast.error(res.error || "Failed to load management portal");
                }
            } else {
                // New Subscription via Checkout
                const priceId = getStripePriceId(targetPlan.name, targetPlan.billingCycle);
                if (!priceId) {
                    toast.error("Configuration Error: Price ID not found for this plan.");
                    return;
                }

                const res = await createCheckoutSession(priceId);
                if (res.success) {
                    window.location.href = res.url;
                } else {
                    toast.error(res.error || "Failed to start checkout");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setManagementLoading(false);
            setIsManageModalOpen(false);
        }
    };

    const handleCancelSubscription = async () => {
        // Redirect to Portal
        setManagementLoading(true);
        try {
            const res = await createPortalSession();
            if (res.success) {
                window.location.href = res.url;
            } else {
                toast.error(res.error || "Failed to access cancellation portal");
            }
        } catch (error) {
            toast.error("Error: " + error.message);
        } finally {
            setManagementLoading(false);
        }
    };

    if (loading) return <Spinner />;

    const currentPlan = allPackages.find(p => p.name === profile?.packageName && p.billingCycle === profile?.billingCycle);
    const billingCycleLabel = profile?.billingCycle === 'yearly' ? 'Yearly' : 'Monthly';

    return (
        <div className="p-6 space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-xl font-semibold">Subscription & Plans</CardTitle>
                        <CardDescription>Manage your subscription tier and billing settings.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Compact Status Header */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                                <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">
                                    {profile?.packageName || "Free"} Protocol
                                    <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded font-black tracking-widest uppercase">
                                        {profile?.status?.toUpperCase() || 'ACTIVE'}
                                    </span>
                                </h3>
                                <div className="flex items-center gap-3">
                                    <p className="text-xs text-gray-500 font-medium tracking-tight flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Next billing: {profile?.nextBillingDate ? new Date(profile.nextBillingDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium tracking-tight border-l pl-3 border-gray-200">
                                        Amount: ${profile?.amount || 0}/{billingCycleLabel}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {profile?.packageName !== 'Free' && profile?.status !== 'canceled' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-[10px] font-bold uppercase tracking-widest border-red-100 text-red-600 hover:bg-red-50 shadow-none"
                                    onClick={() => { setSelectedAction('cancel'); setIsManageModalOpen(true); }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Industry Standard: Last Bill Status */}
                    {latestInvoice && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {latestInvoice.status === 'paid' ? (
                                    <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center">
                                        <Check className="h-4 w-4 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="h-8 w-8 bg-amber-50 rounded-full flex items-center justify-center animate-pulse">
                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Latest Statement</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-900">{latestInvoice.invoiceId}</span>
                                        <span className={`text-[9px] px-1 rounded font-bold uppercase ${latestInvoice.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {latestInvoice.status}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-medium">Recorded: {new Date(latestInvoice.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <Link href={`/admin/invoices`} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                                Full History <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    )}

                    {/* Available Plans */}
                    <div className="space-y-8 pt-2">
                        {/* Monthly Plans */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Monthly Protocols</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {allPackages.filter(p => p.billingCycle === 'monthly').map((pkg) => {
                                    const isCurrent = pkg.name === profile?.packageName && profile?.billingCycle === 'monthly';
                                    const isHigher = (pkg.price || 0) > (profile?.amount || 0);

                                    return (
                                        <div key={pkg.id} className={`p-4 rounded-lg border flex flex-col transition-colors ${isCurrent ? 'border-primary/50 bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                                                    {pkg.name}
                                                    {isCurrent && <span className="ml-2 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">CURRENT</span>}
                                                </h4>
                                                <p className="text-sm font-black text-gray-900">${pkg.price}<span className="text-[10px] text-gray-400 font-normal">/mo</span></p>
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium mb-4 line-clamp-1">{pkg.description || 'Pro features'}</p>

                                            <div className="space-y-1.5 mb-5 flex-grow">
                                                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-tight">
                                                    <Check className="h-3 w-3 text-primary" />
                                                    {pkg.limits?.socialAccounts === -1 ? 'Unlimited' : pkg.limits?.socialAccounts} connected networks
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-tight">
                                                    <Check className="h-3 w-3 text-primary" />
                                                    {pkg.limits?.scheduledPosts === -1 ? 'Unlimited' : pkg.limits?.scheduledPosts} posts / mo
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                disabled={isCurrent}
                                                variant={isHigher ? "secondary" : "outline"}
                                                className="w-full h-8 text-[10px] font-black uppercase tracking-widest shadow-none"
                                                onClick={() => {
                                                    setTargetPlan(pkg);
                                                    setSelectedAction('upgrade');
                                                    setIsManageModalOpen(true);
                                                }}
                                            >
                                                {isCurrent ? 'Current Plan' : (isHigher ? 'Upgrade' : 'Select')}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Yearly Plans */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Yearly Protocols <span className="ml-2 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[9px] normal-case tracking-normal font-bold">Save up to 20%</span></h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {allPackages.filter(p => p.billingCycle === 'yearly').map((pkg) => {
                                    const isCurrent = pkg.name === profile?.packageName && profile?.billingCycle === 'yearly';
                                    const isHigher = (pkg.price || 0) > (profile?.amount || 0); // Logic might be tricky comparing monthly amount to yearly price, but price field usually stores strictly the cycle price. 
                                    // If profile is monthly ($29) and pkg is yearly ($290), isHigher is true.

                                    return (
                                        <div key={pkg.id} className={`p-4 rounded-lg border flex flex-col transition-colors ${isCurrent ? 'border-primary/50 bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                                                    {pkg.name}
                                                    {isCurrent && <span className="ml-2 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">CURRENT</span>}
                                                </h4>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-gray-900">${pkg.price}<span className="text-[10px] text-gray-400 font-normal">/yr</span></p>
                                                    <p className="text-[9px] text-emerald-600 font-bold">{(pkg.price / 12).toFixed(0)}/mo</p>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium mb-4 line-clamp-1">{pkg.description || 'Pro features'}</p>

                                            <div className="space-y-1.5 mb-5 flex-grow">
                                                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-tight">
                                                    <Check className="h-3 w-3 text-primary" />
                                                    {pkg.limits?.socialAccounts === -1 ? 'Unlimited' : pkg.limits?.socialAccounts} connected networks
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-tight">
                                                    <Check className="h-3 w-3 text-primary" />
                                                    {pkg.limits?.scheduledPosts === -1 ? 'Unlimited' : pkg.limits?.scheduledPosts} posts / mo
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                disabled={isCurrent}
                                                variant={isHigher ? "secondary" : "outline"}
                                                className="w-full h-8 text-[10px] font-black uppercase tracking-widest shadow-none"
                                                onClick={() => {
                                                    setTargetPlan(pkg);
                                                    setSelectedAction('upgrade');
                                                    setIsManageModalOpen(true);
                                                }}
                                            >
                                                {isCurrent ? 'Current Plan' : (isHigher ? 'Upgrade' : 'Select')}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Assistance Info */}
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-4 border-t border-gray-50">
                        <Info className="h-3.5 w-3.5" />
                        Need custom limits? <Link href="/help" className="text-primary hover:underline">Contact Enterprise Support Node</Link>
                    </div>
                </CardContent>
            </Card>

            {/* Management Modal */}
            <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
                <DialogContent className="sm:max-w-[380px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold uppercase tracking-tight italic">
                            {selectedAction === 'upgrade' ? `Initialize Upgrade` : 'Terminate Session'}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-gray-500 pt-2 leading-relaxed">
                            {selectedAction === 'upgrade'
                                ? `Transitioning to ${targetPlan?.name} for $${targetPlan?.price}/mo. Access level will be scaled immediately.`
                                : 'Terminating your session will revoke access level features at the end of the current billing cycle.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={managementLoading}
                            onClick={() => setIsManageModalOpen(false)}
                            className="flex-1 text-[10px] font-black uppercase tracking-widest"
                        >
                            Abort
                        </Button>
                        <Button
                            size="sm"
                            disabled={managementLoading}
                            onClick={selectedAction === 'upgrade' ? handleUpdateSubscription : handleCancelSubscription}
                            variant={selectedAction === 'upgrade' ? 'default' : 'destructive'}
                            className="flex-1 text-[10px] font-black uppercase tracking-widest h-9"
                        >
                            {managementLoading ? <Spinner className="h-3 w-3" /> : 'Confirm'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
