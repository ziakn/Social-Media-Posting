"use client";

import { Calendar, Tag, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function MediaDetailDialog({ item, isOpen, onClose }) {
    if (!item) return null;

    const isVideo = item.mediaType === "video";
    const uploadedDate = new Date(item.createdAt).toLocaleDateString();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden sm:max-h-[90vh]">
                <div className="flex flex-col sm:flex-row h-full max-h-[90vh]">

                    {/* ========= MEDIA PREVIEW ========= */}
                    <div className="flex-1 bg-black/95 flex items-center justify-center min-h-[300px] sm:min-h-[500px]">
                        {isVideo ? (
                            <video
                                src={item.fileUrl}
                                controls
                                poster={item.thumbnailUrl}
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <img
                                src={item.fileUrl}
                                alt={item.title}
                                className="max-w-full max-h-full object-contain"
                            />
                        )}
                    </div>

                    {/* ========= DETAILS PANEL ========= */}
                    <div className="w-full sm:w-[300px] bg-background border-l flex flex-col">

                        {/* Header */}
                        <DialogHeader className="p-6 pb-2">
                            <div className="flex items-start justify-between">
                                <DialogTitle className="text-xl font-semibold">
                                    {item.title}
                                </DialogTitle>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                                <Badge variant="secondary" className="capitalize">
                                    {item.category}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                    {item.mediaType}
                                </Badge>
                            </div>
                        </DialogHeader>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 pt-2">
                            <div className="space-y-6">

                                {/* Description */}
                                {item.description && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <FileText className="h-4 w-4" /> Description
                                        </h4>
                                        <p className="text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                )}

                                {/* Meta Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> Uploaded
                                        </span>
                                        <span>{uploadedDate}</span>
                                    </div>

                                    {item.fileSize && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <Tag className="h-4 w-4" /> Size
                                            </span>
                                            <span>
                                                {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Download Button */}
                        <div className="p-6 border-t bg-muted/10">
                            <Button className="w-full" asChild>
                                <a
                                    href={item.fileUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="mr-2 h-4 w-4" /> Download Original
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
