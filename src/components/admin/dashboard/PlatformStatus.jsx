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
import { Facebook, Instagram, Twitter, Linkedin, Video, Image as ImageIcon, MessageCircle, Cloud } from "lucide-react";

const iconMap = {
    'Facebook': Facebook,
    'Instagram': Instagram,
    'Twitter': Twitter,
    'Linkedin': Linkedin,
    'Video': Video,
    'Image': ImageIcon,
    'MessageCircle': MessageCircle,
    'Cloud': Cloud
};

export function PlatformStatus({ platforms = [], isAdmin = false }) {
    if (!platforms || platforms.length === 0) {
        return (
            <Card className="col-span-1 lg:col-span-2 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        {isAdmin ? "Platform Connectivity" : "My Connected Platforms"}
                    </CardTitle>
                    <CardDescription>
                        {isAdmin ? "Real-time status of connected social accounts and OAuth tokens." : "Your connected social media accounts"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No platforms connected yet
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    {isAdmin ? "Platform Connectivity" : "My Connected Platforms"}
                    <Badge variant="outline" className="ml-auto font-normal text-xs">Auto-refreshing</Badge>
                </CardTitle>
                <CardDescription>
                    {isAdmin ? "Real-time status of connected social accounts and OAuth tokens." : "Your connected social media accounts"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Platform</TableHead>
                            <TableHead>{isAdmin ? "Accounts" : "Connected Accounts"}</TableHead>
                            <TableHead>Status</TableHead>
                            {isAdmin && <TableHead>Token Expiry</TableHead>}
                            <TableHead className="text-right">Last Sync</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {platforms.map((platform) => {
                            const Icon = iconMap[platform.icon] || Cloud;

                            return (
                                <TableRow key={platform.platform}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Icon className="size-4" />
                                        {platform.platform}
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {isAdmin ? (
                                            // Admin view: Show count
                                            `${platform.accountCount} account${platform.accountCount !== 1 ? 's' : ''}`
                                        ) : (
                                            // User view: Show count + account names
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-gray-700">
                                                    {platform.accountCount} {platform.accountCount === 1 ? 'Profile' : 'Profiles'}
                                                </span>
                                                {platform.accounts && platform.accounts.length > 0 && (
                                                    <span className="text-xs text-gray-500">
                                                        {platform.accounts.map(acc => acc.name).join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
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
                                    {isAdmin && (
                                        <TableCell>
                                            {platform.status === "expiring" ? (
                                                <span className="text-red-600 font-bold">{platform.expiryWarning}</span>
                                            ) : platform.status === "connected" ? (
                                                <span className="text-green-600">Valid</span>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell className="text-right text-gray-500">
                                        {platform.accounts?.[0]?.lastSync
                                            ? new Date(platform.accounts[0].lastSync).toLocaleDateString()
                                            : "—"
                                        }
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

