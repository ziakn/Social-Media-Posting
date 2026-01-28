// components/social/facebook/CreateFacebookPost.jsx
"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { format } from "date-fns";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  createFacebookTextPost,
  createFacebookImagePost,
  createFacebookVideoPost,
  createFacebookLinkPost,
  createFacebookPollPost
} from "@/app/actions/social/facebook/createPost";
import {
  Image, Video, CalendarDays, BarChart, Link2, MessageCircle,
  Users, Eye, Globe, Zap, X, Plus, BarChart3, Calendar as CalendarIcon,
  Clock, DollarSign, Upload, Trash2, Play, FileText, Grid3X3, ImageIcon,
  Facebook,
  Check,
  Sparkles
} from "lucide-react";
import { fetchFacebookPages } from "@/app/actions/social/facebook/getPages";
import GalleryModal from "@/components/gallery/GalleryModal";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";

// Custom hook for file uploads
function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFiles = async (files) => {
    if (!files.length) return [];

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setProgress(100);
      return result.files;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return { uploadFiles, uploading, progress };
}

export default function CreateFacebookPost() {
  const [isPending, startTransition] = useTransition();
  const [selectedPage, setSelectedPage] = useState("");
  const [postType, setPostType] = useState("text");
  const [postContent, setPostContent] = useState({
    text: "",
    images: [],
    video: null,
    link: "",
  });
  const [scheduling, setScheduling] = useState({
    schedule: false,
    date: new Date(),
    time: "12:00",
    timezone: "UTC",
  });
  const [audience, setAudience] = useState("public");
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryMediaType, setGalleryMediaType] = useState("image"); // 'image' or 'video'

  const { uploadFiles, uploading, progress } = useFileUpload();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setScheduling(prev => ({
        ...prev,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }));
    }

    async function loadData() {
      const fbRes = await fetchFacebookPages();

      if (fbRes.success) {
        setPages(
          fbRes.pages.map((p) => ({
            id: p.pageId,
            name: p.pageName,
            fans: p.fans,
            category: p.category,
          }))
        );
      }
    }
    loadData();
  }, []);

  const audienceOptions = [
    { value: "public", label: "Public", icon: Globe, description: "Anyone on or off Facebook" },
  ];

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} must be under 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const totalImages = postContent.images.length + validFiles.length;
    if (totalImages > 10) {
      toast.error("You can upload maximum 10 images");
      return;
    }

    try {
      // Upload files first
      const uploadedFiles = await uploadFiles(validFiles);

      const newImages = validFiles.map((file, index) => ({
        ...uploadedFiles[index],
        file: file, // Keep file reference for preview
      }));

      setPostContent(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 10),
      }));

      toast.success(`Added ${validFiles.length} image(s)`);
    } catch (error) {
      toast.error(`Failed to upload images: ${error.message}`);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be under 100MB");
      return;
    }

    if (postContent.images.length > 0) {
      setPostContent(prev => ({ ...prev, images: [] }));
      toast.info("Images cleared - Facebook doesn't allow mixed image/video posts");
    }

    try {
      const uploadedFiles = await uploadFiles([file]);

      setPostContent(prev => ({
        ...prev,
        video: { ...uploadedFiles[0], file },
      }));

      toast.success("Video added successfully");
    } catch (error) {
      toast.error(`Failed to upload video: ${error.message}`);
    }
  };

  const removeImage = (index) => {
    setPostContent(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeVideo = () => {
    setPostContent(prev => ({ ...prev, video: null }));
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

      const totalImages = postContent.images.length + newImages.length;
      if (totalImages > 10) {
        toast.error("You can upload maximum 10 images");
        return;
      }

      setPostContent(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 10),
      }));
      toast.success(`Added ${newImages.length} image(s) from gallery`);
    } else if (galleryMediaType === "video") {
      if (items.length > 0) {
        const item = items[0];
        setPostContent(prev => ({
          ...prev,
          images: [], // Clear images as FB doesn't allow mixed
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

  const validateForm = () => {
    if (!selectedPage) {
      toast.error("Please select a Facebook page");
      return false;
    }

    switch (postType) {
      case "text":
        if (!postContent.text.trim()) {
          toast.error("Enter some text");
          return false;
        }
        break;
      case "images":
        if (!postContent.text.trim()) {
          toast.error("Add a caption for your images");
          return false;
        }
        if (postContent.images.length === 0) {
          toast.error("Add at least one image");
          return false;
        }
        break;
      case "video":
        if (!postContent.text.trim()) {
          toast.error("Add a caption for your video");
          return false;
        }
        if (!postContent.video) {
          toast.error("Add a video");
          return false;
        }
        break;
      case "link":
        if (!postContent.link) {
          toast.error("Enter a link URL");
          return false;
        }
        break;

    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const scheduledTime = scheduling.schedule
      ? new Date(`${format(scheduling.date, "yyyy-MM-dd")}T${scheduling.time}`)
      : null;



    startTransition(async () => {
      try {
        let result;
        const commonProps = {
          pageId: selectedPage,
          message: postContent.text,
          scheduledTime,
          additionalData: {
            audience,
            ...(postType === 'link' && { link: postContent.link }),
          },
        };

        switch (postType) {
          case "text":
            result = await createFacebookTextPost(commonProps);
            break;
          case "images":
            result = await createFacebookImagePost({
              ...commonProps,
              mediaUrls: postContent.images,
            });
            break;
          case "video":
            result = await createFacebookVideoPost({
              ...commonProps,
              mediaUrls: postContent.video ? [postContent.video] : [],
            });
            break;
          case "link":
            result = await createFacebookLinkPost(commonProps);
            break;

          default:
            throw new Error("Invalid post type");
        }

        if (result.success) {
          toast.success(scheduledTime
            ? `Post scheduled for ${format(scheduling.date, "PPP")} at ${scheduling.time}`
            : "Post published successfully!"
          );

          // Reset form
          setPostContent({
            text: "",
            images: [],
            video: null,
            link: "",
          });
          setScheduling({
            schedule: false,
            date: new Date(),
            time: "12:00",
            timezone: "UTC"
          });
          setCoinBalance(prev => prev - 1);
        } else {
          toast.error(result.message || "Failed to post. Try again.");
        }
      } catch (e) {
        console.error("Post error:", e);
        toast.error("Failed to post. Try again.");
      }
    });
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Create Facebook Post
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 pl-13">
                Craft engaging content, schedule for optimal times, and reach your audience effectively
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <Zap className="mr-1 h-3 w-3" />
              Pro Feature
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Page Selection */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5 text-blue-600" />
                Select Facebook Page
              </CardTitle>
              <CardDescription>Choose which page you want to post from</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select a Facebook page" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map(page => (
                    <SelectItem key={page.id} value={page.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {page.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{page.name}</div>
                            <div className="text-sm text-gray-500">{page.category}</div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {page.fans} fans
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
                Choose your post type and create engaging content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={postType} onValueChange={setPostType} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="images" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Images
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="link" className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Link
                  </TabsTrigger>
                </TabsList>

                {/* Text Post */}
                <TabsContent value="text" className="space-y-4 pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="post-text" className="text-base">Post Content</Label>
                    <SocialCaptionEditor
                      value={postContent.text}
                      onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="What's on your mind? Share your thoughts with your audience..."
                      platform="facebook"
                      minHeight="140px"
                    />
                  </div>
                </TabsContent>

                {/* Images Post */}
                <TabsContent value="images" className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="images-caption" className="text-base">Caption</Label>
                    <SocialCaptionEditor
                      value={postContent.text}
                      onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Add a caption for your images..."
                      platform="facebook"
                      minHeight="100px"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label className="text-base">Upload Images</Label>
                        <Badge variant="outline" className="text-xs">
                          {postContent.images.length}/10 images
                        </Badge>
                      </div>
                      {postContent.images.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPostContent(prev => ({ ...prev, images: [] }))}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => openGallery("image")}
                      className="w-full h-16 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50"
                    >
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Select Images from Gallery
                    </Button>

                    {/* Image Previews */}
                    {postContent.images.length > 0 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {postContent.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-colors">
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

                {/* Video Post */}
                <TabsContent value="video" className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="video-caption" className="text-base">Caption</Label>
                    <SocialCaptionEditor
                      value={postContent.text}
                      onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Add a caption for your video..."
                      platform="facebook"
                      minHeight="100px"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base">Upload Video</Label>

                    <Button
                      variant="outline"
                      onClick={() => openGallery("video")}
                      className="w-full h-16 border-dashed border-2 hover:border-purple-500 hover:bg-purple-50"
                    >
                      <Video className="h-5 w-5 mr-2" />
                      Select Video from Gallery
                    </Button>

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

                        <div className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-purple-200 shadow-lg">
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
                              <Badge variant="secondary" className="bg-purple-600 text-white">
                                Video
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Link Post */}
                <TabsContent value="link" className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="link-caption" className="text-base">Caption</Label>
                    <SocialCaptionEditor
                      value={postContent.text}
                      onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Add a comment about this link..."
                      platform="facebook"
                      minHeight="100px"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="link-url" className="text-base">Link URL</Label>
                    <Input
                      id="link-url"
                      type="url"
                      placeholder="https://example.com"
                      value={postContent.link}
                      onChange={(e) => setPostContent(prev => ({ ...prev, link: e.target.value }))}
                      className="h-12 text-base"
                    />
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
                <Clock className="h-5 w-5 text-blue-600" />
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

          {/* Audience Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {audienceOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${audience === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  onClick={() => setAudience(option.value)}
                >
                  <option.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </div>
                  {audience === option.value && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>



          {/* Publish Button */}
          <Button
            size="lg"
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            onClick={handleSubmit}
            disabled={isPending || uploading || !selectedPage}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {scheduling.schedule ? "Scheduling..." : "Publishing..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {scheduling.schedule ? <CalendarDays className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                {scheduling.schedule ? "Schedule Post" : "Publish Now"}
              </div>
            )}
          </Button>

          {/* Character Progress */}

        </div>
      </div>

      <GalleryModal
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={handleGallerySelect}
        allowMultiple={galleryMediaType === "image"}
        allowedTypes={[galleryMediaType]}
        title={galleryMediaType === "image" ? "Select Images" : "Select Video"}
      />
    </div>
  );
}