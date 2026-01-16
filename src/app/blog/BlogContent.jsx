"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

// Sub-components
import BlogHero from "@/components/blog/BlogHero";
import BlogCategories from "@/components/blog/BlogCategories";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogSidebar from "@/components/blog/BlogSidebar";

// Data
import { blogPosts, categories } from "@/lib/constants/blog-data";

export default function BlogContent() {
  const params = useParams();
  const [activeCategory, setActiveCategory] = useState("All");

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

  const filteredPosts = blogPosts.filter(post => {
    return activeCategory === "All" || post.category === activeCategory;
  });

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
            {filteredPosts.length > 0 ? (
              <div className="space-y-10">
                {filteredPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
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
            )}

            {/* Pagination */}
            <div className="mt-16 flex justify-center">
              <Button variant="outline" className="border-2 border-gray-200 text-gray-900 hover:bg-gray-50 px-10 h-14 rounded-xl font-bold text-base transition-all">
                Load More Articles
              </Button>
            </div>
          </main>

          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}