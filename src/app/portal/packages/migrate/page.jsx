"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { migratePricingData } from "@/app/actions/packages/migratePricing";
import { useRouter } from "next/navigation";

export default function MigratePricingPage() {
    const [loading, setLoading] = useState(false);
    const [migrated, setMigrated] = useState(false);
    const router = useRouter();

    const handleMigration = async () => {
        if (migrated) {
            toast.warning("Data already migrated! Check /portal/packages");
            return;
        }

        try {
            setLoading(true);
            const result = await migratePricingData();

            if (result.success) {
                toast.success(`✅ ${result.message}`);
                setMigrated(true);
            } else {
                toast.error(`❌ Migration failed: ${result.error}`);
            }
        } catch (error) {
            toast.error("Migration failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Migrate Pricing Data</CardTitle>
                    <CardDescription>
                        Import static pricing plans from pricing-data.js into Firebase database
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">📦 What will be migrated:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>✓ Free Plan - $0/month</li>
                            <li className="font-semibold">✓ Creator Plan - $29/month (Popular)</li>
                            <li>✓ Creator Plan - $24/month (Yearly - Popular)</li>
                            <li>✓ Pro Plan - $59/month</li>
                            <li>✓ Pro Plan - $49/month (Yearly)</li>
                            <li>✓ Agency Plan - $149/month</li>
                            <li>✓ Agency Plan - $129/month (Yearly)</li>
                        </ul>
                        <p className="text-xs text-blue-700 mt-2 font-medium">Total: 7 packages</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important:</h3>
                        <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• This will create 7 new packages in the database</li>
                            <li>• Existing packages will not be affected</li>
                            <li>• You can edit/delete migrated packages from /portal/packages</li>
                        </ul>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={handleMigration}
                            disabled={loading || migrated}
                            className="flex-1"
                        >
                            {loading ? "Migrating..." : migrated ? "✅ Migration Complete" : "🚀 Start Migration"}
                        </Button>

                        {migrated && (
                            <Button
                                variant="outline"
                                onClick={() => router.push("/portal/packages")}
                            >
                                View Packages →
                            </Button>
                        )}
                    </div>

                    {migrated && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800">
                                ✨ Migration successful! You can now manage your pricing packages at{" "}
                                <a href="/portal/packages" className="font-semibold underline">
                                    /portal/packages
                                </a>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
