"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SearchX, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Components
import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import BlogHero from "@/components/blog/BlogHero";
import BlogCategories from "@/components/blog/BlogCategories";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogSidebar from "@/components/blog/BlogSidebar";
import NewFooter from "@/components/home/NewFooter";

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
    <main className="flex flex-col min-h-screen relative font-sans">
      <BackgroundCanvas />

      <div className="relative z-20 flex flex-col w-full">
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
                <div className="space-y-6">
                  {posts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                !loading && (
                  <div className="py-20 text-center border-2 border-dashed border-[rgba(110,85,145,0.2)] rounded-[32px] bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px]">
                    <SearchX className="h-12 w-12 text-[#5e4a7a]/40 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-[#2d253b] font-display">No articles found.</h3>
                    <p className="text-[#4a3d58] font-[420] text-[0.95rem]">Try selecting a different category.</p>
                    <button
                      className="mt-8 bg-[#2d253b] text-white font-bold uppercase tracking-widest text-[0.7rem] px-10 py-5 rounded-[16px] hover:bg-[#3f3155] transition-all shadow-md active:scale-95"
                      onClick={() => setActiveCategory("All")}
                    >
                      View All Posts
                    </button>
                  </div>
                )
              )}

              {/* Pagination / Loading State */}
              <div className="mt-16 flex justify-center">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-[#5e4a7a]/40" />
                ) : (
                  hasMore && posts.length > 0 && (
                    <button
                      className="bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] text-[#2d253b] px-10 py-4 h-16 rounded-[16px] font-bold text-xs uppercase tracking-widest hover:bg-[rgba(255,255,255,0.6)] transition-all shadow-md active:scale-95"
                      onClick={handleLoadMore}
                    >
                      Load More Articles
                    </button>
                  )
                )}
              </div>
            </main>

            <BlogSidebar />
          </div>
        </div>

        <NewFooter />
      </div>
    </main>
  );
}