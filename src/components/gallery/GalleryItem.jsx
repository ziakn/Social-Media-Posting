"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, MoreVertical, Eye, Trash2, FileText, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function GalleryItem({ item, onView, onDelete }) {
    const [isHovered, setIsHovered] = useState(false);
    const isVideo = item.mediaType === "video";

    return (
        <Card
            className="group relative overflow-hidden rounded-md border-0 bg-muted/20 transition-all hover:shadow-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardContent className="p-0">
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {item.mediaType === "image" ? (
                        <div className="relative h-full w-full">
                            <img
                                src={item.thumbnailUrl || item.fileUrl || "/placeholder-image.jpg"}
                                alt={item.title || "Gallery Item"}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                    // Fallback if image fails to load
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    ) : isVideo ? (
                        <div className="relative flex h-full w-full items-center justify-center bg-black/5">
                            {item.thumbnailUrl ? (
                                <div className="relative h-full w-full">
                                    <img
                                        src={item.thumbnailUrl}
                                        alt={item.title || "Video Thumbnail"}
                                        className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            ) : item.fileUrl ? (
                                <div className="relative h-full w-full bg-black">
                                    <video
                                        src={`${item.fileUrl}#t=0.1`}
                                        className="h-full w-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
                                        muted
                                        playsInline
                                        preload="metadata"
                                    />
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-slate-900/10 transition-transform duration-300 group-hover:scale-105" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                                    <Play className="h-5 w-5 fill-current ml-1" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}

                    {/* Overlay Actions & Info */}
                    <div className={cn(
                        "absolute inset-0 flex flex-col justify-between bg-black/60 p-3 opacity-0 transition-opacity duration-300",
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

                        <div className="space-y-3">
                            <div className="text-white">
                                <h3 className="line-clamp-1 text-sm font-semibold tracking-tight" title={item.title}>
                                    {item.title}
                                </h3>
                                <p className="mt-1 flex items-center text-[11px] text-white/80">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full bg-white/90 text-xs font-medium text-black hover:bg-white"
                                onClick={() => onView(item)}
                            >
                                View Details
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
