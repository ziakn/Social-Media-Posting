"use client";

import { Instagram, Music2, Share2, Heart, MessageCircle, Zap } from "lucide-react";
import Image from "next/image";

export default function VisualGallerySection() {
    const galleryItems = [
        {
            id: 1,
            type: "instagram",
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
        <section className="py-32 bg-white overflow-hidden font-inter">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    {/* Left: Content */}
                    <div className="lg:w-1/2 space-y-10">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.3em] font-plus-jakarta flex items-center gap-2">
                                <Zap className="h-3 w-3 fill-[#F9C80E] text-[#F9C80E]" />
                                Resonance Protocol
                            </span>
                            <h2 className="text-4xl md:text-6xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tighter leading-[0.9] uppercase">
                                Visual <br /> <span className="text-[#3B82F6]">Resonance</span> Gallery
                            </h2>
                        </div>

                        <p className="text-xl text-[#3E4652] font-medium leading-relaxed max-w-xl">
                            Transform your linear feed into a high-impact visual ecosystem. SocialHub optimizes your assets for maximum engagement across every network.
                        </p>

                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div className="space-y-2 border-l-2 border-[#F9C80E] pl-6">
                                <div className="text-3xl font-black text-[#0C1B33] font-plus-jakarta">98%</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Visual Clarity <br /> Score</div>
                            </div>
                            <div className="space-y-2 border-l-2 border-[#3B82F6] pl-6">
                                <div className="text-3xl font-black text-[#0C1B33] font-plus-jakarta">4.2x</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Interaction <br /> Multiplier</div>
                            </div>
                        </div>

                        <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-sm px-10 py-5 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle uppercase tracking-widest font-plus-jakarta">
                            Explore Engagement Hub
                        </button>
                    </div>

                    {/* Right: Gallery Grid */}
                    <div className="lg:w-1/2 w-full">
                        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[600px]">
                            {/* TikTok (Tall) */}
                            <div className="relative rounded-2xl overflow-hidden group row-span-2 shadow-2xl">
                                <Image
                                    src={galleryItems[1].image}
                                    alt={galleryItems[1].title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0C1B33]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md p-2 rounded-lg text-white">
                                    {galleryItems[1].icon}
                                </div>
                                <div className="absolute bottom-6 left-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#F9C80E] mb-1">TikTok Pulse</div>
                                    <div className="text-lg font-bold font-plus-jakarta">{galleryItems[1].stats}</div>
                                </div>
                            </div>

                            {/* Instagram (Square Top) */}
                            <div className="relative rounded-2xl overflow-hidden group shadow-xl">
                                <Image
                                    src={galleryItems[0].image}
                                    alt={galleryItems[0].title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0C1B33]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-lg text-white">
                                    {galleryItems[0].icon}
                                </div>
                                <div className="absolute bottom-6 left-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                                    <div className="text-sm font-bold font-plus-jakarta">{galleryItems[0].stats}</div>
                                </div>
                            </div>

                            {/* Pinterest (Square Bottom) */}
                            <div className="relative rounded-2xl overflow-hidden group shadow-xl">
                                <Image
                                    src={galleryItems[2].image}
                                    alt={galleryItems[2].title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0C1B33]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-lg text-white">
                                    {galleryItems[2].icon}
                                </div>
                                <div className="absolute bottom-6 left-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                                    <div className="text-sm font-bold font-plus-jakarta">{galleryItems[2].stats}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
