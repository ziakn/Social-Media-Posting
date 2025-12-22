"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function PublishedTwitterPosts() {
    return (
        <Card className="border-dashed border-2 border-muted p-8 text-center">
            <CardContent>
                <p className="text-muted-foreground">Published tweets will appear here.</p>
            </CardContent>
        </Card>
    );
}
