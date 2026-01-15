"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PinterestLogo from "@/components/icons/PinterestLogo";

export default function PinterestPreview({ title, message, imageUrl, accountName }) {
    return (
        <Card className="border border-neutral-200 bg-neutral-50/50 shadow-sm overflow-hidden h-fit">
            <CardHeader className="bg-white border-b border-neutral-100">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Pin Preview
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <div className="bg-white rounded-3xl border border-neutral-200 shadow-lg overflow-hidden max-w-[300px] mx-auto transition-transform hover:scale-[1.02]">
                    <div className="relative aspect-[2/3] bg-neutral-100 flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="Pin Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = "https://placehold.co/400x600?text=Image+Not+Found"}
                            />
                        ) : (
                            <div className="text-neutral-400 flex flex-col items-center gap-2">
                                <PinterestLogo className="w-12 h-12 opacity-20" />
                                <span className="text-xs italic">Image will appear here</span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 space-y-2">
                        <h3 className="font-bold text-lg leading-tight break-words">
                            {title || "Pin Title"}
                        </h3>
                        <p className="text-sm text-neutral-600 line-clamp-3 break-words">
                            {message || "Your Pin description will appear here..."}
                        </p>

                        <div className="flex items-center gap-2 pt-2 border-t border-neutral-50">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                                <PinterestLogo className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold truncate capitalize">
                                {accountName || "Your Account"}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
