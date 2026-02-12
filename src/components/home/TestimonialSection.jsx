
export default function TestimonialSection() {
    return (
        <section className="w-full my-10 md:my-16 mb-16">
            <div className="bg-[rgba(250,245,255,0.55)] backdrop-blur-[8px] rounded-[40px] p-10 md:p-[2.8rem] border border-[rgba(255,255,255,0.6)] flex flex-wrap items-center justify-between gap-6">
                <div className="flex-[2] text-[1.3rem] font-[440] text-[#302942] leading-[1.5] tracking-[-0.01em]">
                    <i className="fas fa-quote-left text-[#6f5b8b] mr-2 opacity-50 text-[1.2rem]"></i>
                    We manage 28 social profiles across 5 brands. UNI.social reduced our management time by 52%.
                    <div className="mt-3 text-[0.95rem] text-[#5e4f72] font-[430]">— Mia Chen, Director of Social, Loomly</div>
                </div>
                <button className="bg-[#2d253b] py-[0.9rem] px-[2.2rem] rounded-[50px] text-white font-[520] flex gap-3 items-center border border-[rgba(255,255,255,0.2)] text-[1rem] tracking-[-0.01em] transition-[0.15s] hover:bg-[#413258]">
                    <i className="fas fa-rocket"></i> Start free trial
                </button>
            </div>
        </section>
    );
}
