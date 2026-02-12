export default function HelpHero() {
    return (
        <div className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28 font-sans">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-[#5e4a7a]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#5e4a7a]/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
                <div className="max-w-4xl mx-auto">
                    {/* Badge */}
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px] text-[0.8rem] font-bold uppercase tracking-widest text-[#5e4a7a] mb-8">
                        <i className="fas fa-question-circle"></i>
                        Support Center
                    </span>

                    <h1 className="text-4xl md:text-[4.2rem] font-[650] tracking-[-0.03em] leading-[1.1] text-[#2d253b] mb-6 text-balance">
                        How can we help you <span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent font-bold">succeed</span>?
                    </h1>
                    <p className="text-xl text-[#4a3d58] max-w-2xl mx-auto font-[420] leading-relaxed">
                        Browse our guides and FAQs to get the most out of UNI.social. Our team is here to support your growth.
                    </p>
                </div>
            </div>
        </div>
    );
}
