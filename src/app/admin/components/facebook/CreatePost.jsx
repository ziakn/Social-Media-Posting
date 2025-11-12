"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CreatePost() {
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);

  const handleMediaChange = (e) => {
    setMedia(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = () => {
    console.log({ text, media });
  };

  return (
    <Card className="p-6">
      <CardContent>
        <h2 className="text-lg font-semibold mb-4">Create Post</h2>
        <div className="mb-4">
          <Input placeholder="Post title" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="mb-4 flex gap-2">
          <input type="file" accept="image/*,video/*" onChange={handleMediaChange} />
        </div>
        {media && (
          <div className="mb-4">
            {media.endsWith(".mp4") ? (
              <video src={media} controls className="w-full max-h-60" />
            ) : (
              <img src={media} alt="Preview" className="w-full max-h-60 object-cover" />
            )}
          </div>
        )}
        <Button onClick={handleSubmit}>Post</Button>
      </CardContent>
    </Card>
  );
}
