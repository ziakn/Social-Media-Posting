"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";

export default function ScheduledBlueSkyPosts() {
    return (
        <Card className="border-dashed border-neutral-300">
            <CardContent className="p-12 text-center">
                <BlueSkyLogo className="h-10 w-10 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-700">Scheduled Posts</h3>
                <p className="text-muted-foreground">Scheduling for BlueSky is coming soon!</p>
            </CardContent>
        </Card>
    );
}
