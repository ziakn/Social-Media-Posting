import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, CheckCircle2, UserPlus, FileEdit, Settings, ShieldAlert, FileText, XCircle } from "lucide-react";

const iconMap = {
    'admin': ShieldAlert,
    'error': AlertTriangle,
    'system': CheckCircle2,
    'user': UserPlus,
    'post': FileText,
    'failed': XCircle
};

const colorMap = {
    'admin': 'text-blue-500',
    'error': 'text-red-500',
    'system': 'text-green-600',
    'user': 'text-green-500',
    'post': 'text-gray-500',
    'failed': 'text-orange-500'
};

export function ActivityFeed({ activities = [], isAdmin = false }) {
    // If no activities, show placeholder
    if (!activities || activities.length === 0) {
        return (
            <Card className="col-span-1 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Activity Stream</CardTitle>
                    <CardDescription>
                        {isAdmin ? "Recent system events and actions." : "Your recent activity."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No recent activity
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Activity Stream</CardTitle>
                <CardDescription>
                    {isAdmin ? "Recent system events and actions." : "Your recent activity."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {activities.map((item, index) => {
                        const Icon = iconMap[item.type] || FileEdit;
                        const iconColor = colorMap[item.type] || 'text-gray-500';

                        return (
                            <div key={item.id || index} className="flex items-start gap-4">
                                <div className={`mt-0.5 rounded-full p-1.5 bg-gray-50 border border-gray-100`}>
                                    <Icon className={`h-4 w-4 ${iconColor}`} />
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">
                                        <span className="font-semibold">{item.user}</span> {item.action}{" "}
                                        <span className="text-muted-foreground">{item.target}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">{item.time}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
