"use client";

import { useState, useRef } from "react";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function UploadModal({ isOpen, onClose, onUpload }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("general");

    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (selectedFile) => {
        // Validate file size for social media compatibility
        const fileSizeMB = selectedFile.size / (1024 * 1024);
        const MAX_VIDEO_SIZE_MB = 100; // Facebook: 4GB, Instagram: 100MB, Twitter: 512MB - using conservative limit
        const MAX_IMAGE_SIZE_MB = 10; // Most platforms support up to 10MB for images

        const isVideo = selectedFile.type.startsWith('video/');
        const isImage = selectedFile.type.startsWith('image/');

        if (isVideo && fileSizeMB > MAX_VIDEO_SIZE_MB) {
            alert(`Video file is too large (${fileSizeMB.toFixed(1)}MB).\n\nMaximum size for social media: ${MAX_VIDEO_SIZE_MB}MB\n\nPlease compress your video before uploading.`);
            return;
        }

        if (isImage && fileSizeMB > MAX_IMAGE_SIZE_MB) {
            alert(`Image file is too large (${fileSizeMB.toFixed(1)}MB).\n\nMaximum size: ${MAX_IMAGE_SIZE_MB}MB\n\nPlease compress your image before uploading.`);
            return;
        }

        setFile(selectedFile);
        setTitle(selectedFile.name.split('.')[0]); // Default title from filename

        // Create preview
        if (isImage) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(10); // Start progress

        try {
            // Simulate progress for better UX or hook into real upload progress if available
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            await onUpload({
                file,
                title,
                description,
                category
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            // Close after short delay
            setTimeout(() => {
                handleClose();
            }, 500);

        } catch (error) {
            console.error("Upload failed", error);
            // Handle error state here
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreview(null);
        setTitle("");
        setDescription("");
        setCategory("general");
        setUploadProgress(0);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-[500px] max-h-[95vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Upload Media</DialogTitle>
                    <DialogDescription>
                        Drag and drop files here or click to browse.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {!file ? (
                        <div
                            className={cn(
                                "flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 transition-colors hover:bg-muted/10",
                                isDragging && "border-primary bg-primary/5"
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Drop files here or click to upload
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                                Supports JPG, PNG, WebP, MP4
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*,video/*"
                                onChange={handleFileSelect}
                            />
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-lg border bg-muted">
                            {preview ? (
                                <div className="relative h-48 w-full">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-48 w-full items-center justify-center bg-muted">
                                    <FileIcon className="h-12 w-12 text-muted-foreground" />
                                    <span className="ml-2 text-sm font-medium">{file.name}</span>
                                </div>
                            )}
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2 h-6 w-6 rounded-full"
                                onClick={() => setFile(null)}
                                disabled={isUploading}
                            >
                                <X className="h-3 w-3" />
                            </Button>

                            {isUploading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    <Progress value={uploadProgress} className="mt-4 w-[60%] bg-white/20" indicatorClassName="bg-white" />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Image title"
                            disabled={isUploading}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory} disabled={isUploading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="news">News</SelectItem>
                                <SelectItem value="events">Events</SelectItem>
                                <SelectItem value="social">Social</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description..."
                            disabled={isUploading}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!file || isUploading}>
                        {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
