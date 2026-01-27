"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SearchX, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Sub-components
import BlogHero from "@/components/blog/BlogHero";
import BlogCategories from "@/components/blog/BlogCategories";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogSidebar from "@/components/blog/BlogSidebar";

// Data
import { categories } from "@/lib/constants/blog-data";
import { getPaginatedPosts } from "@/app/actions/website/blog/blogActions";

export default function BlogContent({ initialPosts = [] }) {
  const params = useParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Update state when category changes
  useEffect(() => {
    // If it's the initial load with "All", use props. Otherwise fetch.
    if (activeCategory === "All" && posts.length === initialPosts.length && initialPosts.length > 0) {
      return;
    }
    fetchPosts(true);
  }, [activeCategory]);

  // Handle URL params for category
  useEffect(() => {
    if (params?.name) {
      const catName = decodeURIComponent(params.name)
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const matched = categories.find(c => c.toLowerCase() === catName.toLowerCase());
      if (matched) {
        setActiveCategory(matched);
      }
    }
  }, [params]);

  const fetchPosts = async (reset = false) => {
    try {
      setLoading(true);
      const lastPost = reset ? null : posts[posts.length - 1];

      // If we're loading more, we need a cursor date. 
      // Ensure your posts have a valid 'date' or 'createdAt' field used for sorting.
      // The server action uses 'date' (desc).
      const lastDate = lastPost?.date || null;

      const res = await getPaginatedPosts({
        category: activeCategory,
        lastDate: reset ? null : lastDate,
        pageSize: 6
      });

      if (res.success) {
        if (reset) {
          setPosts(res.posts);
        } else {
          setPosts(prev => [...prev, ...res.posts]);
        }

        // Determine if there are more posts. 
        // Ideally the server should tell us, but checking if we got a full page is a decent proxy.
        if (res.posts.length < 6) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        toast.error("Failed to load posts.");
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchPosts(false);
  };

  return (
    <div className="min-h-screen bg-white font-inter text-gray-900">
      <BlogHero />

      <div className="container mx-auto px-6 py-16 max-w-[1280px]">
        <BlogCategories
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        <div className="grid lg:grid-cols-12 gap-12">
          {/* --- Main Content --- */}
          <main className="lg:col-span-8">
            {posts.length > 0 ? (
              <div className="space-y-10">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              !loading && (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <SearchX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 font-display">No articles found.</h3>
                  <p className="text-gray-500 font-medium font-inter">Try selecting a different category.</p>
                  <Button
                    className="mt-8 bg-gray-900 text-white font-bold uppercase tracking-widest text-xs px-8 h-12 rounded-lg hover:bg-gray-800"
                    onClick={() => setActiveCategory("All")}
                  >
                    View All Posts
                  </Button>
                </div>
              )
            )}

            {/* Pagination / Loading State */}
            <div className="mt-16 flex justify-center">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              ) : (
                hasMore && posts.length > 0 && (
                  <Button
                    variant="outline"
                    className="border-2 border-gray-200 text-gray-900 hover:bg-gray-50 px-10 h-14 rounded-xl font-bold text-base transition-all"
                    onClick={handleLoadMore}
                  >
                    Load More Articles
                  </Button>
                )
              )}
            </div>
          </main>

          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}