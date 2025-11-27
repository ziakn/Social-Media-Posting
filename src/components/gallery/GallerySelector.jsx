"use client";

import { useState, useEffect, useRef } from "react";
import {
    createGalleryItem,
    getUserGallery,
    deleteGalleryItem,
} from "@/app/actions/gallery/galleryActions";
import { MEDIA_TYPES } from "@/constants/galleryConstants";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function GallerySelector({
    onSelect,
    allowMultiple = false,
    allowedTypes = ["image", "video"], // 'image', 'video', 'document'
    className,
}) {
    const [activeTab, setActiveTab] = useState("library");
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const fileInputRef = useRef(null);

    // Load gallery items on mount
    useEffect(() => {
        loadGallery();
    }, []);

    const loadGallery = async () => {
        try {
            setLoading(true);
            const result = await getUserGallery({
                limit: 100, // Load more for the selector
            });
            setGalleryItems(result.items);
        } catch (error) {
            toast.error("Failed to load gallery: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        setUploading(true);
        setUploadProgress(0);

        let successCount = 0;
        const newItems = [];

        for (const file of files) {
            try {
                // 1. Upload to Firebase Storage (Client-side)
                const timestamp = Date.now();
                const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const storagePath = `gallery/uploads/${timestamp}-${safeFileName}`;
                const storageRef = ref(storage, storagePath);

                const uploadTask = uploadBytesResumable(storageRef, file);

                await new Promise((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => {
                            reject(error);
                        },
                        () => {
                            resolve();
                        }
                    );
                });

                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                // 2. Create record in Firestore (Server-side)
                const result = await createGalleryItem({
                    fileName: file.name,
                    fileUrl: downloadURL,
                    fileType: file.type,
                    fileSize: file.size,
                    storagePath: storagePath,
                    description: `Uploaded via selector ${new Date().toLocaleDateString()}`,
                });

                newItems.push(result);
                successCount++;
            } catch (error) {
                console.error("Upload error:", error);
                toast.error(`Failed to upload ${file.name}: ${error.message}`);
            }
        }

        setUploadProgress(100);
        setUploading(false);
        event.target.value = "";

        if (successCount > 0) {
            toast.success(`Uploaded ${successCount} file(s)`);
            await loadGallery();
            setActiveTab("library");

            // Auto-select newly uploaded items if appropriate
            if (!allowMultiple && newItems.length === 1) {
                handleSelect(newItems[0]);
            }
        }
    };

    const handleSelect = (item) => {
        if (allowMultiple) {
            setSelectedItems((prev) => {
                const isSelected = prev.some((i) => i.id === item.id);
                if (isSelected) {
                    return prev.filter((i) => i.id !== item.id);
                } else {
                    return [...prev, item];
                }
            });
        } else {
            setSelectedItems([item]);
            // If single select, trigger onSelect immediately? 
            // Usually better to have a "Confirm" button for single select too in a modal, 
            // but double click could work. For now, just select.
        }
    };

    const handleConfirmSelection = () => {
        if (selectedItems.length === 0) return;

        if (allowMultiple) {
            onSelect(selectedItems);
        } else {
            onSelect(selectedItems[0]);
        }
    };

    const handleDelete = async (e, itemId) => {
        e.stopPropagation();
        if (!confirm("Delete this item?")) return;

        try {
            await deleteGalleryItem(itemId);
            setGalleryItems((prev) => prev.filter((i) => i.id !== itemId));
            setSelectedItems((prev) => prev.filter((i) => i.id !== itemId));
            toast.success("Item deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    // Filter items
    const filteredItems = galleryItems.filter((item) => {
        const matchesSearch = item.fileName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesType = allowedTypes.includes(item.mediaType);
        return matchesSearch && matchesType;
    });

    const getMediaIcon = (mediaType) => {
        switch (mediaType) {
            case MEDIA_TYPES.IMAGE:
                return <ImageIcon className="h-4 w-4" />;
            case MEDIA_TYPES.VIDEO:
                return <Video className="h-4 w-4" />;
            default:
                return <File className="h-4 w-4" />;
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {filteredItems.map((item) => {
                                    const isSelected = selectedItems.some((i) => i.id === item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            className={cn(
                                                "group relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:border-primary/50",
                                                isSelected
                                                    ? "border-primary ring-2 ring-primary ring-offset-2"
                                                    : "border-transparent bg-muted"
                                            )}
                                        >
                                            {item.mediaType === MEDIA_TYPES.IMAGE ? (
                                                <img
                                                    src={item.thumbnailUrl || item.fileUrl}
                                                    alt={item.fileName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : item.mediaType === MEDIA_TYPES.VIDEO ? (
                                                <div className="w-full h-full flex items-center justify-center bg-black/5">
                                                    <Video className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                    <File className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}

                                            {/* Selection Indicator */}
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                            )}

                                            {/* Hover Info */}
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                                                <span className="text-xs text-white truncate max-w-[80%]">
                                                    {item.fileName}
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
