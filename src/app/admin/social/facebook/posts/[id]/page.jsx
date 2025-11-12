"use client";

import { useState, useEffect } from "react";
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

// Firestore
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function ManageFacebookPosts() {
  const [postType, setPostType] = useState([]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [status, setStatus] = useState("published");
  const [posts, setPosts] = useState([]);

  // 🔥 Fetch published posts directly from Firestore (no controller)
  const handleFetchPosts = async () => {
    try {
      let q = query(collection(db, "facebookPosts"));

      // Example: Only fetch published posts
      if (status) {
        q = query(collection(db, "facebookPosts"), where("status", "==", status));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter locally (optional)
      const filtered = data.filter((p) =>
        search
          ? p.caption?.toLowerCase().includes(search.toLowerCase()) ||
            p.id.includes(search)
          : true
      );

      setPosts(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load posts");
    }
  };

  // 🧠 Load on tab/status change
  useEffect(() => {
    handleFetchPosts();
  }, [status]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* --- Tabs --- */}
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

        <Input
          placeholder="Search by ID or content"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />

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

        <Button variant="outline" className="flex items-center gap-2">
          Columns <Columns className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => {
            setPostType([]);
            setSearch("");
            setDateRange(null);
            handleFetchPosts();
          }}
        >
          Clear
        </Button>
      </div>

      {/* --- Posts --- */}
      {posts.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2 border-muted">
          <CardContent>
            <div className="text-xl font-semibold mb-4">
              No {status} posts found
            </div>
            <p className="text-muted-foreground mb-6">
              Try changing filters or date range.
            </p>
            <Button onClick={handleFetchPosts} variant="outline">
              Refresh
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
