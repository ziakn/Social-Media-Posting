// src/components/admin/instagram/CreatePost.jsx
"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";
import {
  Image,
  Video,
  Grid3X3,
  Play,
  Upload,
  Trash2,
  X,
  Plus,
  Calendar as CalendarIcon,
  Music,
  Instagram,
  Zap,
  Clock,
  Users,
  ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { fetchInstagramAccounts } from "@/app/actions/social/instagram/getPages";
import GalleryModal from "@/components/gallery/GalleryModal";

export default function CreatePost() {
  const [isPending, startTransition] = useTransition();
  const [postType, setPostType] = useState("feed");
  const [postContent, setPostContent] = useState({
    caption: "",
    images: [],
    video: null,
    audio: null,
    coverImage: null,
  });
  const [scheduling, setScheduling] = useState({
    schedule: false,
    date: new Date(),
    time: "12:00",
    timezone: "UTC"
  });

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Instagram-connected pages
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");

  // Gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryMediaType, setGalleryMediaType] = useState("image"); // 'image' or 'video'

  useEffect(() => {
    async function loadData() {
      const igRes = await fetchInstagramAccounts();

      if (igRes.success) {
        setPages(igRes.accounts);
      } else {
        toast.error("Failed to load Instagram accounts");
      }
    }
    loadData();
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Validate images for Instagram
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error("Instagram only supports JPEG and PNG images");
        return false;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error(`${file.name} must be under 8MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Check total images limit
    const totalImages = postContent.images.length + validFiles.length;
    const maxImages = postType === "carousel" ? 10 : 1;

    if (totalImages > maxImages) {
      toast.error(`You can upload maximum ${maxImages} image${maxImages !== 1 ? 's' : ''} for ${postType} posts`);
      return;
    }

    const newImages = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
      size: file.size,
      file: file
    }));

    setPostContent(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, maxImages)
    }));

    toast.success(`Added ${validFiles.length} image(s)`);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    if (file.type !== 'video/mp4') {
      toast.error("Instagram only supports MP4 videos");
      return;
    }

    // Different size limits for different post types
    let maxSize = 100 * 1024 * 1024; // 100MB default for feed/story
    if (postType === "reels") {
      maxSize = 500 * 1024 * 1024; // 500MB for Reels
    }

    if (file.size > maxSize) {
      toast.error(`Video must be under ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Clear images if video is selected (except for cover images in reels)
    if (postContent.images.length > 0 && postType !== "reels") {
      setPostContent(prev => ({ ...prev, images: [] }));
      toast.info("Images cleared - Instagram doesn't allow mixed image/video in single posts");
    }

    setPostContent(prev => ({
      ...prev,
      video: {
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        size: file.size,
        file: file,
        duration: 0 // You might want to calculate this
      }
    }));

    toast.success("Video added successfully");
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      toast.error("Please select an audio file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Audio file must be under 10MB");
      return;
    }

    setPostContent(prev => ({
      ...prev,
      audio: {
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        size: file.size,
        file: file
      }
    }));

    toast.success("Audio added successfully");
  };

  const removeImage = (index) => {
    setPostContent(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = () => {
    setPostContent(prev => ({ ...prev, video: null }));
  };

  const removeAudio = () => {
    setPostContent(prev => ({ ...prev, audio: null }));
  };

  const setCoverImage = (image) => {
    setPostContent(prev => ({ ...prev, coverImage: image }));
  };

  const clearAllImages = () => {
    setPostContent(prev => ({ ...prev, images: [] }));
  };

  const handleGallerySelect = (selectedItems) => {
    const items = Array.isArray(selectedItems) ? selectedItems : [selectedItems];

    if (galleryMediaType === "image") {
      const newImages = items.map(item => ({
        url: item.fileUrl,
        name: item.fileName,
        size: item.fileSize,
        type: item.fileType,
        file: null // No file object for gallery items
      }));

      const maxImages = postType === "carousel" ? 10 : 1;
      const totalImages = postContent.images.length + newImages.length;

      if (totalImages > maxImages) {
        toast.error(`You can upload maximum ${maxImages} image${maxImages !== 1 ? 's' : ''} for ${postType} posts`);
        return;
      }

      // Clear video if adding images (except for reels cover which is handled separately)
      if (postContent.video && postType !== "reels") {
        setPostContent(prev => ({ ...prev, video: null }));
      }

      setPostContent(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, maxImages)
      }));
      toast.success(`Added ${newImages.length} image(s) from gallery`);
    } else if (galleryMediaType === "video") {
      if (items.length > 0) {
        const item = items[0];
        setPostContent(prev => ({
          ...prev,
          images: [], // Clear images as most types don't allow mixed
          video: {
            url: item.fileUrl,
            name: item.fileName,
            size: item.fileSize,
            type: item.fileType,
            file: null
          }
        }));
        toast.success("Video added from gallery");
      }
    }
    setGalleryOpen(false);
  };

  const openGallery = (type) => {
    setGalleryMediaType(type);
    setGalleryOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedPage) return toast.error("Please select an Instagram account first");
    if (!postContent.caption.trim()) return toast.error("Please add a caption for your post");

    // Validation based on post type
    if (postType === "feed" && postContent.images.length === 0 && !postContent.video) {
      return toast.error("Please add an image or video");
    }

    if (postType === "carousel" && postContent.images.length < 2) {
      return toast.error("Carousel posts require at least 2 images");
    }

    if (postType === "story" && postContent.images.length === 0 && !postContent.video) {
      return toast.error("Please add an image or video for your story");
    }

    if (postType === "reels" && !postContent.video) {
      return toast.error("Please add a video for your reel");
    }

    const payload = {
      pageId: selectedPage,
      postType,
      caption: postContent.caption,
      scheduling: scheduling.schedule ? scheduling : null,
      images: postContent.images,
      video: postContent.video,
      audio: postContent.audio,
      coverImage: postContent.coverImage,
    };

    startTransition(async () => {
      try {
        let result;
        switch (postType) {
          case "feed":
            const { createInstagramImagePost } = await import("@/app/actions/social/instagram/createPost");
            result = await createInstagramImagePost({
              ...payload,
              image: postContent.images[0]
            });
            break;
          case "carousel":
            const { createInstagramCarouselPost } = await import("@/app/actions/social/instagram/createPost");
            result = await createInstagramCarouselPost(payload);
            break;
          case "story":
            const { createInstagramStory } = await import("@/app/actions/social/instagram/createPost");
            const media = postContent.images[0] || postContent.video;
            result = await createInstagramStory({
              pageId: selectedPage,
              media,
              caption: postContent.caption
            });
            break;
          case "reels":
            const { createInstagramReel } = await import("@/app/actions/social/instagram/createPost");
            result = await createInstagramReel(payload);
            break;
        }

        if (result.success) {
          toast.success(
            scheduling.schedule && postType !== "story" && postType !== "reels"
              ? `Post scheduled for ${format(scheduling.date, "PPP")} at ${scheduling.time}`
              : postType === "story"
                ? "Story published successfully!"
                : postType === "reels"
                  ? "Reel published successfully!"
                  : "Post published successfully!"
          );

          // Reset form
          setPostContent({
            caption: "",
            images: [],
            video: null,
            audio: null,
            coverImage: null,
          });
          setScheduling({ schedule: false, date: new Date(), time: "12:00", timezone: "UTC" });
        } else {
          toast.error(result.message || "Failed to create post");
        }
      } catch (error) {
        toast.error("Failed to create post. Please try again.");
      }
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const characterCount = postContent.caption.length;
  const maxCharacters = 2200;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-50 via-white to-purple-50 border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-600">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Create Instagram Post
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 pl-13">
                Create engaging content, stories, and reels for your followers
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0">
              <Zap className="mr-1 h-3 w-3" />
              Pro Feature
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Account Selection */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5 text-pink-600" />
                Select Instagram Account
              </CardTitle>
              <CardDescription>Choose which account to post from</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select an Instagram account" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map(page => (
                    <SelectItem key={page.igUserId} value={page.igUserId}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {page.displayName.charAt(0)}
                          </div>
                          <span className="font-medium">{page.displayName}</span>
                        </div>
                        {page.username && <Badge variant="secondary" className="ml-2">@{page.username}</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Post Creation */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Create Your Post</CardTitle>
              <CardDescription>Choose your post type and add content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={postType} onValueChange={setPostType}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="feed" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Feed Post
                  </TabsTrigger>
                  <TabsTrigger value="carousel" className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    Carousel
                  </TabsTrigger>
                  <TabsTrigger value="reels" className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Reels
                  </TabsTrigger>
                  <TabsTrigger value="story" className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Story
                  </TabsTrigger>
                </TabsList>

                {/* Caption - Common for all post types */}
                <div className="pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="caption" className="text-base">Caption</Label>
                    <SocialCaptionEditor
                      value={postContent.caption}
                      onChange={(e) => setPostContent(prev => ({ ...prev, caption: e.target.value }))}
                      placeholder={
                        postType === "reels"
                          ? "Write an engaging caption for your reel... #reels #viral"
                          : "Write a caption... Use hashtags to reach more people! #instagram #socialmedia"
                      }
                      platform="instagram"
                      minHeight="140px"
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Feed Post Content */}
                <TabsContent value="feed" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <Label className="text-base">Upload Media</Label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => openGallery("image")}
                        className="h-24 border-dashed border-2 hover:border-pink-500 hover:bg-pink-50 flex flex-col gap-2"
                      >
                        <ImageIcon className="h-6 w-6 text-pink-500" />
                        <span>Select Image from Gallery</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => openGallery("video")}
                        className="h-24 border-dashed border-2 hover:border-purple-500 hover:bg-purple-50 flex flex-col gap-2"
                      >
                        <Video className="h-6 w-6 text-purple-500" />
                        <span>Select Video from Gallery</span>
                      </Button>
                    </div>


                    {/* Media Previews */}
                    {(postContent.images.length > 0 || postContent.video) && (
                      <div className="space-y-3">
                        <Label>Media Preview</Label>

                        {/* Images Grid */}
                        {postContent.images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {postContent.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                  <img
                                    src={image.url}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Video Preview - Large */}
                        {postContent.video && (
                          <div className="relative group max-w-2xl">
                            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden border-2 border-purple-100 shadow-sm">
                              <video
                                src={postContent.video.url}
                                controls
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="shadow-lg"
                                onClick={removeVideo}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Video
                              </Button>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 px-1">
                              <span>{postContent.video.name}</span>
                              <span>{formatFileSize(postContent.video.size)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">JPEG/PNG/MP4</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Images: 8MB max</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Videos: 100MB max</Badge>
                    </div>
                  </div>
                </TabsContent>

                {/* Carousel Post Content */}
                <TabsContent value="carousel" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Upload Carousel Images</Label>
                      <Badge variant="outline">
                        {postContent.images.length}/10 images
                      </Badge>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => openGallery("image")}
                      className="w-full h-16 border-dashed border-2 hover:border-purple-500 hover:bg-purple-50"
                    >
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Select Images from Gallery
                    </Button>


                    {/* Carousel Previews */}
                    {postContent.images.length > 0 && (
                      <div className="space-y-3">
                        <Label>Carousel Previews</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {postContent.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                <img
                                  src={image.url}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                                {index + 1}
                              </div>
                            </div>
                          ))}

                          {postContent.images.length < 10 && (
                            <div
                              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
                              onClick={() => openGallery("image")}
                            >
                              <Plus className="h-6 w-6 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600">Add More</span>
                            </div>
                          )}
                        </div>

                        {postContent.images.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllImages}
                            className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">2-10 Images</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">JPEG/PNG only</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">8MB max per image</Badge>
                    </div>
                  </div>
                </TabsContent>

                {/* Reels Post Content */}
                <TabsContent value="reels" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <Label className="text-base">Upload Reel Video</Label>

                    <Button
                      variant="outline"
                      onClick={() => openGallery("video")}
                      className="w-full h-16 border-dashed border-2 hover:border-pink-500 hover:bg-pink-50"
                    >
                      <Video className="h-5 w-5 mr-2" />
                      Select Video from Gallery
                    </Button>


                    {/* Audio Upload for Reels */}
                    <div className="space-y-3">
                      <Label>Add Audio (Optional)</Label>
                      <div className="border rounded-lg p-4 bg-white">
                        <input
                          type="file"
                          ref={audioInputRef}
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="hidden"
                        />

                        {postContent.audio ? (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Music className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{postContent.audio.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(postContent.audio.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={removeAudio}
                              className="text-gray-500 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => audioInputRef.current?.click()}
                            className="w-full border-dashed"
                          >
                            <Music className="h-4 w-4 mr-2" />
                            Add Audio Track
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Video Preview and Cover Image Selection */}
                    {postContent.video && (
                      <div className="space-y-4">
                        <Label>Reel Preview</Label>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="relative bg-black rounded-xl overflow-hidden border-2 border-purple-200 aspect-[9/16] max-w-xs shadow-lg">
                              <video
                                src={postContent.video.url}
                                controls
                                className="w-full h-full object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-3 right-3 h-8 w-8 shadow-lg"
                                onClick={removeVideo}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Cover Image Selection */}
                          <div className="space-y-3">
                            <Label>Cover Image (Optional)</Label>
                            <p className="text-sm text-gray-600">
                              Choose a thumbnail for your reel
                            </p>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50/50">
                              <input
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setCoverImage({
                                      url: URL.createObjectURL(file),
                                      type: file.type,
                                      name: file.name,
                                      size: file.size,
                                      file: file
                                    });
                                  }
                                }}
                                className="hidden"
                                id="cover-image"
                              />

                              {postContent.coverImage ? (
                                <div className="space-y-2">
                                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                      src={postContent.coverImage.url}
                                      alt="Cover preview"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCoverImage(null)}
                                    className="w-full"
                                  >
                                    Change Cover
                                  </Button>
                                </div>
                              ) : (
                                <label htmlFor="cover-image" className="cursor-pointer block">
                                  <div className="space-y-2 py-4">
                                    <Image className="h-8 w-8 text-gray-400 mx-auto" />
                                    <p className="text-sm text-gray-600">Upload cover image</p>
                                  </div>
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">MP4 Video</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">500MB max</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">9:16 Recommended</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">5-90 seconds</Badge>
                    </div>
                  </div>
                </TabsContent>

                {/* Story Post Content */}
                <TabsContent value="story" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <Label className="text-base">Upload Story Media</Label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => openGallery("image")}
                        className="h-24 border-dashed border-2 hover:border-pink-500 hover:bg-pink-50 flex flex-col gap-2"
                      >
                        <ImageIcon className="h-6 w-6 text-pink-500" />
                        <span>Select Image from Gallery</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => openGallery("video")}
                        className="h-24 border-dashed border-2 hover:border-rose-500 hover:bg-rose-50 flex flex-col gap-2"
                      >
                        <Video className="h-6 w-6 text-rose-500" />
                        <span>Select Video from Gallery</span>
                      </Button>
                    </div>


                    {/* Story Preview */}
                    {(postContent.images.length > 0 || postContent.video) && (
                      <div className="space-y-3">
                        <Label>Story Preview</Label>
                        <div className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-pink-200 shadow-lg aspect-[9/16] max-w-xs">
                          {postContent.images.length > 0 ? (
                            <img
                              src={postContent.images[0].url}
                              alt="Story preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={postContent.video.url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          )}
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-3 right-3 h-8 w-8 shadow-lg"
                            onClick={() => {
                              if (postContent.images.length > 0) removeImage(0);
                              else removeVideo();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Scheduling Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-pink-600" />
                Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="schedule-toggle" className="text-sm font-medium">
                  Schedule this post
                </Label>
                <Switch
                  id="schedule-toggle"
                  checked={scheduling.schedule}
                  onCheckedChange={(checked) => setScheduling(prev => ({ ...prev, schedule: checked }))}
                />
              </div>

              {scheduling.schedule && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {format(scheduling.date, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={scheduling.date}
                          onSelect={(date) => date && setScheduling(prev => ({ ...prev, date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Time</Label>
                    <Input
                      type="time"
                      value={scheduling.time}
                      onChange={(e) => setScheduling(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Publish Button */}
          <Button
            size="lg"
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg"
            onClick={handleSubmit}
            disabled={isPending || !selectedPage}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {scheduling.schedule ? "Scheduling..." : "Publishing..."}
              </div>
            ) : scheduling.schedule && postType !== "story" && postType !== "reels" ? (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Schedule Post
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {postType === "story" ? "Share Story" : postType === "reels" ? "Share Reel" : "Publish Now"}
              </div>
            )}
          </Button>
        </div>
      </div>

      <GalleryModal
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={handleGallerySelect}
        allowMultiple={postType === "carousel"}
        allowedTypes={[galleryMediaType]}
        title={galleryMediaType === "image" ? "Select Images" : "Select Video"}
      />
    </div>
  );
}