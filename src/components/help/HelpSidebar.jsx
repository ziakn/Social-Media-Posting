import Link from "next/link";
import { HelpCircle, LifeBuoy, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HelpSidebar({ categories, activeCategory, setActiveCategory }) {
    return (
        <aside className="lg:col-span-4 space-y-12">
            <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-plus-jakarta">Intelligence Hub</h4>
                <div className="space-y-4">
                    {categories.map((cat, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveCategory(i)}
                            className={cn(
                                "flex items-center justify-between w-full p-6 rounded-[10px] border transition-all duration-300 group",
                                activeCategory === i
                                    ? "bg-[#0C1B33] border-[#0C1B33] shadow-lg shadow-[#0C1B33]/20"
                                    : "bg-slate-50 border-slate-100 hover:border-[#00A2FF]/30 hover:bg-white"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500",
                                    activeCategory === i ? "bg-white text-[#00A2FF]" : "bg-white shadow-sm text-slate-400 group-hover:text-[#00A2FF]"
                                )}>
                                    <HelpCircle className="h-5 w-5" />
                                </div>
                                <span className={cn(
                                    "font-black text-[11px] uppercase tracking-[0.2em] font-plus-jakarta transition-colors",
                                    activeCategory === i ? "text-white" : "text-[#0C1B33]"
                                )}>
                                    {cat.category}
                                </span>
                            </div>
                            {activeCategory === i && (
                                <Circle className="h-2 w-2 fill-[#F9C80E] text-[#F9C80E] animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-10 bg-[#F5F8FB] border border-slate-100 rounded-[10px] space-y-8">
                <LifeBuoy className="h-10 w-10 text-[#00A2FF]" />
                <h5 className="text-xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase leading-tight">Can't find the signal?</h5>
                <p className="text-sm font-medium leading-relaxed font-inter">Our protocol engineers are standing by to assist with your specific distribution nodes.</p>
                <Link href="/contact" className="block">
                    <button className="w-full bg-[#0C1B33] text-[#F9C80E] font-black text-[10px] uppercase tracking-widest h-14 rounded-[6px] hover:scale-105 transition-all shadow-subtle font-plus-jakarta">
                        Open Support Ticket
                    </button>
                </Link>
            </div>
        </aside>
    );
}
