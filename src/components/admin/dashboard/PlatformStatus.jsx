import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Facebook, Instagram, Twitter, Linkedin, AlertCircle } from "lucide-react";

const platforms = [
    {
        id: "fb",
        name: "Facebook",
        icon: Facebook,
        status: "connected",
        expiry: "12 days",
        lastSync: "2 min ago",
        account: "SocialHub Official",
    },
    {
        id: "ig",
        name: "Instagram",
        icon: Instagram,
        status: "connected",
        expiry: "4 days",
        lastSync: "5 min ago",
        account: "socialhub_app",
    },
    {
        id: "tw",
        name: "Twitter / X",
        icon: Twitter,
        status: "disconnected",
        expiry: "-",
        lastSync: "—",
        account: "-",
    },
    {
        id: "li",
        name: "LinkedIn",
        icon: Linkedin,
        status: "expiring",
        expiry: "2 hours",
        lastSync: "10 min ago",
        account: "SocialHub Inc.",
    },
];

export function PlatformStatus() {
    return (
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    Platform Connectivity
                    <Badge variant="outline" className="ml-auto font-normal text-xs">Auto-refreshing</Badge>
                </CardTitle>
                <CardDescription>Real-time status of connected social accounts and OAuth tokens.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Platform</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Token Expiry</TableHead>
                            <TableHead className="text-right">Last Sync</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {platforms.map((platform) => (
                            <TableRow key={platform.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <platform.icon className="size-4" />
                                    {platform.name}
                                </TableCell>
                                <TableCell className="text-gray-500">{platform.account}</TableCell>
                                <TableCell>
                                    {platform.status === "connected" && (
                                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">Connected</Badge>
                                    )}
                                    {platform.status === "expiring" && (
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">
                                            ⚠ Expiring
                                        </Badge>
                                    )}
                                    {platform.status === "disconnected" && (
                                        <Badge variant="destructive">Disconnected</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {platform.status === "expiring" ? <span className="text-red-600 font-bold">{platform.expiry}</span> : platform.expiry}
                                </TableCell>
                                <TableCell className="text-right text-gray-500">{platform.lastSync}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
