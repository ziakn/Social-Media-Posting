import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function FeatureShowcase({ title, description, benefits, imageSrc, reversed = false }) {
    return (
        <div className="py-24 bg-white border-b border-gray-100 last:border-0">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className={cn("grid lg:grid-cols-2 gap-16 items-center", reversed ? "lg:flex-row-reverse" : "")}>

                    <div className={cn("space-y-8", reversed ? "lg:order-2" : "lg:order-1")}>
                        <div className="space-y-4">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-display">
                                {title}
                            </h2>
                            <p className="text-lg text-gray-600 font-inter leading-relaxed">
                                {description}
                            </p>
                        </div>

                        <ul className="space-y-4">
                            {benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="mt-1 bg-green-100 text-green-600 rounded-full p-1">
                                        <Check className="h-3 w-3" />
                                    </div>
                                    <span className="text-gray-700 font-medium">{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <Button variant="outline" className="h-12 px-8 text-base font-semibold border-gray-200 hover:bg-gray-50 text-gray-900">
                            Learn more
                        </Button>
                    </div>

                    <div className={cn("relative rounded-2xl bg-gray-50 border border-gray-200 aspect-[4/3] overflow-hidden shadow-sm", reversed ? "lg:order-1" : "lg:order-2")}>
                        {/* Placeholder for actual image */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300 bg-gray-100">
                            <span className="font-display font-bold text-2xl">Image Placeholder</span>
                        </div>
                        {/* If imageSrc exists, we would use Image component here */}
                        {/* <Image src={imageSrc} fill className="object-cover" alt={title} /> */}
                    </div>

                </div>
            </div>
        </div>
    );
}
