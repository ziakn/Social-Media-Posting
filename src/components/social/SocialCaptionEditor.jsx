"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

// Platform character limits based on official documentation
const PLATFORM_LIMITS = {
    facebook: 63206,
    instagram: 2200,
    twitter: 280,
    linkedin: 3000,
    tiktok: 2200,
    bluesky: 300,
    default: 5000,
};

export default function SocialCaptionEditor({
    value = "",
    onChange,
    placeholder = "What's on your mind?",
    platform = "facebook",
    className = "",
    disabled = false,
    minHeight = "100px",
    maxLimit = null, // New prop to override platform default
}) {
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const textareaRef = useRef(null);

    const maxCharacters = maxLimit || PLATFORM_LIMITS[platform] || PLATFORM_LIMITS.default;
    const characterCount = value.length;
    const percentUsed = (characterCount / maxCharacters) * 100;

    // Determine character counter color based on usage
    const getCounterColor = () => {
        if (percentUsed >= 100) return "text-red-600 font-bold";
        if (percentUsed >= 90) return "text-orange-500 font-semibold";
        return "text-gray-500";
    };

    const handleEmojiClick = (emojiData) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const emoji = emojiData.emoji;

        const newValue = value.substring(0, start) + emoji + value.substring(end);
        onChange({ target: { value: newValue } });

        // Set cursor position after emoji
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
            textarea.focus();
        }, 0);

        setEmojiPickerOpen(false);
    };

    // Process text to highlight hashtags and mentions
    const processText = (text) => {
        // This is for display purposes only - the actual value remains plain text
        return text
            .split(/(\s+)/)
            .map((word, index) => {
                if (word.startsWith("#")) {
                    return `<span key="${index}" class="text-blue-600 font-medium">${word}</span>`;
                }
                if (word.startsWith("@")) {
                    return `<span key="${index}" class="text-purple-600 font-medium">${word}</span>`;
                }
                return word;
            })
            .join("");
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="relative">
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`resize-none pr-12 ${minHeight}`}
                    style={{ minHeight }}
                    maxLength={maxCharacters}
                />

                {/* Emoji Picker Button */}
                <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8 hover:bg-gray-100"
                            disabled={disabled}
                        >
                            <Smile className="h-5 w-5 text-gray-500" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 border-0" align="end">
                        <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            width={350}
                            height={400}
                            previewConfig={{ showPreview: false }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Character Counter and Info */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                    {/* Hashtag/Mention hint */}
                    <span className="text-gray-400 text-xs">
                        Use <span className="text-blue-600 font-medium">#hashtags</span> and{" "}
                        <span className="text-purple-600 font-medium">@mentions</span>
                    </span>
                </div>

                {/* Character Counter */}
                <div className={`transition-colors ${getCounterColor()}`}>
                    {characterCount.toLocaleString()} / {maxCharacters.toLocaleString()}
                    {percentUsed >= 90 && percentUsed < 100 && (
                        <span className="ml-2 text-xs">({Math.round(100 - percentUsed)}% left)</span>
                    )}
                    {percentUsed >= 100 && (
                        <span className="ml-2 text-xs">(Limit reached!)</span>
                    )}
                </div>
            </div>

            {/* Warning Messages */}
            {percentUsed >= 90 && percentUsed < 100 && (
                <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-md p-2">
                    ⚠️ You're approaching the character limit for {platform}
                </div>
            )}
            {percentUsed >= 100 && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                    🚫 Character limit reached! Please shorten your caption.
                </div>
            )}
        </div>
    );
}
