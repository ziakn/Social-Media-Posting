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
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const fileInputRef = useRef(null);

  // Load gallery items on component mount
  useEffect(() => {
    loadGallery();
  }, [filterType]);

  // Load gallery items
  const loadGallery = async () => {
    try {
      setLoading(true);
      const result = await getUserGallery({
        mediaType: filterType,
      });
      setGalleryItems(result.items);
    } catch (error) {
      toast.error("Failed to load gallery: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    let errorCount = 0;

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
        await createGalleryItem({
          fileName: file.name,
          fileUrl: downloadURL,
          fileType: file.type,
          fileSize: file.size,
          storagePath: storagePath,
          description: `Uploaded ${new Date().toLocaleDateString()}`,
        });

        successCount++;
        setUploadProgress(100);
      } catch (error) {
        console.error("Upload error:", error);
        errorCount++;
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    event.target.value = "";

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`);
      loadGallery();
    }

    if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} file(s)`);
    }
  };

  // Handle delete
  const handleDelete = async (itemId, fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    try {
      await deleteGalleryItem(itemId);
      toast.success("File deleted successfully");
      loadGallery();
    } catch (error) {
      toast.error("Failed to delete file: " + error.message);
    }
  };

  // Filter items based on search
  const filteredItems = galleryItems.filter(
    (item) =>
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Get media type icon
  const getMediaIcon = (mediaType) => {
    switch (mediaType) {
      case MEDIA_TYPES.IMAGE:
        return <Image className="h-4 w-4" />;
      case MEDIA_TYPES.VIDEO:
        return <Video className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Gallery</h1>
          <p className="text-gray-600">Manage your images and videos</p>
        </div>

        <div className="flex gap-2">
          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Files
          </Button>

          {/* View Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={MEDIA_TYPES.IMAGE}>Images</SelectItem>
                <SelectItem value={MEDIA_TYPES.VIDEO}>Videos</SelectItem>
                <SelectItem value={MEDIA_TYPES.DOCUMENT}>Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Content */}
      {loading ? (
        <div className="text-center py-12">
          <Progress className="w-60 mx-auto" />
          <p className="mt-4">Loading your gallery...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || filterType !== "all"
                ? "No files match your search."
                : "No files in your gallery yet."}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First File
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden">
              <CardContent className="p-0">
                {/* Media Preview */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {item.mediaType === MEDIA_TYPES.IMAGE ? (
                    <img
                      src={item.fileUrl}
                      alt={item.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : item.mediaType === MEDIA_TYPES.VIDEO ? (
                    <video
                      src={item.fileUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <File className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <EditItemDialog item={item} onUpdate={loadGallery} />
                      </Dialog>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.fileName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* File Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium truncate flex-1 mr-2">
                      {item.fileName}
                    </p>
                    <Badge variant="outline" className="flex-shrink-0">
                      {getMediaIcon(item.mediaType)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.fileSize)}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.mediaType === MEDIA_TYPES.IMAGE ? (
                      <img
                        src={item.fileUrl}
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : item.mediaType === MEDIA_TYPES.VIDEO ? (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Video className="h-6 w-6 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <File className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{item.fileName}</p>
                      <Badge variant="outline">
                        {getMediaIcon(item.mediaType)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(item.fileSize)} •
                      {item.createdAt
                        ? item.createdAt.toLocaleDateString()
                        : "Recent"}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <EditItemDialog item={item} onUpdate={loadGallery} />
                    </Dialog>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id, item.fileName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="text-center text-sm text-gray-500">
        Showing {filteredItems.length} of {galleryItems.length} files
      </div>
    </div>
  );
}

// Edit Item Dialog Component
function EditItemDialog({ item, onUpdate }) {
  const [description, setDescription] = useState(item.description || "");
  const [tags, setTags] = useState(item.tags.join(", ") || "");
  const [category, setCategory] = useState(item.category || "general");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateGalleryItem(item.id, {
        description,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        category,
      });
      toast.success("File updated successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update file: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit File Details</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">File Name</label>
          <p className="text-sm text-gray-600">{item.fileName}</p>
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
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
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
