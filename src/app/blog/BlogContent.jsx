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
    <div className="min-h-screen bg-white font-inter text-[#3E4652]">
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
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[10px] bg-slate-50">
                <SearchX className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-2xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase">No articles found.</h3>
                <p className="text-slate-500 font-medium font-inter">Try selecting a different category protocol.</p>
                <Button
                  className="mt-8 bg-[#0C1B33] text-[#F9C80E] font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-[6px] hover:bg-[#0C1B33]/90 font-plus-jakarta"
                  onClick={() => setActiveCategory("All")}
                >
                  View All Intelligence
                </Button>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-16 flex justify-center">
              <Button className="bg-white border-2 border-[#0C1B33] text-[#0C1B33] hover:bg-slate-50 px-10 h-16 rounded-[6px] font-bold text-lg transition-all shadow-subtle font-plus-jakarta uppercase tracking-widest">
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