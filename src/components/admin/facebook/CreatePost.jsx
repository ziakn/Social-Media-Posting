"use client";

import { useState, useRef, useTransition } from "react";
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
  Clock, DollarSign, Upload, Trash2, Play, FileText, Grid3X3
} from "lucide-react";

export default function CreateFacebookPost() {
  const [isPending, startTransition] = useTransition();
  const [selectedPage, setSelectedPage] = useState("");
  const [postType, setPostType] = useState("text");
  const [postContent, setPostContent] = useState({
    text: "",
    images: [],
    video: null,
    link: "",
    poll: { question: "", options: ["", ""], duration: 7 },
  });
  const [scheduling, setScheduling] = useState({
    schedule: false,
    date: new Date(),
    time: "12:00",
    timezone: "UTC",
  });
  const [audience, setAudience] = useState("public");
  const [boost, setBoost] = useState(false);
  const [budget, setBudget] = useState([100]);
  const [duration, setDuration] = useState([7]);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const accessToken = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN || "YOUR_ACCESS_TOKEN_HERE";

  const pages = [
    { id: "102597611693806", name: "Tech Hub", fans: "4.8K", category: "Technology" },
    { id: "2", name: "Food Lovers", fans: "2.3K", category: "Food & Drink" },
    { id: "3", name: "Travel Diaries", fans: "8.7K", category: "Travel" },
  ];

  const audienceOptions = [
    { value: "public", label: "Public", icon: Globe, description: "Anyone on or off Facebook" },
    { value: "friends", label: "Friends", icon: Users, description: "Your friends on Facebook" },
    { value: "only_me", label: "Only Me", icon: Eye, description: "Only you can see this post" },
  ];

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleImageUpload = (e) => {
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

    const newImages = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
      size: file.size,
      file: file,
    }));

    setPostContent(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 10),
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
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be under 100MB");
      return;
    }

    if (postContent.images.length > 0) {
      setPostContent(prev => ({ ...prev, images: [] }));
      toast.info("Images cleared - Facebook doesn't allow mixed image/video posts");
    }

    setPostContent(prev => ({
      ...prev,
      video: { url: URL.createObjectURL(file), type: file.type, name: file.name, size: file.size, file },
    }));

    toast.success("Video added successfully");
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

  const addPollOption = () => {
    if (postContent.poll.options.length < 4)
      setPostContent(prev => ({
        ...prev,
        poll: { ...prev.poll, options: [...prev.poll.options, ""] },
      }));
  };

  const removePollOption = (index) => {
    if (postContent.poll.options.length > 2) {
      setPostContent(prev => ({
        ...prev,
        poll: { ...prev.poll, options: prev.poll.options.filter((_, i) => i !== index) },
      }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedPage) return toast.error("Please select a Facebook page");
    if (!accessToken || accessToken === "YOUR_ACCESS_TOKEN_HERE") return toast.error("Access token not configured");

    // Validation
    if (postType === "text" && !postContent.text.trim()) return toast.error("Enter some text");
    if ((postType === "images" || postType === "video") && !postContent.text.trim()) return toast.error("Add a caption for your media post");
    if (postType === "images" && postContent.images.length === 0) return toast.error("Add at least one image");
    if (postType === "video" && !postContent.video) return toast.error("Add a video");
    if (postType === "link" && !postContent.link) return toast.error("Enter a link URL");
    if (postType === "poll" && (!postContent.poll.question || postContent.poll.options.some(opt => !opt.trim()))) return toast.error("Fill in poll question and options");

    const scheduledTime = scheduling.schedule ? new Date(`${format(scheduling.date, "yyyy-MM-dd")}T${scheduling.time}`) : null;
    const boostData = boost ? { budget: budget[0], duration: duration[0] } : null;

    startTransition(async () => {
      try {
        let result;

        switch (postType) {
          case "text":
            result = await createFacebookTextPost({ pageId: selectedPage, accessToken, message: postContent.text, scheduledTime, audience, boost: boostData });
            break;
          case "images":
            result = await createFacebookImagePost({ pageId: selectedPage, accessToken, message: postContent.text, images: postContent.images, scheduledTime, audience, boost: boostData });
            break;
          case "video":
            result = await createFacebookVideoPost({ pageId: selectedPage, accessToken, message: postContent.text, video: postContent.video, scheduledTime, audience, boost: boostData });
            break;
          case "link":
            result = await createFacebookLinkPost({ pageId: selectedPage, accessToken, message: postContent.text, link: postContent.link, scheduledTime, audience, boost: boostData });
            break;
          case "poll":
            result = await createFacebookPollPost({ pageId: selectedPage, accessToken, message: postContent.text, question: postContent.poll.question, options: postContent.poll.options, duration: postContent.poll.duration, scheduledTime, audience, boost: boostData });
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
          setPostContent({ text: "", images: [], video: null, link: "", poll: { question: "", options: ["", ""], duration: 7 } });
          setScheduling({ schedule: false, date: new Date(), time: "12:00", timezone: "UTC" });
          setBoost(false);
        } else {
          toast.error(result.message || "Failed to post. Try again.");
        }
      } catch (e) {
        console.error("Post error:", e);
        toast.error("Failed to post. Try again.");
      }
    });
  };

  const characterCount = postContent.text.length;
  const maxCharacters = 5000;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Facebook Post</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Design, schedule, and boost engaging posts across your Facebook pages</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Page Selection */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl"><Users className="h-5 w-5 text-blue-600" />Select Facebook Page</CardTitle>
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
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{page.name.charAt(0)}</div>
                          <div>
                            <div className="font-medium">{page.name}</div>
                            <div className="text-sm text-gray-500">{page.category}</div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">{page.fans} fans</Badge>
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
                <TabsList className="grid grid-cols-5 w-full">
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
                  <TabsTrigger value="poll" className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    Poll
                  </TabsTrigger>
                </TabsList>

                {/* Text Post */}
                <TabsContent value="text" className="space-y-4 pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="post-text" className="text-base">Post Content</Label>
                    <Textarea
                      id="post-text"
                      placeholder="What's on your mind? Share your thoughts with your audience..."
                      value={postContent.text}
                      onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                      className="min-h-[140px] resize-none text-base leading-relaxed"
                    />
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Image className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className={`${characterCount > maxCharacters * 0.9 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {characterCount}/{maxCharacters}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                {/* Images Post */}
                <TabsContent value="images" className="space-y-6 pt-6">
                  {/* Text Content */}
                  <div className="space-y-3">
                    <Label htmlFor="images-caption" className="text-base">Caption</Label>
                    <Textarea
                      id="images-caption"
                      placeholder="Add a caption for your images..."
                      value={postContent.text}
                      onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  <Separator />

                  {/* Image Upload Section */}
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
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-gradient-to-br from-blue-50 to-indigo-50">
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                            <Image className="h-8 w-8 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 text-lg">Add Photos</h3>
                          <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                            Upload up to 10 images. Supported formats: JPG, PNG, GIF. Maximum 10MB per image.
                          </p>
                          <Button
                            onClick={() => imageInputRef.current?.click()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                            size="lg"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Select Images
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Image Previews */}
                    {postContent.images.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base flex items-center gap-2">
                            <Grid3X3 className="h-4 w-4" />
                            Image Previews
                          </Label>
                          <span className="text-sm text-gray-500">
                            {postContent.images.length} image{postContent.images.length !== 1 ? 's' : ''} selected
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {postContent.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-colors">
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
                              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
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

                {/* Video Post */}
                <TabsContent value="video" className="space-y-6 pt-6">
                  {/* Text Content */}
                  <div className="space-y-3">
                    <Label htmlFor="video-caption" className="text-base">Caption</Label>
                    <Textarea
                      id="video-caption"
                      placeholder="Add a caption for your video..."
                      value={postContent.text}
                      onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  <Separator />

                  {/* Video Upload Section */}
                  <div className="space-y-4">
                    <Label className="text-base">Upload Video</Label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors bg-gradient-to-br from-purple-50 to-pink-50">
                      <input
                        type="file"
                        ref={videoInputRef}
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                            <Video className="h-8 w-8 text-purple-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 text-lg">Add Video</h3>
                          <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                            Upload a single video file. Supported formats: MP4, MOV. Maximum 100MB.
                          </p>
                          <Button
                            onClick={() => videoInputRef.current?.click()}
                            variant="outline"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50 shadow-lg"
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
                    <Textarea
                      id="link-caption"
                      placeholder="Add a comment about this link..."
                      value={postContent.text}
                      onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                      className="min-h-[100px] resize-none"
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

                  {postContent.link && (
                    <Card className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center flex-shrink-0">
                            <Link2 className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">Website Preview</h4>
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {postContent.link}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Facebook will generate a preview when you publish
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Poll Post */}
                <TabsContent value="poll" className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="poll-question" className="text-base">Poll Question</Label>
                    <Input
                      id="poll-question"
                      placeholder="Ask a question..."
                      value={postContent.poll.question}
                      onChange={(e) => setPostContent(prev => ({
                        ...prev,
                        poll: { ...prev.poll, question: e.target.value }
                      }))}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">Poll Options</Label>
                    <div className="space-y-3">
                      {postContent.poll.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...postContent.poll.options];
                              newOptions[index] = e.target.value;
                              setPostContent(prev => ({
                                ...prev,
                                poll: { ...prev.poll, options: newOptions }
                              }));
                            }}
                            className="flex-1"
                          />
                          {postContent.poll.options.length > 2 && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removePollOption(index)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {postContent.poll.options.length < 4 && (
                      <Button variant="outline" onClick={addPollOption} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Poll Duration: {postContent.poll.duration} days</Label>
                    <Slider
                      value={[postContent.poll.duration]}
                      onValueChange={(value) => setPostContent(prev => ({
                        ...prev,
                        poll: { ...prev.poll, duration: value[0] }
                      }))}
                      max={30}
                      min={1}
                      step={1}
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>1 day</span>
                      <span>30 days</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/4 width */}
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
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
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
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    audience === option.value
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

          {/* Boost Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                Boost Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="boost-toggle" className="text-sm font-medium">
                  Boost this post
                </Label>
                <Switch
                  id="boost-toggle"
                  checked={boost}
                  onCheckedChange={setBoost}
                />
              </div>

              {boost && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Budget: ${budget[0]}</Label>
                    <Slider
                      value={budget}
                      onValueChange={setBudget}
                      max={1000}
                      min={10}
                      step={10}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>$10</span>
                      <span>$1000</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Duration: {duration[0]} days</Label>
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      max={30}
                      min={1}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 day</span>
                      <span>30 days</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <BarChart3 className="h-4 w-4" />
                      Estimated reach: {(budget[0] * 50).toLocaleString()} people
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Publish Button */}
          <Button
            size="lg"
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            onClick={handleSubmit}
            disabled={isPending || !selectedPage}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {scheduling.schedule ? "Scheduling..." : "Publishing..."}
              </div>
            ) : scheduling.schedule ? (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Schedule Post
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Publish Now
              </div>
            )}
          </Button>

          {/* Character Progress */}
          {(postType === "text" || postType === "images" || postType === "video" || postType === "link") && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Character Count</span>
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}