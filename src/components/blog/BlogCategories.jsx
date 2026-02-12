import { cn } from "@/lib/utils";

export default function BlogCategories({ categories, activeCategory, setActiveCategory }) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16 relative z-10 font-sans">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                        "rounded-full px-8 py-3 font-bold text-[0.85rem] uppercase tracking-widest transition-all duration-300 shadow-sm active:scale-95",
                        activeCategory === cat
                            ? "bg-[#5e4a7a] text-white shadow-[#5e4a7a]/20"
                            : "bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] text-[#4a3d58] hover:bg-[rgba(255,255,255,0.6)]"
                    )}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
