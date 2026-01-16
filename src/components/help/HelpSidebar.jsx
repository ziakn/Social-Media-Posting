import { cn } from "@/lib/utils";

export default function HelpSidebar({ categories, activeCategory, setActiveCategory }) {
    return (
        <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 font-inter">Categories</h3>
            {categories.map((cat, idx) => (
                <button
                    key={idx}
                    onClick={() => setActiveCategory(idx)}
                    className={cn(
                        "w-full text-left px-4 py-3 rounded-lg font-medium transition-colors font-display text-lg",
                        activeCategory === idx
                            ? "bg-primary/10 text-primary"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                >
                    {cat.category}
                </button>
            ))}
        </div>
    );
}
