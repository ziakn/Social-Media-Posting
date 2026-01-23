"use client";

import { useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { getBillingProfile, updateBillingSubscription, cancelBillingSubscription } from "@/app/actions/billing/billingActions";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import {
    Check,
    ArrowRight,
    ShieldCheck,
    Zap,
    XCircle,
    Info,
    ExternalLink
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
    const [profile, setProfile] = useState(null);
    const [allPackages, setAllPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [managementLoading, setManagementLoading] = useState(false);

    // UI States
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [targetPlan, setTargetPlan] = useState(null);

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const profileRes = await getBillingProfile(user.id);
            if (profileRes.success) setProfile(profileRes.profile);

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

    const handleUpdateSubscription = async () => {
        if (!targetPlan) return;
        try {
            setManagementLoading(true);
            const res = await updateBillingSubscription(user.id, targetPlan, targetPlan.billingCycle || 'monthly');
            if (res.success) {
                toast.success(`Subscription updated to ${targetPlan.name}.`);
                await fetchData();
                setIsManageModalOpen(false);
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            toast.error("Error: " + error.message);
        } finally {
            setManagementLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        try {
            setManagementLoading(true);
            const res = await cancelBillingSubscription(user.id);
            if (res.success) {
                toast.success("Subscription cancelled successfully.");
                await fetchData();
                setIsManageModalOpen(false);
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            toast.error("Cancellation failed: " + error.message);
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
                                        Active
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-500 font-medium tracking-tight">
                                    Next billing on {profile?.nextBillingDate ? new Date(profile.nextBillingDate).toLocaleDateString() : 'N/A'} • ${profile?.amount || 0}/{billingCycleLabel}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/admin/invoices" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mr-2">
                                Billing History <ArrowRight className="h-3 w-3" />
                            </Link>
                            {profile?.packageName !== 'Free' && profile?.status !== 'canceled' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-[10px] font-bold uppercase tracking-widest border-red-100 text-red-600 hover:bg-red-50"
                                    onClick={() => { setSelectedAction('cancel'); setIsManageModalOpen(true); }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Available Plans - Compact Grid */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Available Upgrades</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {allPackages.filter(p => p.billingCycle === (profile?.billingCycle || 'monthly')).map((pkg) => {
                                const isCurrent = pkg.name === profile?.packageName;
                                const isHigher = (pkg.price || 0) > (profile?.amount || 0);

                                if (isCurrent) return null;

                                return (
                                    <div key={pkg.id} className="p-4 rounded-lg border border-gray-200 flex flex-col hover:border-gray-300 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{pkg.name}</h4>
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
                                            variant={isHigher ? "secondary" : "outline"}
                                            className="w-full h-8 text-[10px] font-black uppercase tracking-widest shadow-none"
                                            onClick={() => {
                                                setTargetPlan(pkg);
                                                setSelectedAction('upgrade');
                                                setIsManageModalOpen(true);
                                            }}
                                        >
                                            {isHigher ? 'Upgrade' : 'Select'}
                                        </Button>
                                    </div>
                                );
                            })}
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
