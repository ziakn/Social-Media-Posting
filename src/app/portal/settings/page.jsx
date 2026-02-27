"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Lock, Bell, Loader2, Camera, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const defaultTab = searchParams.get("tab") || "profile";

    // Profile state
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [name, setName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    // Password state
    const [savingPassword, setSavingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Fetch user data on mount
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/user/me");
                if (!res.ok) throw new Error("Failed to load profile");
                const data = await res.json();
                setUser(data.user);
                setName(data.user.name || "");
                setAvatarUrl(data.user.avatar || null);
            } catch (err) {
                toast.error("Could not load your profile.");
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    // --- Avatar upload ---
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be smaller than 2MB.");
            return;
        }

        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
            if (!uploadRes.ok) throw new Error("Upload failed");
            const uploadData = await uploadRes.json();

            // Save the avatar URL to the user profile
            const saveRes = await fetch("/api/user/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar: uploadData.url }),
            });
            if (!saveRes.ok) throw new Error("Failed to save avatar");

            setAvatarUrl(uploadData.url);
            toast.success("Avatar updated!");
        } catch (err) {
            toast.error("Failed to upload avatar.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    // --- Save profile (name) ---
    const handleSaveProfile = async () => {
        if (!name.trim()) {
            toast.error("Display name cannot be empty.");
            return;
        }
        setSavingProfile(true);
        try {
            const res = await fetch("/api/user/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save");
            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error(err.message || "Failed to update profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    // --- Update password ---
    const handleUpdatePassword = async () => {
        if (!currentPassword) {
            toast.error("Please enter your current password.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setSavingPassword(true);
        try {
            const res = await fetch("/api/user/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update password");

            toast.success("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            toast.error(err.message || "Failed to update password.");
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <Tabs defaultValue={defaultTab} className="w-full">
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

                {/* ─── Profile Tab ─── */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your photo and personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <Avatar className="h-20 w-20 border-2 border-muted">
                                        <AvatarImage src={avatarUrl} />
                                        <AvatarFallback className="text-lg font-semibold bg-muted">
                                            {name?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        {uploadingAvatar ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                                        ) : (
                                            <Camera className="h-5 w-5 text-white" />
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                    >
                                        {uploadingAvatar ? "Uploading…" : "Change Avatar"}
                                    </Button>
                                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                                </div>
                            </div>

                            {/* Display Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Your Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            {/* Email (read-only) */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-muted/50"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed. Contact support if needed.
                                </p>
                            </div>

                            {/* Role (read-only) */}
                            {user?.role && (
                                <div className="grid gap-2">
                                    <Label>Role</Label>
                                    <Input value={user.role} disabled className="bg-muted/50" />
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button onClick={handleSaveProfile} disabled={savingProfile}>
                                {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ─── Security Tab ─── */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password &amp; Security</CardTitle>
                            <CardDescription>Change your password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Current Password */}
                            <div className="grid gap-2">
                                <Label htmlFor="current">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        id="current"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            {/* New Password */}
                            <div className="grid gap-2">
                                <Label htmlFor="new">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="new"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="At least 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            {/* Confirm New Password */}
                            <div className="grid gap-2">
                                <Label htmlFor="confirm">Confirm New Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-destructive">Passwords do not match.</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button
                                onClick={handleUpdatePassword}
                                disabled={savingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                            >
                                {savingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ─── Notifications Tab ─── */}
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
