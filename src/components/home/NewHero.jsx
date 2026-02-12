import Link from 'next/link';

export default function NewHero() {
    return (
        <>
            {/* HEADER - Embedded in Hero/Page structure as per design */}
            {/* HEADER REMOVED - Using Layout Navbar */}

            <section className="w-full my-10 md:my-8">
                <div className="backdrop-blur-[4px] rounded-[40px] border border-[rgba(255,255,255,0.6)] py-16 px-6 md:px-12 w-full">
                    <div className="flex flex-col items-center text-center gap-7 max-w-[1000px] mx-auto">
                        <span className="bg-[rgba(225,215,245,0.4)] backdrop-blur-[4px] py-2 px-6 rounded-[60px] text-[0.85rem] font-semibold uppercase tracking-[0.04em] text-[#4e3d64] border border-[rgba(255,255,255,0.5)] inline-flex items-center gap-2">
                            <i className="fas fa-share-nodes"></i> unified command center
                        </span>
                        <h1 className="text-4xl md:text-[4.2rem] font-[650] tracking-[-0.03em] leading-[1.1] text-[#201c2b] m-0 text-balance">
                            <span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent font-bold">All your social channels</span><br />centrally managed
                        </h1>
                        <div className="text-lg md:text-[1.25rem] text-[#3b314a] bg-[rgba(250,245,255,0.45)] py-3 px-8 rounded-[60px] backdrop-blur-[4px] font-[420] border border-[rgba(255,255,255,0.5)] tracking-[-0.01em]">
                            <i className="fas fa-circle-check text-[#5e4a7a] mr-2"></i>
                            Instagram · TikTok · X · LinkedIn · YouTube · Threads · Pinterest
                        </div>

                        <div className="flex gap-9 justify-center items-center my-2 flex-wrap">
                            <i className="fab fa-instagram text-[2.2rem] text-[#4a3c5c] opacity-70 bg-[rgba(255,255,255,0.3)] p-[0.55rem] rounded-[18px] border border-[rgba(255,255,255,0.4)] transition-all hover:opacity-90 hover:bg-[rgba(255,255,255,0.5)]"></i>
                            <i className="fab fa-twitter text-[2.2rem] text-[#4a3c5c] opacity-70 bg-[rgba(255,255,255,0.3)] p-[0.55rem] rounded-[18px] border border-[rgba(255,255,255,0.4)] transition-all hover:opacity-90 hover:bg-[rgba(255,255,255,0.5)]"></i>
                            <i className="fab fa-tiktok text-[2.2rem] text-[#4a3c5c] opacity-70 bg-[rgba(255,255,255,0.3)] p-[0.55rem] rounded-[18px] border border-[rgba(255,255,255,0.4)] transition-all hover:opacity-90 hover:bg-[rgba(255,255,255,0.5)]"></i>
                            <i className="fab fa-linkedin text-[2.2rem] text-[#4a3c5c] opacity-70 bg-[rgba(255,255,255,0.3)] p-[0.55rem] rounded-[18px] border border-[rgba(255,255,255,0.4)] transition-all hover:opacity-90 hover:bg-[rgba(255,255,255,0.5)]"></i>
                            <i className="fab fa-youtube text-[2.2rem] text-[#4a3c5c] opacity-70 bg-[rgba(255,255,255,0.3)] p-[0.55rem] rounded-[18px] border border-[rgba(255,255,255,0.4)] transition-all hover:opacity-90 hover:bg-[rgba(255,255,255,0.5)]"></i>
                            <i className="fab fa-threads text-[2.2rem] text-[#4a3c5c] opacity-70 bg-[rgba(255,255,255,0.3)] p-[0.55rem] rounded-[18px] border border-[rgba(255,255,255,0.4)] transition-all hover:opacity-90 hover:bg-[rgba(255,255,255,0.5)]"></i>
                            <i className="fab fa-pinterest text-[2.2rem] text-[#4a3c5c] opacity-70 bg-[rgba(255,255,255,0.3)] p-[0.55rem] rounded-[18px] border border-[rgba(255,255,255,0.4)] transition-all hover:opacity-90 hover:bg-[rgba(255,255,255,0.5)]"></i>
                        </div>

                        <div className="flex gap-6 justify-center mt-2 flex-wrap">
                            <button className="border-none py-[0.9rem] px-[2.6rem] rounded-[60px] text-[1.05rem] font-[540] bg-[#2d253b] text-white border border-[rgba(255,255,255,0.2)] backdrop-blur-[4px] transition-all flex items-center gap-3 cursor-pointer tracking-[-0.01em] hover:bg-[#3e3152]">
                                <i className="fas fa-layer-group text-[#dacef0]"></i> Manage accounts
                            </button>
                            <button className="border-none py-[0.9rem] px-[2.6rem] rounded-[60px] text-[1.05rem] font-[540] bg-white text-[#1e1a2b] border border-[rgba(160,140,190,0.25)] backdrop-blur-[4px] transition-all flex items-center gap-3 cursor-pointer tracking-[-0.01em] hover:bg-[#f5f1fc] hover:border-[rgba(140,115,175,0.4)]">
                                <i className="fas fa-calendar"></i> Schedule demo
                            </button>
                        </div>
                        <div className="mt-3 text-[0.95rem] text-[#4a3c60] bg-[rgba(255,255,255,0.35)] py-[0.6rem] px-8 rounded-[60px] backdrop-blur-[4px] border border-[rgba(255,255,255,0.5)] font-[450] tracking-[-0.01em]">
                            <i className="fas fa-arrow-right mr-2 opacity-70"></i>
                            Connect unlimited profiles · unified inbox · cross-posting · consolidated analytics
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
