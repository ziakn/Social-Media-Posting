"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { usePermissions } from '@/hooks/usePermissions';

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { getPackages, deletePackage } from "@/app/actions/packages/packagesActions";
import { Badge } from "@/components/ui/badge";

export default function PackagesList() {
    const { user, permissions, hasPermission } = usePermissions();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await getPackages();
            if (res.success) {
                setPackages(res.packages);
            } else {
                toast.error(res.error || "Failed to fetch packages");
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
            toast.error("Failed to fetch packages");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        toast("Are you sure you want to delete this package?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        const res = await deletePackage(id);
                        if (!res.success) throw new Error(res.error || "Failed to delete package");

                        setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
                        toast.success("Package deleted successfully!");
                    } catch (error) {
                        console.error("Error deleting package:", error);
                        toast.error("❌ Error deleting package: " + error.message);
                    }
                },
            },
        });
    };

    if (loading) return <Spinner />;

    return (
        <div className="p-6">
            <Card className="shadow-sm">
                <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-xl font-semibold">Pricing Packages</CardTitle>
                    {hasPermission('create_packages') &&
                        <Button
                            variant="secondary"
                            onClick={() => router.push("/admin/packages/create")}
                        >
                            + Add Package
                        </Button>
                    }
                </CardHeader>
                <CardContent>
                    {packages.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="mb-4">No packages found.</p>
                            {hasPermission('create_packages') &&
                                <Button
                                    size="sm"
                                    onClick={() => router.push("/admin/packages/create")}
                                >
                                    + Add your first package
                                </Button>
                            }
                        </div>
                    ) : (
                        <Table>
                            <TableCaption>A list of all pricing packages.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Billing</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {packages.map((pkg) => (
                                    <TableRow key={pkg.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{pkg.order || 0}</TableCell>
                                        <TableCell>
                                            {pkg.name}
                                            {pkg.isPopular && (
                                                <Badge variant="secondary" className="ml-2 text-xs">
                                                    Popular
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {pkg.currency} {pkg.price}
                                        </TableCell>
                                        <TableCell className="capitalize">{pkg.billingCycle}</TableCell>
                                        <TableCell>
                                            <Badge variant={pkg.isActive ? "success" : "secondary"}>
                                                {pkg.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {hasPermission('edit_packages') &&
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.push(`/admin/packages/${pkg.id}/edit`)
                                                    }
                                                >
                                                    Edit
                                                </Button>}
                                            {hasPermission('delete_packages') &&
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(pkg.id)}
                                                >
                                                    Delete
                                                </Button>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
