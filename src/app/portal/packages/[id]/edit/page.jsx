"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getPackage, updatePackage } from "@/app/actions/packages/packagesActions";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";

export default function EditPackage({ params }) {
    const resolvedParams = use(params);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            if (!resolvedParams?.id) return;
            try {
                const res = await getPackage(resolvedParams.id);
                if (res.success) {
                    // Convert features array to text (one per line)
                    const featuresText = Array.isArray(res.package.features)
                        ? res.package.features.join('\n')
                        : res.package.features || '';

                    setForm({
                        ...res.package,
                        features: featuresText,
                        price: String(res.package.price || ''),
                        order: String(res.package.order || 0),
                        limits: {
                            socialAccounts: String(res.package.limits?.socialAccounts || 3),
                            userSeats: String(res.package.limits?.userSeats || 1),
                            scheduledPosts: String(res.package.limits?.scheduledPosts || 30),
                            aiCaptions: String(res.package.limits?.aiCaptions || 0),
                        }
                    });
                } else {
                    toast.error(res.error || "Failed to load package");
                    router.push("/portal/packages");
                }
            } catch (error) {
                toast.error("An error occurred");
                router.push("/portal/packages");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [resolvedParams, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price) {
            toast.warning("Please fill in required fields (Name, Price)");
            return;
        }

        try {
            setSaving(true);

            // Convert features from plain text to array (split by newlines)
            const featuresArray = form.features
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            const payload = {
                ...form,
                features: featuresArray,
                price: Number(form.price),
                order: Number(form.order),
                limits: {
                    socialAccounts: Number(form.limits.socialAccounts),
                    userSeats: Number(form.limits.userSeats),
                    scheduledPosts: Number(form.limits.scheduledPosts),
                    aiCaptions: Number(form.limits.aiCaptions),
                }
            };

            // Remove the id from payload as it's passed separately
            delete payload.id;
            delete payload.createdAt;
            delete payload.updatedAt;

            const res = await updatePackage(resolvedParams.id, payload);

            if (!res.success) throw new Error(res.error || "Failed to update package");

            toast.success("Package Updated Successfully");
            router.push("/portal/packages");
        } catch (error) {
            console.error("Error updating package:", error);
            toast.error("Failed to update package: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form) return <Spinner />;

    return (
        <div className="p-6">
            <Card className="shadow-sm">
                <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-xl font-semibold">Edit Package</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Basic Info */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Package Name *</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Price *</label>
                            <input
                                type="number"
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Currency</label>
                            <select
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.currency}
                                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Billing Cycle</label>
                            <select
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.billingCycle}
                                onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                            >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="one-time">One-time</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Display Order</label>
                            <input
                                type="number"
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.order}
                                onChange={(e) => setForm({ ...form, order: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">CTA Button Text</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.ctaText}
                                onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {/* Limits */}
                        <div className="md:col-span-2 border-t pt-4 mt-2">
                            <h3 className="text-lg font-semibold mb-4">Plan Limits</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Social Accounts</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={form.limits.socialAccounts}
                                        onChange={(e) => setForm({ ...form, limits: { ...form.limits, socialAccounts: e.target.value } })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">User Seats</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={form.limits.userSeats}
                                        onChange={(e) => setForm({ ...form, limits: { ...form.limits, userSeats: e.target.value } })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Scheduled Posts (per month, -1 for unlimited)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={form.limits.scheduledPosts}
                                        onChange={(e) => setForm({ ...form, limits: { ...form.limits, scheduledPosts: e.target.value } })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">AI Captions (per month)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={form.limits.aiCaptions}
                                        onChange={(e) => setForm({ ...form, limits: { ...form.limits, aiCaptions: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="md:col-span-2 border-t pt-4 mt-2">
                            <label className="block text-sm font-medium mb-2">Features (one per line)</label>
                            <SocialCaptionEditor
                                value={form.features}
                                onChange={(e) => setForm({ ...form, features: e.target.value })}
                                placeholder="Enter each feature on a new line...
Example:
✓ 10 Social Accounts
✓ Unlimited Posts
✓ Advanced Analytics"
                                platform="default"
                                minHeight="150px"
                            />
                        </div>

                        {/* Toggle Options */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium">Active (Visible)</label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isPopular"
                                checked={form.isPopular}
                                onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="isPopular" className="text-sm font-medium">Mark as Popular</label>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/portal/packages")}
                            >
                                Cancel
                            </Button>
                            <Button variant="secondary" type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Update Package"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
