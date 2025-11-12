"use client";

import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Columns, Filter } from "lucide-react";

export default function ManageFacebookPosts() {
  const [postType, setPostType] = useState([]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [status, setStatus] = useState("published");
  const [posts, setPosts] = useState([]); // your fetched posts

  // Placeholder: Fetch posts based on filters
  const handleFetchPosts = async () => {
    try {
      // Call your action to fetch posts by status, type, dateRange, search
      // const data = await fetchFacebookPosts({status, postType, dateRange, search})
      // setPosts(data.posts);
    } catch (err) {
      toast.error("Failed to load posts");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* --- Tabs for Status --- */}
      <Tabs value={status} onValueChange={setStatus} className="mb-6">
        <TabsList>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="expiring">Expiring</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* --- Filters Row --- */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Post Type Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              Post type <Filter className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {["Photos", "Text", "Links", "Live", "Reels"].map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => setPostType((prev) =>
                  prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                )}
              >
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
        <Input
          placeholder="Search by ID or content"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />

        {/* Date Range */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {dateRange
                ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                : "Select date range"}{" "}
              <CalendarIcon className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-2">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => setDateRange(range)}
            />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Columns */}
        <Button variant="outline" className="flex items-center gap-2">
          Columns <Columns className="w-4 h-4" />
        </Button>

        {/* Clear Filters */}
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => {
            setPostType([]);
            setSearch("");
            setDateRange(null);
          }}
        >
          Clear
        </Button>
      </div>

      {/* --- Posts Table or Empty State --- */}
      {posts.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2 border-muted">
          <CardContent>
            <div className="text-xl font-semibold mb-4">No activity during this date range</div>
            <p className="text-muted-foreground mb-6">
              Please select a different date range to see posts.
            </p>
            <Button
              onClick={() => toast("Open date picker")}
              variant="outline"
            >
              Select date range
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="border rounded-xl shadow-sm">
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">{post.type}</div>
                <div className="text-base font-medium">{post.caption}</div>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post media"
                    className="mt-2 rounded-lg max-h-40 w-full object-cover"
                  />
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Scheduled: {post.scheduledAt || "—"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
