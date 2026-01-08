"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";
import { connectBlueSkyAccount } from "@/app/actions/social/bluesky/connectAccount";

export default function ConnectBlueSkyModal({ open, onOpenChange, onSuccess }) {
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({ identifier: "", password: "" });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.identifier || !formData.password) {
            setError("Please fill in all fields");
            return;
        }

        startTransition(async () => {
            try {
                const result = await connectBlueSkyAccount(formData);
                if (result.success) {
                    toast.success("Successfully connected to BlueSky!");
                    onOpenChange(false);
                    setFormData({ identifier: "", password: "" });
                    onSuccess?.();
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError("An unexpected error occurred");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col items-center text-center gap-2">
                    <div className="p-3 bg-blue-50 rounded-full">
                        <BlueSkyLogo className="h-8 w-8 text-[#0085ff]" />
                    </div>
                    <DialogTitle className="text-xl">Connect BlueSky</DialogTitle>
                    <DialogDescription>
                        Enter your BlueSky handle and App Password.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    {error && (
                        <Alert variant="destructive" className="py-2 text-sm">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="bsky-identifier">Handle or Email</Label>
                        <Input
                            id="bsky-identifier"
                            placeholder="e.g. alice.bsky.social"
                            value={formData.identifier}
                            onChange={(e) => setFormData(p => ({ ...p, identifier: e.target.value }))}
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bsky-password">App Password</Label>
                        <Input
                            id="bsky-password"
                            type="password"
                            placeholder="xxxx-xxxx-xxxx-xxxx"
                            value={formData.password}
                            onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                            disabled={isPending}
                        />
                        <div className="text-[11px] text-muted-foreground bg-slate-50 p-2 rounded flex items-start gap-2">
                            <KeyRound className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span>
                                Go to <strong>Settings &gt; Privacy & Security &gt; App Passwords</strong> in BlueSky to generate one.
                            </span>
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <Button
                            type="submit"
                            className="w-full bg-[#0085ff] hover:bg-blue-600 font-bold"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Connect Account"
                            )}
                        </Button>
                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                            <ShieldCheck className="h-3 w-3" />
                            Credentials encrypted securely
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
