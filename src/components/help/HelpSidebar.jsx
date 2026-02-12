import { cn } from "@/lib/utils";

export default function HelpSidebar({ categories, activeCategory, setActiveCategory }) {
    return (
        <div className="lg:col-span-4 space-y-3 font-sans relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#4a3d58]/60 mb-6 px-4">Categories</h3>
            <div className="space-y-2">
                {categories.map((cat, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveCategory(idx)}
                        className={cn(
                            "w-full text-left px-6 py-4 rounded-[16px] font-bold transition-all duration-300 text-[0.95rem] tracking-tight active:scale-[0.98]",
                            activeCategory === idx
                                ? "bg-[#5e4a7a] text-white shadow-lg shadow-[#5e4a7a]/20"
                                : "text-[#4a3d58] bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.6)]"
                        )}
                    >
                        {cat.category}
                    </button>
                ))}
            </div>
        </div>
    );
}
