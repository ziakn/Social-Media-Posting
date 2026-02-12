import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function FeatureShowcase({ title, description, benefits, imageSrc, reversed = false }) {
    return (
        <div className="py-24 relative overflow-hidden font-sans">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className={cn(
                    "absolute w-96 h-96 bg-[#5e4a7a]/5 rounded-full blur-[120px]",
                    reversed ? "top-20 right-10" : "bottom-20 left-10"
                )} />
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className={cn("grid lg:grid-cols-2 gap-16 items-center", reversed ? "lg:flex-row-reverse" : "")}>

                    <div className={cn("space-y-8", reversed ? "lg:order-2" : "lg:order-1")}>
                        <div className="space-y-4">
                            <h2 className="text-3xl lg:text-[2.8rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[1.15]">
                                {title}
                            </h2>
                            <p className="text-lg text-[#4a3d58] font-[420] leading-relaxed">
                                {description}
                            </p>
                        </div>

                        <ul className="space-y-4">
                            {benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-[#5e4a7a]/10 flex items-center justify-center shrink-0">
                                        <Check className="h-3 w-3 text-[#5e4a7a]" />
                                    </div>
                                    <span className="text-[#4a3d58] font-medium">{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <Button variant="outline" className="h-12 px-8 text-base font-bold border-[#5e4a7a]/20 hover:bg-[#5e4a7a]/5 text-[#2d253b] rounded-[16px]">
                            Learn more
                        </Button>
                    </div>

                    <div className={cn(
                        "relative rounded-[32px] bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] aspect-[4/3] overflow-hidden shadow-lg",
                        reversed ? "lg:order-1" : "lg:order-2"
                    )}>
                        {/* Placeholder for actual image */}
                        <div className="absolute inset-0 flex items-center justify-center text-[#5e4a7a]/30 bg-gradient-to-br from-[#5e4a7a]/5 to-transparent">
                            <span className="font-bold text-2xl">Feature Preview</span>
                        </div>
                        {/* If imageSrc exists, we would use Image component here */}
                        {/* <Image src={imageSrc} fill className="object-cover" alt={title} /> */}
                    </div>

                </div>
            </div>
        </div>
    );
}
