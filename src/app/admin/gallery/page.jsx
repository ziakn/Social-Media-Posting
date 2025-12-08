"use client";

import { useState, useEffect } from "react";
import {
  createGalleryItem,
  getUserGallery,
  deleteGalleryItem,
  updateGalleryItem,
} from "@/app/actions/gallery/galleryActions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  Upload,
  Loader2,
  Image as ImageIcon,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";

import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { UploadModal } from "@/components/gallery/UploadModal";
import { MediaDetailDialog } from "@/components/gallery/MediaDetailDialog";

export default function GalleryPage() {
  // Data State
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // UI State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadGallery(true);
  }, [filterType, filterCategory]);

  const loadGallery = async (isInitial = false) => {
    try {
      if (!isInitial && !hasMore) return;

      setLoading(true);
      const result = await getUserGallery({
        mediaType: filterType === "all" ? "" : filterType,
        category: filterCategory === "all" ? "" : filterCategory,
        limit: 10,
        cursor: isInitial ? null : nextCursor,
      });

      if (isInitial) {
        setGalleryItems(result.items);
      } else {
        setGalleryItems((prev) => [...prev, ...result.items]);
      }

      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load gallery", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (uploadData) => {
    try {
      const { file, title, description, category } = uploadData;

      // 1. Upload file to server/storage
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

      // 2. Create database record
      await createGalleryItem({
        fileName: file.name,
        fileUrl: data.url,
        fileType: file.type,
        fileSize: file.size,
        storagePath: data.storagePath,
        title: title || file.name.replace(/\.[^/.]+$/, ""),
        description,
        category,
      });

      toast.success("File uploaded successfully");
      loadGallery(true); // Reload to show new item
      setIsUploadModalOpen(false);

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description: error.message
      });
      throw error; // Re-throw to let modal handle state if needed
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      await deleteGalleryItem(item.id);
      toast.success("File deleted successfully");
      setGalleryItems((prev) => prev.filter((i) => i.id !== item.id));
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }
    } catch (error) {
      toast.error("Failed to delete file", {
        description: error.message,
      });
    }
  };

  // Client-side search filtering
  const filteredItems = galleryItems.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.fileName?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Media Gallery</h1>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        </div>
      </div>

      <main className="container flex-1 py-6 space-y-6">
        {/* Filters & Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Gallery Grid */}
        {loading && galleryItems.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <GalleryGrid
              items={filteredItems}
              onView={setSelectedItem}
              onDelete={handleDelete}
            />

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => loadGallery(false)}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <MediaDetailDialog
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}