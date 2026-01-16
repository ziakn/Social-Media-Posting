import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BlogCategories({ categories, activeCategory, setActiveCategory }) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
            {categories.map((cat) => (
                <Button
                    key={cat}
                    variant="outline"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                        "rounded-full px-6 h-10 font-medium transition-all",
                        activeCategory === cat
                            ? "bg-gray-900 text-white border-gray-900 shadow-md hover:bg-gray-800 hover:text-white"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                >
                    {cat}
                </Button>
            ))}
        </div>
    );
}
