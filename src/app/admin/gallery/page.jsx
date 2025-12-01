// app/gallery/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  createGalleryItem,
  getUserGallery,
  deleteGalleryItem,
  updateGalleryItem,
} from "@/app/actions/gallery/galleryActions";

import { MEDIA_TYPES } from "@/constants/galleryConstants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Image,
  Video,
  File,
  Upload,
  Trash2,
  Edit,
  Search,
  Filter,
  Grid3X3,
  List,
  Play,
  Loader2,
  Eye,
  Calendar,
  FileText,
  Image as ImageIcon,
  Film,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadGallery(true);
  }, [filterType]);

  const loadGallery = async (isInitial = false) => {
    try {
      if (!isInitial && !hasMore) return;

      setLoading(true);
      const result = await getUserGallery({
        mediaType: filterType === "all" ? "" : filterType,
        limit: 30,
        lastCreatedAt: isInitial ? null : nextCursor,
      });

      if (isInitial) {
        setGalleryItems(result.items);
      } else {
        setGalleryItems((prev) => [...prev, ...result.items]);
      }

      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (error) {
      toast.error("Failed to load gallery", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setUploadProgress(0);

    const toastId = toast.loading(`Uploading ${files.length} file(s)...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();

        await createGalleryItem({
          fileName: file.name,
          fileUrl: data.url,
          fileType: file.type,
          fileSize: file.size,
          storagePath: data.storagePath,
          description: "",
          title: file.name.replace(/\.[^/.]+$/, ""),
        });

        successCount++;
      } catch (error) {
        console.error("Upload error:", error);
        errorCount++;
      }
    }

    setUploading(false);
    setUploadProgress(0);
    event.target.value = "";

    toast.dismiss(toastId);

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`);
      loadGallery(true);
    }

    if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} file(s)`);
    }
  };

  const handleDelete = async (itemId, fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    try {
      await deleteGalleryItem(itemId);
      toast.success("File deleted successfully");
      setGalleryItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      toast.error("Failed to delete file", {
        description: error.message,
      });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  const handleUpdate = async (updates) => {
    try {
      await updateGalleryItem(editingItem.id, updates);
      toast.success("File updated successfully");
      loadGallery(true);
      setIsEditing(false);
      setEditingItem(null);
    } catch (error) {
      toast.error("Failed to update file", {
        description: error.message,
      });
    }
  };

  const filteredItems = galleryItems.filter(
    (item) =>
      item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (date) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMediaIcon = (mediaType) => {
    switch (mediaType) {
      case MEDIA_TYPES.IMAGE:
        return <ImageIcon className="h-3 w-3" />;
      case MEDIA_TYPES.VIDEO:
        return <Film className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getFileExtension = (fileName) => {
    return fileName?.split(".").pop()?.toUpperCase() || "FILE";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Image className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Media Gallery
                </h1>
                <p className="text-sm text-muted-foreground">
                  {galleryItems.length} items •{" "}
                  {formatFileSize(
                    galleryItems.reduce(
                      (acc, item) => acc + (item.fileSize || 0),
                      0
                    )
                  )}{" "}
                  total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-9"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Search and Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search files by name, tags, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px] h-11">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={MEDIA_TYPES.IMAGE}>Images</SelectItem>
                <SelectItem value={MEDIA_TYPES.VIDEO}>Videos</SelectItem>
                <SelectItem value={MEDIA_TYPES.DOCUMENT}>Documents</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-9 w-9 p-0"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Grid view</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-9 w-9 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>List view</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">
                    Uploading files...
                  </span>
                </div>
                <span className="text-sm font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Gallery Content */}
        {loading && galleryItems.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-sm">
                <CardContent className="p-0">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-2 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Image className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No files found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Upload your first file to get started."}
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {filteredItems.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPreview={setPreviewItem}
                  formatFileSize={formatFileSize}
                  getMediaIcon={getMediaIcon}
                  formatDate={formatDate}
                  getFileExtension={getFileExtension}
                />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => loadGallery(false)}
                  disabled={loading}
                  className="px-8"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <GalleryListItem
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPreview={setPreviewItem}
                formatFileSize={formatFileSize}
                getMediaIcon={getMediaIcon}
                formatDate={formatDate}
              />
            ))}
            {hasMore && (
              <div className="flex justify-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => loadGallery(false)}
                  disabled={loading}
                  className="px-8"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <EditDialog
          isOpen={isEditing}
          onOpenChange={setIsEditing}
          item={editingItem}
          onSave={handleUpdate}
          formatFileSize={formatFileSize}
        />

        {/* Preview Dialog */}
        <PreviewDialog
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          formatFileSize={formatFileSize}
          formatDate={formatDate}
          getMediaIcon={getMediaIcon}
          getFileExtension={getFileExtension}
        />
      </div>
    </div>
  );
}

// Gallery Card Component
function GalleryCard({
  item,
  onEdit,
  onDelete,
  onPreview,
  formatFileSize,
  getMediaIcon,
  formatDate,
  getFileExtension,
}) {
  return (
    <Card className="group relative overflow-hidden border rounded-lg transition-all duration-200 hover:shadow-md">
      <CardContent className="p-0">
        {/* Media Preview */}
        <div
          className="aspect-square relative overflow-hidden bg-muted cursor-pointer"
          onClick={() => onPreview(item)}
        >
          {item.mediaType === MEDIA_TYPES.IMAGE ? (
            <img
              src={item.fileUrl}
              alt={item.title || item.fileName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : item.mediaType === MEDIA_TYPES.VIDEO ? (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
              <video
                src={item.fileUrl}
                className="w-full h-full object-cover"
                poster={item.thumbnailUrl}
              />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-black/40 rounded-full p-2 backdrop-blur-sm">
                  <Play className="h-5 w-5 text-white fill-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <FileText className="h-8 w-8 text-muted-foreground mb-2" />
              <Badge variant="outline" className="text-xs font-normal">
                {getFileExtension(item.fileName)}
              </Badge>
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-black/40 backdrop-blur-sm hover:bg-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id, item.fileName);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* File Type Badge */}
          <div className="absolute bottom-2 left-2">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm"
            >
              {getMediaIcon(item.mediaType)}
              {getFileExtension(item.fileName)}
            </Badge>
          </div>
        </div>

        {/* File Info */}
        <div className="p-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="font-medium text-sm truncate mb-1">
                  {item.title || item.fileName}
                </p>
              </TooltipTrigger>
              <TooltipContent>{item.title || item.fileName}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatFileSize(item.fileSize)}</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Gallery List Item Component
function GalleryListItem({
  item,
  onEdit,
  onDelete,
  onPreview,
  formatFileSize,
  getMediaIcon,
  formatDate,
}) {
  return (
    <Card className="group hover:bg-accent/50 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div
            className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-muted cursor-pointer"
            onClick={() => onPreview(item)}
          >
            {item.mediaType === MEDIA_TYPES.IMAGE ? (
              <img
                src={item.fileUrl}
                alt={item.title || item.fileName}
                className="w-full h-full object-cover"
              />
            ) : item.mediaType === MEDIA_TYPES.VIDEO ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                <Play className="h-5 w-5 text-primary" fill="currentColor" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm truncate">
                {item.title || item.fileName}
              </p>
              <Badge
                variant="outline"
                className="flex items-center gap-1 px-2 py-0.5 text-xs"
              >
                {getMediaIcon(item.mediaType)}
                {item.fileType?.split("/")[1]?.toUpperCase() || "FILE"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{formatFileSize(item.fileSize)}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(item.createdAt)}
              </span>
              {item.description && (
                <span className="truncate flex-1 max-w-[200px]">
                  {item.description}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(item.id, item.fileName)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Preview Dialog Component
function PreviewDialog({
  item,
  onClose,
  formatFileSize,
  formatDate,
  getMediaIcon,
  getFileExtension,
}) {
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="relative">
          {item.mediaType === MEDIA_TYPES.IMAGE ? (
            <img
              src={item.fileUrl}
              alt={item.title || item.fileName}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
          ) : item.mediaType === MEDIA_TYPES.VIDEO ? (
            <video
              src={item.fileUrl}
              className="w-full max-h-[70vh] bg-black"
              controls
              autoPlay
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-muted">
              <FileText className="h-24 w-24 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{item.title || item.fileName}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(item.fileSize)}
              </p>
            </div>
          )}
        </div>
        <div className="p-6 border-t">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                {item.title || item.fileName}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  {getMediaIcon(item.mediaType)}
                  {getFileExtension(item.fileName)}
                </span>
                <span>{formatFileSize(item.fileSize)}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(item.createdAt)}
                </span>
              </div>
              {item.description && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Edit Dialog Component
function EditDialog({ isOpen, onOpenChange, item, onSave, formatFileSize }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("general");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title || item.fileName || "");
      setDescription(item.description || "");
      setTags(item.tags?.join(", ") || "");
      setCategory(item.category || "general");
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        category,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Media Details</DialogTitle>
          <DialogDescription>
            Update the information for this media file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="social-media">Social Media</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="rounded-lg border p-3 space-y-2">
            <h4 className="font-medium text-sm">File Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 font-medium">{item.fileType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-2 font-medium">
                  {formatFileSize(item.fileSize)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Uploaded:</span>
                <span className="ml-2 font-medium">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}