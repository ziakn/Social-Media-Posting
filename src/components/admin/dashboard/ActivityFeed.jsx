import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, CheckCircle2, UserPlus, FileEdit, Settings, ShieldAlert } from "lucide-react";

const activities = [
    {
        id: 1,
        user: "Zia Muhammad",
        action: "Updated permission",
        target: "Editor Role",
        time: "2 mins ago",
        type: "admin",
        icon: ShieldAlert,
        iconColor: "text-blue-500",
    },
    {
        id: 2,
        user: "System",
        action: "Failed OAuth refresh",
        target: "LinkedIn (SocialHub Inc.)",
        time: "15 mins ago",
        type: "error",
        icon: AlertTriangle,
        iconColor: "text-red-500",
    },
    {
        id: 3,
        user: "Sarah Admin",
        action: "Created user",
        target: "john.doe@example.com",
        time: "45 mins ago",
        type: "admin",
        icon: UserPlus,
        iconColor: "text-green-500",
    },
    {
        id: 4,
        user: "Zia Muhammad",
        action: "Changed settings",
        target: "Global Timezone",
        time: "1 hour ago",
        type: "admin",
        icon: Settings,
        iconColor: "text-gray-500",
    },
    {
        id: 5,
        user: "System",
        action: "OAuth Token Refreshed",
        target: "Facebook API",
        time: "2 hours ago",
        type: "system",
        icon: CheckCircle2,
        iconColor: "text-green-600",
    },
];

export function ActivityFeed() {
    return (
        <Card className="col-span-1 shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Activity Stream</CardTitle>
                <CardDescription>Recent actions and system events.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {activities.map((item) => (
                        <div key={item.id} className="flex items-start gap-4">
                            <div className={`mt-0.5 rounded-full p-1.5 bg-gray-50 border border-gray-100`}>
                                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">
                                    <span className="font-semibold">{item.user}</span> {item.action}{" "}
                                    <span className="text-muted-foreground">{item.target}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">{item.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
