"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, MoreVertical, Eye, Trash2, FileText } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function GalleryItem({ item, onView, onDelete }) {
    const [isHovered, setIsHovered] = useState(false);
    const isVideo = item.mediaType === "video";

    return (
        <Card
            className="group relative overflow-hidden border-0 bg-muted/20 transition-all hover:shadow-md"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardContent className="p-0">
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {item.mediaType === "image" ? (
                        <Image
                            src={item.thumbnailUrl || item.fileUrl}
                            alt={item.title || "Gallery Item"}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                    ) : isVideo ? (
                        <div className="flex h-full w-full items-center justify-center bg-black/5">
                            {/* If we had a real thumbnail for video, we'd use it here. 
                    For now, showing a placeholder or the video element itself if needed, 
                    but video elements are heavy. Let's use a nice icon placeholder if no thumb. */}
                            {item.thumbnailUrl && item.thumbnailUrl !== item.fileUrl ? (
                                <Image
                                    src={item.thumbnailUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-900/10">
                                    <Play className="h-12 w-12 text-slate-900/50" />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                <Play className="h-12 w-12 fill-white text-white drop-shadow-lg" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}

                    {/* Overlay Actions */}
                    <div className={cn(
                        "absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/60 via-transparent to-black/60 p-3 opacity-0 transition-opacity duration-200",
                        isHovered ? "opacity-100" : "opacity-0"
                    )}>
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onView(item)}>
                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="space-y-1">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full bg-white/90 text-xs font-medium text-black hover:bg-white"
                                onClick={() => onView(item)}
                            >
                                View
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-1 p-3">
                <div className="flex w-full items-center justify-between">
                    <h3 className="truncate text-sm font-medium leading-none" title={item.title}>{item.title}</h3>
                    {item.mediaType === 'video' && <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">Video</Badge>}
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                </p>
            </CardFooter>
        </Card>
    );
}
