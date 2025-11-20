// src/components/social/instagram/CreateInstagramPost.jsx

"use client";

import { useState, useRef, useTransition } from "react";
import { format } from "date-fns";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Image, 
  Video, 
  CalendarDays, 
  Grid3X3,
  MessageCircle,
  Users, 
  Zap, 
  X, 
  Plus, 
  Upload,
  Trash2,
  Play,
  FileText,
  Instagram,
  Clock
} from "lucide-react";

export default function CreateInstagramPost() {
  const [isPending, startTransition] = useTransition();
  const [selectedPage, setSelectedPage] = useState("");
  const [postType, setPostType] = useState("image");
  const [postContent, setPostContent] = useState({
    caption: "",
    images: [],
    video: null,
  });
  const [scheduling, setScheduling] = useState({ 
    schedule: false, 
    date: new Date(), 
    time: "12:00",
    timezone: "UTC"
  });
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Instagram-connected pages (must have Instagram Business Account linked)
  const pages = [
    { 
      id: "1", 
      name: "Fashion Brand", 
      followers: "24.8K", 
      category: "Fashion",
      hasInstagram: true 
    },
    { 
      id: "2", 
      name: "Coffee Shop", 
      followers: "12.3K", 
      category: "Food & Drink",
      hasInstagram: true 
    },
    { 
      id: "3", 
      name: "Travel Blog", 
      followers: "58.7K", 
      category: "Travel",
      hasInstagram: true 
    },
  ];

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
      if (file.size > 8 * 1024 * 1024) { // 8MB limit for Instagram
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

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be under 100MB");
      return;
    }

    // Clear images if video is selected
    if (postContent.images.length > 0) {
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
        file: file
      }
    }));

    toast.success("Video added successfully");
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

  const clearAllImages = () => {
    setPostContent(prev => ({ ...prev, images: [] }));
  };

  const handleSubmit = async () => {
    if (!selectedPage) return toast.error("Please select an Instagram account first");

    // Validation
    if (!postContent.caption.trim()) {
      return toast.error("Please add a caption for your post");
    }

    if ((postType === "image" || postType === "carousel") && postContent.images.length === 0) {
      return toast.error("Please add at least one image");
    }

    if (postType === "video" && !postContent.video) {
      return toast.error("Please add a video");
    }

    if (postType === "carousel" && postContent.images.length < 2) {
      return toast.error("Carousel posts require at least 2 images");
    }

    if (postType === "story" && postContent.images.length === 0 && !postContent.video) {
      return toast.error("Please add an image or video for your story");
    }

    const payload = {
      pageId: selectedPage,
      caption: postContent.caption,
      scheduling: scheduling.schedule ? scheduling : null,
    };

    // Add type-specific data
    if (postType === "image" || postType === "carousel" || postType === "story") {
      payload.images = postContent.images;
    }
    if (postType === "video" || postType === "story") {
      payload.video = postContent.video;
    }

    startTransition(async () => {
      try {
        let result;

        switch (postType) {
          case "image":
            const { createInstagramImagePost } = await import("@/app/actions/social/instagram/createPost");
            result = await createInstagramImagePost(payload);
            break;

          case "carousel":
            const { createInstagramCarouselPost } = await import("@/app/actions/social/instagram/createPost");
            result = await createInstagramCarouselPost(payload);
            break;

          case "video":
            const { createInstagramVideoPost } = await import("@/app/actions/social/instagram/createPost");
            result = await createInstagramVideoPost(payload);
            break;

          case "story":
            const { createInstagramStory } = await import("@/app/actions/social/instagram/createPost");
            // For stories, use either image or video
            const media = postContent.images[0] || postContent.video;
            if (!media) {
              throw new Error("Please add an image or video for your story");
            }
            result = await createInstagramStory({
              pageId: selectedPage,
              media,
              caption: postContent.caption
            });
            break;

          default:
            throw new Error(`Unsupported post type: ${postType}`);
        }

        if (result.success) {
          toast.success(
            scheduling.schedule && postType !== "story" 
              ? `Post scheduled for ${format(scheduling.date, "PPP")} at ${scheduling.time}`
              : postType === "story" 
                ? "Story published successfully!"
                : "Post published successfully!"
          );

          // Reset form
          setPostContent({
            caption: "",
            images: [],
            video: null,
          });
          setScheduling({ schedule: false, date: new Date(), time: "12:00", timezone: "UTC" });
        } else {
          toast.error(result.error || "Failed to create post");
        }
        
      } catch (error) {
        console.error("Instagram post creation error:", error);
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
  const maxCharacters = 2200; // Instagram caption limit

  // Timezone options
  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "EST", label: "Eastern Time" },
    { value: "PST", label: "Pacific Time" },
    { value: "CET", label: "Central European Time" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Instagram className="h-8 w-8 text-pink-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Create Instagram Post
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create engaging posts, carousels, videos, and stories for Instagram
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Account Selection */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5 text-pink-600" />
                Select Instagram Account
              </CardTitle>
              <CardDescription>
                Choose which Instagram Business Account to post from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select an Instagram account" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map(page => (
                    <SelectItem key={page.id} value={page.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            <Instagram className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{page.name}</div>
                            <div className="text-sm text-gray-500">{page.category}</div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {page.followers} followers
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Post Editor */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Create Your Post</CardTitle>
              <CardDescription>
                Choose your post type and create engaging content for Instagram
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={postType} onValueChange={setPostType} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="carousel" className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    Carousel
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="story" className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Story
                  </TabsTrigger>
                </TabsList>

                {/* Caption - Common for all post types */}
                <div className="pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="instagram-caption" className="text-base">Caption</Label>
                    <Textarea
                      id="instagram-caption"
                      placeholder="Write a caption... Use hashtags to reach more people! #instagram #socialmedia"
                      value={postContent.caption}
                      onChange={(e) => setPostContent(prev => ({ ...prev, caption: e.target.value }))}
                      className="min-h-[120px] resize-none text-base leading-relaxed"
                    />
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-gray-500">
                        {characterCount}/{maxCharacters} characters
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          # Hashtags
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          @ Mention
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Image Post Content */}
                <TabsContent value="image" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Upload Image</Label>
                      <Badge variant="outline" className="text-xs">
                        {postContent.images.length}/1 image
                      </Badge>
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 transition-colors bg-gradient-to-br from-pink-50 to-purple-50">
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/jpeg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                            <Image className="h-8 w-8 text-pink-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 text-lg">Add Photo</h3>
                          <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                            Upload a single image. Supported formats: JPEG, PNG. Maximum 8MB.
                          </p>
                          <Button
                            onClick={() => imageInputRef.current?.click()}
                            className="bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg"
                            size="lg"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Select Image
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {postContent.images.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-base">Image Preview</Label>
                        <div className="grid grid-cols-1 gap-4">
                          {postContent.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-pink-500 transition-colors max-w-md mx-auto">
                                <img
                                  src={image.url}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              </div>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                <p className="text-white text-xs truncate">{image.name}</p>
                                <p className="text-white/80 text-xs">{formatFileSize(image.size)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Carousel Post Content */}
                <TabsContent value="carousel" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label className="text-base">Upload Carousel Images</Label>
                        <Badge variant="outline" className="text-xs">
                          {postContent.images.length}/10 images
                        </Badge>
                      </div>
                      {postContent.images.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={clearAllImages}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All
                        </Button>
                      )}
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors bg-gradient-to-br from-purple-50 to-blue-50">
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/jpeg,image/png"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                            <Grid3X3 className="h-8 w-8 text-purple-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 text-lg">Add Carousel Photos</h3>
                          <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                            Upload 2-10 images for your carousel. Supported formats: JPEG, PNG. Maximum 8MB per image.
                          </p>
                          <Button
                            onClick={() => imageInputRef.current?.click()}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg"
                            size="lg"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Select Images
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Carousel Previews */}
                    {postContent.images.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base flex items-center gap-2">
                            <Grid3X3 className="h-4 w-4" />
                            Carousel Previews
                          </Label>
                          <span className="text-sm text-gray-500">
                            {postContent.images.length} image{postContent.images.length !== 1 ? 's' : ''} selected
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {postContent.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-purple-500 transition-colors">
                                <img
                                  src={image.url}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              </div>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                <p className="text-white text-xs truncate">{image.name}</p>
                                <p className="text-white/80 text-xs">{formatFileSize(image.size)}</p>
                              </div>
                              
                              {/* Image Number Badge */}
                              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                          
                          {/* Add More Button */}
                          {postContent.images.length < 10 && (
                            <div 
                              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
                              onClick={() => imageInputRef.current?.click()}
                            >
                              <Plus className="h-6 w-6 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600 text-center">Add More</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Video Post Content */}
                <TabsContent value="video" className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base">Upload Video</Label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-gradient-to-br from-blue-50 to-cyan-50">
                      <input
                        type="file"
                        ref={videoInputRef}
                        accept="video/mp4"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                            <Video className="h-8 w-8 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 text-lg">Add Video</h3>
                          <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                            Upload a single video file. Supported format: MP4. Maximum 100MB.
                          </p>
                          <Button
                            onClick={() => videoInputRef.current?.click()}
                            variant="outline"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-lg"
                            size="lg"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Select Video
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Video Preview */}
                    {postContent.video && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Video Preview
                          </Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={removeVideo}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Video
                          </Button>
                        </div>
                        
                        <div className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-blue-200 shadow-lg">
                          <video
                            src={postContent.video.url}
                            controls
                            className="w-full max-h-96"
                          />
                          <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{postContent.video.name}</p>
                                <p className="text-sm text-gray-300">
                                  {formatFileSize(postContent.video.size)} • {postContent.video.type}
                                </p>
                              </div>
                              <Badge variant="secondary" className="bg-blue-600 text-white">
                                Video
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Story Post Content */}
                <TabsContent value="story" className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base">Upload Story Media</Label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 transition-colors bg-gradient-to-br from-pink-50 to-rose-50">
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/jpeg,image/png,video/mp4"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          if (file.type.startsWith('image/')) {
                            handleImageUpload(e);
                          } else if (file.type.startsWith('video/')) {
                            handleVideoUpload(e);
                          }
                        }}
                        className="hidden"
                      />
                      
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                            <Play className="h-8 w-8 text-pink-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 text-lg">Add Story Media</h3>
                          <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                            Upload an image or video for your story. Images: JPEG/PNG (8MB max). Videos: MP4 (100MB max).
                          </p>
                          <Button
                            onClick={() => imageInputRef.current?.click()}
                            className="bg-gradient-to-r from-pink-600 to-rose-600 shadow-lg"
                            size="lg"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Select Media
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Story Preview */}
                    {(postContent.images.length > 0 || postContent.video) && (
                      <div className="space-y-3">
                        <Label className="text-base flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Story Preview
                        </Label>
                        
                        <div className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-pink-200 shadow-lg aspect-[9/16] max-w-xs mx-auto">
                          {postContent.images.length > 0 ? (
                            <img
                              src={postContent.images[0].url}
                              alt="Story preview"
                              className="w-full h-full object-cover"
                            />
                          ) : postContent.video ? (
                            <video
                              src={postContent.video.url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                          
                          <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {postContent.images.length > 0 ? postContent.images[0].name : postContent.video.name}
                                </p>
                                <p className="text-sm text-gray-300">
                                  {formatFileSize(postContent.images.length > 0 ? postContent.images[0].size : postContent.video.size)}
                                </p>
                              </div>
                              <Badge variant="secondary" className="bg-pink-600 text-white">
                                Story
                              </Badge>
                            </div>
                          </div>
                          
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-3 right-3 h-8 w-8"
                            onClick={() => {
                              if (postContent.images.length > 0) {
                                removeImage(0);
                              } else {
                                removeVideo();
                              }
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
          {/* Scheduling Card - Not available for Stories */}
          {postType !== "story" && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-pink-600" />
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
                            <CalendarDays className="h-4 w-4 mr-2" />
                            {format(scheduling.date, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={scheduling.date}
                            onSelect={(date) => setScheduling(prev => ({ ...prev, date }))}
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

                    <div className="space-y-2">
                      <Label className="text-sm">Timezone</Label>
                      <Select value={scheduling.timezone} onValueChange={(value) => setScheduling(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                {postType === "story" ? "Publishing Story..." : 
                 scheduling.schedule ? "Scheduling..." : "Publishing..."}
              </div>
            ) : postType === "story" ? (
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Publish Story
              </div>
            ) : scheduling.schedule ? (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Schedule Post
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Publish Now
              </div>
            )}
          </Button>

          {/* Character Progress */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Caption Length</span>
                  <span className={characterCount > maxCharacters * 0.9 ? 'text-amber-600' : 'text-gray-600'}>
                    {characterCount}/{maxCharacters}
                  </span>
                </div>
                <Progress 
                  value={(characterCount / maxCharacters) * 100} 
                  className={`h-2 ${
                    characterCount > maxCharacters * 0.9 ? 'bg-amber-200' : ''
                  }`}
                />
                {characterCount > 125 && characterCount < 500 && (
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Longer captions perform better on Instagram!
                  </p>
                )}
                {characterCount >= 500 && (
                  <p className="text-xs text-green-500 mt-2">
                    ✅ Great caption length for engagement!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Post Type Info */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Post Type Info</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  {postType === "image" && (
                    <p>• Single image post</p>
                  )}
                  {postType === "carousel" && (
                    <p>• 2-10 image carousel</p>
                  )}
                  {postType === "video" && (
                    <p>• MP4 video post</p>
                  )}
                  {postType === "story" && (
                    <p>• 24-hour story</p>
                  )}
                  <p className="text-gray-400 mt-2">
                    {postType !== "story" ? "Supports scheduling" : "Stories publish immediately"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}