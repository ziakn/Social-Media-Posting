import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Link, RefreshCw, Upload, FileText, Shield, PlusCircle, Calendar, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActions({ isAdmin = false }) {
    const router = useRouter();

    const adminActions = [
        { label: "Create User", icon: UserPlus, onClick: () => router.push("/portal/users/create") },
        { label: "View All Posts", icon: FileText, onClick: () => router.push("/portal/scheduled") },
        { label: "Manage Roles", icon: Shield, onClick: () => router.push("/portal/roles") },
        { label: "System Settings", icon: RefreshCw, onClick: () => router.push("/portal/settings") },
        { label: "Subscriptions", icon: CreditCard, onClick: () => router.push("/portal/subscription") },
        { label: "Upload Media", icon: Upload, onClick: () => router.push("/portal/gallery") },
    ];

    const userActions = [
        { label: "Create Post", icon: PlusCircle, onClick: () => router.push("/portal/composer") },
        { label: "View Scheduled", icon: Calendar, onClick: () => router.push("/portal/scheduled") },
        { label: "Upload Media", icon: Upload, onClick: () => router.push("/portal/gallery") },
        { label: "Connect Platform", icon: Link, onClick: () => router.push("/portal/social") },
        { label: "My Subscription", icon: CreditCard, onClick: () => router.push("/portal/subscription") },
        { label: "View Posts", icon: FileText, onClick: () => router.push("/portal/scheduled") },
    ];

    const actions = isAdmin ? adminActions : userActions;

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                <CardDescription>
                    {isAdmin ? "Frequent admin tasks and shortcuts." : "Quick access to common tasks."}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        variant="outline"
                        className="h-auto py-3 flex flex-col items-center gap-2 text-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                        onClick={action.onClick}
                    >
                        <action.icon className="h-5 w-5" />
                        {action.label}
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
}
