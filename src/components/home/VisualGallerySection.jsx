"use client";

import { Instagram, Music2, Share2, Zap, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function VisualGallerySection() {
    const galleryItems = [
        {
            id: 1,
            type: "instagram",
            // Using placeholder color if image missing, or use Next.js Image with fallback
            image: "/gallery/instagram.png",
            title: "Minimalist Workspace",
            stats: "12.4k Likes",
            size: "col-span-1 row-span-1",
            icon: <Instagram className="h-5 w-5" />
        },
        {
            id: 2,
            type: "tiktok",
            image: "/gallery/tiktok.png",
            title: "Future Pulse",
            stats: "850k Views",
            size: "col-span-1 row-span-2",
            icon: <Music2 className="h-5 w-5" />
        },
        {
            id: 3,
            type: "pinterest",
            image: "/gallery/pinterest.png",
            title: "Brutalist Sky",
            stats: "2.1k Saves",
            size: "col-span-1 row-span-1",
            icon: <Share2 className="h-5 w-5" />
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden font-sans">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="flex flex-col lg:flex-row gap-20 items-center">

                    {/* Left: Content */}
                    <div className="lg:w-1/2 space-y-10">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px] text-[0.8rem] font-bold uppercase tracking-widest text-[#5e4a7a]">
                                <Zap className="h-3.5 w-3.5 fill-[#5e4a7a]" />
                                Stunning Visuals
                            </span>
                            <h2 className="text-3xl md:text-[2.8rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[1.15]">
                                Your <br /> <span className="text-[#5e4a7a]">Engagement</span> Gallery
                            </h2>
                        </div>

                        <p className="text-[1.1rem] text-[#4a3d58] font-[420] leading-relaxed max-w-xl">
                            Turn your social media feed into a high-impact visual experience. Our platform helps you optimize your content for maximum engagement.
                        </p>

                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div className="space-y-1 relative pl-6 border-l-2 border-[#5e4a7a]/20">
                                <div className="text-4xl font-[700] text-[#2d253b] tracking-tight">98%</div>
                                <div className="text-[0.8rem] font-bold text-[#6f5b8b] uppercase tracking-widest leading-tight">Visual Clarity <br /> Score</div>
                            </div>
                            <div className="space-y-1 relative pl-6 border-l-2 border-[#5e4a7a]/20">
                                <div className="text-4xl font-[700] text-[#2d253b] tracking-tight">4.2x</div>
                                <div className="text-[0.8rem] font-bold text-[#6f5b8b] uppercase tracking-widest leading-tight">Interaction <br /> Multiplier</div>
                            </div>
                        </div>

                        <button className="bg-[#2d253b] text-white font-medium text-[0.95rem] px-8 py-4 rounded-[40px] hover:bg-[#3f3155] transition-all shadow-lg shadow-[#2d253b]/10 hover:shadow-[#2d253b]/20">
                            Explore Engagement Platform
                        </button>
                    </div>

                    {/* Right: Gallery Grid - Abstract Visuals for now if images missing */}
                    <div className="lg:w-1/2 w-full">
                        <div className="grid grid-cols-2 grid-rows-2 gap-5 h-[600px]">

                            {/* Card 2: TikTok (Tall) */}
                            <div className="relative rounded-[32px] overflow-hidden group row-span-2 shadow-xl bg-[#2d253b] border border-white/10">
                                {/* Gradient Background Simulation */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#4a3d58] to-[#1e172b]"></div>

                                {/* UI Elements */}
                                <div className="absolute top-5 left-5 bg-white/10 backdrop-blur-md p-2.5 rounded-[12px] text-white border border-white/10">
                                    <Music2 className="h-5 w-5" />
                                </div>
                                <div className="absolute bottom-6 left-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="text-[0.7rem] font-bold uppercase tracking-widest text-[#d9ccf0] mb-1">TikTok Pulse</div>
                                    <div className="text-xl font-bold tracking-tight">850k Views</div>
                                </div>

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                            </div>

                            {/* Card 1: Instagram (Square Top) */}
                            <div className="relative rounded-[32px] overflow-hidden group shadow-lg bg-white border border-[#e0dceb]">
                                {/* Placeholder Content */}
                                <div className="absolute inset-0 flex items-center justify-center bg-[#f5f2fa]">
                                    <div className="w-20 h-20 rounded-[20px] bg-white shadow-sm flex items-center justify-center">
                                        <Heart className="h-8 w-8 text-[#5e4a7a]/40" />
                                    </div>
                                </div>

                                <div className="absolute top-5 left-5 bg-white/80 backdrop-blur-md p-2.5 rounded-[12px] text-[#2d253b] shadow-sm">
                                    <Instagram className="h-5 w-5" />
                                </div>
                                <div className="absolute bottom-6 left-6 text-[#2d253b]">
                                    <div className="text-[0.7rem] font-bold uppercase tracking-widest text-[#5e4a7a] mb-1">Minimalist Workspace</div>
                                    <div className="text-lg font-bold tracking-tight">12.4k Likes</div>
                                </div>
                            </div>

                            {/* Card 3: Pinterest (Square Bottom) */}
                            <div className="relative rounded-[32px] overflow-hidden group shadow-lg bg-[#5e4a7a] text-white">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#5e4a7a] to-[#3f3155]"></div>

                                <div className="absolute top-5 left-5 bg-white/20 backdrop-blur-md p-2.5 rounded-[12px] text-white border border-white/10">
                                    <Share2 className="h-5 w-5" />
                                </div>
                                <div className="absolute bottom-6 left-6">
                                    <div className="text-[0.7rem] font-bold uppercase tracking-widest text-[#d9ccf0] mb-1">Brutalist Sky</div>
                                    <div className="text-lg font-bold tracking-tight">2.1k Saves</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
