"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreatePost() {
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) setMedia(URL.createObjectURL(file));
  };

  const handleSubmit = () => toast.success("Post created!");

  return (
    <Card className="p-6">
      <CardContent>
        <h2 className="text-lg font-semibold mb-4">Create Facebook Post</h2>
        <Input
          placeholder="Write something..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mb-4"
        />
        <input type="file" accept="image/*,video/*" onChange={handleMediaChange} />
        {media && (
          <div className="mt-4">
            {media.endsWith(".mp4") ? (
              <video src={media} controls className="w-full max-h-60 rounded-lg" />
            ) : (
              <img src={media} className="w-full max-h-60 object-cover rounded-lg" />
            )}
          </div>
        )}
        <Button onClick={handleSubmit} className="mt-4">Post</Button>
      </CardContent>
    </Card>
  );
}
