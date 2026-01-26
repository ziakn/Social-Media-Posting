"use client";

import { useState, useEffect, useRef } from "react";
import {
    createGalleryItem,
    getUserGallery,
    deleteGalleryItem,
} from "@/app/actions/gallery/galleryActions";
import { MEDIA_TYPES } from "@/constants/galleryConstants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Image as ImageIcon,
    Video,
    File,
    Upload,
    Search,
    Check,
    Loader2,
    Trash2,
    X,
    Play,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function GallerySelector({
    onSelect,
    allowMultiple = false,
    maxSelection = Infinity,
    allowedTypes = ["image", "video"], // 'image', 'video', 'document'
    className,
}) {
    const [activeTab, setActiveTab] = useState("library");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchGallery();
    }, [JSON.stringify(allowedTypes)]); // Re-fetch when allowedTypes change

    const fetchGallery = async () => {
        setLoading(true);
        try {
            // Determine filter for server query
            let mediaTypeFilter = 'all';

            // Handle both array and string (defensive)
            const types = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];

            // If we have exactly one type, filter by it on server
            if (types.length === 1) {
                mediaTypeFilter = types[0];
            }

            const res = await getUserGallery({ mediaType: mediaTypeFilter });
            if (res.success) {
                setItems(res.items);
            } else {
                toast.error("Failed to load gallery");
            }
        } catch (error) {
            console.error('[GallerySelector] Error loading gallery:', error);
            toast.error("Error loading gallery");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            for (const file of files) {
                const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document";

                const supportedTypes = ["image", "video", "document"];
                if (!supportedTypes.includes(type)) {
                    toast.error(`File type ${type} not allowed`);
                    continue;
                }

                // Validate file size for social media compatibility
                const fileSizeMB = file.size / (1024 * 1024);
                const MAX_VIDEO_SIZE_MB = 100; // Facebook: 4GB, Instagram: 100MB, Twitter: 512MB - using conservative limit
                const MAX_IMAGE_SIZE_MB = 10; // Most platforms support up to 10MB for images

                if (type === "video" && fileSizeMB > MAX_VIDEO_SIZE_MB) {
                    toast.error(`Video file "${file.name}" is too large (${fileSizeMB.toFixed(1)}MB). Maximum size for social media is ${MAX_VIDEO_SIZE_MB}MB.`, {
                        duration: 5000,
                    });
                    continue;
                }

                if (type === "image" && fileSizeMB > MAX_IMAGE_SIZE_MB) {
                    toast.error(`Image file "${file.name}" is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`, {
                        duration: 5000,
                    });
                    continue;
                }

                // Upload file to server using the working API endpoint
                const formData = new FormData();
                formData.append("file", file);

                setUploadProgress(20);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Upload failed");
                }

                const data = await response.json();
                setUploadProgress(70);

                // Create database record
                await createGalleryItem({
                    fileName: file.name,
                    fileUrl: data.url,
                    fileType: file.type,
                    fileSize: file.size,
                    mediaType: type,
                    storagePath: data.storagePath,
                });

                setUploadProgress(100);
            }

            toast.success("Files uploaded successfully");
            setActiveTab("library");
            fetchGallery();
        } catch (error) {
            console.error(error);
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            const res = await deleteGalleryItem(id);
            if (res.success) {
                toast.success("Item deleted");
                setItems(prev => prev.filter(item => item.id !== id));
                setSelectedItems(prev => prev.filter(item => item.id !== id));
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting item");
        }
    };

    const handleSelect = (item) => {
        if (!allowMultiple || maxSelection === 1) {
            onSelect(item);
            return;
        }

        setSelectedItems(prev => {
            const isSelected = prev.some(i => i.id === item.id);
            if (isSelected) {
                return prev.filter(i => i.id !== item.id);
            } else {
                if (prev.length >= maxSelection) {
                    toast.error(`You can only select up to ${maxSelection} items`);
                    return prev;
                }
                return [...prev, item];
            }
        });
    };

    const handleConfirmSelection = () => {
        if (!allowMultiple || maxSelection === 1) {
            if (selectedItems.length > 0) onSelect(selectedItems[0]);
        } else {
            onSelect(selectedItems);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = allowedTypes.includes(item.mediaType);
        return matchesSearch && matchesType;
    });

    const getMediaIcon = (mediaType) => {
        switch (mediaType) {
            case MEDIA_TYPES.IMAGE:
                return <ImageIcon className="h-4 w-4" strokeWidth={2.5} />;
            case MEDIA_TYPES.VIDEO:
                return <Video className="h-4 w-4" strokeWidth={2.5} />;
            default:
                return <File className="h-4 w-4" strokeWidth={2.5} />;
        }
    };

    return (
        <div className={cn("flex flex-col h-full w-full bg-background", className)}>
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col min-h-0"
            >
                <div className="px-4 pt-4 border-b flex items-center justify-between shrink-0">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                        <TabsTrigger value="library">Library</TabsTrigger>
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent
                    value="library"
                    className="flex-1 flex flex-col min-h-0 m-0 data-[state=active]:flex"
                >
                    {/* Search Bar */}
                    <div className="p-4 border-b shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search files..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    <ScrollArea className="flex-1 p-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Loading library...
                                </p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center">
                                <p className="text-muted-foreground mb-2">No items found</p>
                                <Button variant="outline" onClick={() => setActiveTab("upload")}>
                                    Upload New File
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                {filteredItems.map((item) => {
                                    const isSelected = selectedItems.some((i) => i.id === item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            className={cn(
                                                "group relative aspect-square rounded-lg border overflow-hidden cursor-pointer transition-all",
                                                isSelected
                                                    ? "border-primary ring-2 ring-primary ring-offset-0"
                                                    : "border-gray-100 hover:border-primary/50"
                                            )}
                                        >
                                            {item.mediaType === MEDIA_TYPES.IMAGE ? (
                                                <img
                                                    src={item.thumbnailUrl || item.fileUrl}
                                                    alt={item.fileName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : item.mediaType === MEDIA_TYPES.VIDEO ? (
                                                <div className="relative w-full h-full">
                                                    <video
                                                        src={item.fileUrl}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="bg-black/30 rounded-full p-1.5 backdrop-blur-sm">
                                                            <Play className="h-6 w-6 text-white fill-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                    <File className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}

                                            {/* Selection Indicator */}
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                            )}

                                            {/* Hover Info */}
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                                                <span className="text-xs text-white truncate max-w-[80%]">
                                                    {item.title || item.fileName}
                                                </span>
                                                <button
                                                    onClick={(e) => handleDelete(e, item.id)}
                                                    className="text-white/80 hover:text-red-400"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Selected Items Tray (Slider) */}
                    {allowMultiple && selectedItems.length > 0 && (
                        <div className="border-t bg-muted/10 p-2 shrink-0 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 mb-1.5 px-2">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                    Queue ({selectedItems.length})
                                </span>
                            </div>
                            <ScrollArea className="w-full" orientation="horizontal">
                                <div className="flex gap-2 pb-2 px-1">
                                    {selectedItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-muted bg-background group"
                                        >
                                            {item.mediaType === MEDIA_TYPES.IMAGE ? (
                                                <img
                                                    src={item.thumbnailUrl || item.fileUrl}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="relative w-full h-full">
                                                    <video src={item.fileUrl} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Play className="h-3 w-3 text-white fill-white shadow-lg" />
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleSelect(item)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="h-2 w-2" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="p-4 border-t bg-muted/20 shrink-0 flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                            {selectedItems.length} selected
                        </div>
                        <Button
                            onClick={handleConfirmSelection}
                            disabled={selectedItems.length === 0}
                        >
                            {allowMultiple
                                ? `Select ${selectedItems.length} Items`
                                : "Select Item"}
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="upload" className="flex-1 m-0 p-4">
                    <div
                        className="h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            accept={allowedTypes
                                .map((t) => (t === "image" ? "image/*" : t === "video" ? "video/*" : "*/*"))
                                .join(",")}
                            onChange={handleFileUpload}
                        />

                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Upload className="h-8 w-8 text-primary" />
                        </div>

                        <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mb-6">
                            Drag and drop files here, or click to select files from your computer
                        </p>

                        <Button disabled={uploading}>
                            {uploading ? "Uploading..." : "Select Files"}
                        </Button>

                        {uploading && (
                            <div className="w-full max-w-xs mt-6 space-y-2">
                                <Progress value={uploadProgress} />
                                <p className="text-xs text-center text-muted-foreground">
                                    {uploadProgress}% uploaded
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
