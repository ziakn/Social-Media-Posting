"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, Lock, Bell } from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);

    return (
        <div className="flex flex-col gap-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User size={16} />
                        My Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Lock size={16} />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell size={16} />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your photo and personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <User size={32} />
                                </div>
                                <Button variant="outline">Change Avatar</Button>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input id="name" placeholder="Your Name" defaultValue="Portal User" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="Email" defaultValue="user@socialhub.com" disabled />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password & Security</CardTitle>
                            <CardDescription>Manage your password and security questions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current">Current Password</Label>
                                <Input id="current" type="password" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new">New Password</Label>
                                <Input id="new" type="password" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm">Confirm New Password</Label>
                                <Input id="confirm" type="password" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button>Update Password</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Choose what you want to be notified about.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Notification settings coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
