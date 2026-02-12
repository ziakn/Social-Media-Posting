export default function PricingHero() {
    return (
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6 pt-32 pb-8 font-sans">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px] text-[0.8rem] font-bold uppercase tracking-widest text-[#5e4a7a]">
                <i className="fas fa-tag"></i>
                Flexible Pricing
            </span>

            {/* Heading */}
            <h1 className="text-4xl md:text-[3.8rem] font-[650] tracking-[-0.03em] leading-[1.1] text-[#2d253b]">
                Simple Plans <span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent font-bold">for Your Growth</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-[#4a3d58] font-[420] leading-relaxed">
                Choose the perfect plan to elevate your social media presence. No hidden fees.
            </p>
        </div>
    );
}
