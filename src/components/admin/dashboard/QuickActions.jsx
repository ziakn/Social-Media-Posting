import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Link, RefreshCw, Upload, FileText, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActions() {
    const router = useRouter();

    const actions = [
        { label: "Create User", icon: UserPlus, onClick: () => router.push("/admin/users?action=create") },
        { label: "Link Platform", icon: Link, onClick: () => router.push("/admin/platforms") },
        { label: "Refresh Tokens", icon: RefreshCw, onClick: () => console.log("Refreshing tokens...") },
        { label: "Upload Media", icon: Upload, onClick: () => router.push("/admin/gallery") },
        { label: "View Logs", icon: FileText, onClick: () => router.push("/admin/audit") },
        { label: "Assign Role", icon: Shield, onClick: () => router.push("/admin/roles") },
    ];

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                <CardDescription>Frequent tasks and shortcuts.</CardDescription>
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
