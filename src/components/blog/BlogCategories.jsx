"use client";

import { cn } from "@/lib/utils";

export default function BlogCategories({ categories, activeCategory, setActiveCategory }) {
    return (
        <div className="flex flex-wrap justify-center gap-2 mb-20">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                        "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all font-inter",
                        activeCategory === cat
                            ? "bg-[#0C1B33] text-[#F9C80E] shadow-subtle"
                            : "text-slate-400 hover:text-[#0C1B33] hover:bg-slate-50"
                    )}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
