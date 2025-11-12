"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Filter, Columns } from "lucide-react";
import { toast } from "sonner";

export default function PublishedPosts() {
  const [posts, setPosts] = useState([]);
  const [postType, setPostType] = useState([]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    // Later: replace with your API call to fetch published posts
    setTimeout(() => {
      setPosts([]);
    }, 500);
  }, []);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Post Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              Post Type <Filter className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {["Photos", "Text", "Links", "Live", "Reels"].map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() =>
                  setPostType((prev) =>
                    prev.includes(type)
                      ? prev.filter((t) => t !== type)
                      : [...prev, type]
                  )
                }
              >
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
        <Input
          placeholder="Search posts..."
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
              onSelect={setDateRange}
            />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Columns */}
        <Button variant="outline" className="flex items-center gap-2">
          Columns <Columns className="w-4 h-4" />
        </Button>

        {/* Clear */}
        <Button
          variant="ghost"
          onClick={() => {
            setPostType([]);
            setSearch("");
            setDateRange(null);
          }}
        >
          Clear
        </Button>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2 border-muted">
          <CardContent>
            <div className="text-xl font-semibold mb-4">
              No published posts yet
            </div>
            <p className="text-muted-foreground mb-6">
              Try selecting a different date range or filter.
            </p>
            <Button variant="outline" onClick={() => toast("Open date picker")}>
              Select date range
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent>
                <div className="font-medium">{post.caption}</div>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="mt-2 rounded-lg max-h-40 w-full object-cover"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
