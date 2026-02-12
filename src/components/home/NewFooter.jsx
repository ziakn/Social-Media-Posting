import Link from "next/link";

export default function NewFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[rgba(245,240,255,0.6)] backdrop-blur-[8px] border-t border-[rgba(200,185,220,0.25)] py-14 pb-10 w-full mt-8 rounded-none">
            <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-10 px-4">
                <div className="flex flex-col">
                    <h3 className="flex items-center gap-2.5 text-[1.5rem] font-semibold text-[#2d253b] mb-5 tracking-[-0.02em]">
                        {/* Restored Original Logo Icon (Zap) but kept new style */}
                        <div className="bg-[#5e4a7a] p-1.5 rounded-[8px] text-white flex items-center justify-center w-8 h-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                        </div>
                        SocialHub
                    </h3>
                    <p className="text-[#4a3d58] text-[0.95rem] leading-[1.7] font-[380] mb-6">
                        The professional command center for scheduling, analyzing, and growing your digital voice across every major platform.
                    </p>
                    <div className="flex gap-6 text-[1.4rem] text-[#55466b]">
                        <i className="fab fa-instagram opacity-70 transition-all hover:opacity-100 cursor-pointer"></i>
                        <i className="fab fa-x-twitter opacity-70 transition-all hover:opacity-100 cursor-pointer"></i>
                        <i className="fab fa-linkedin opacity-70 transition-all hover:opacity-100 cursor-pointer"></i>
                        <i className="fab fa-youtube opacity-70 transition-all hover:opacity-100 cursor-pointer"></i>
                    </div>
                </div>

                {/* Product Column */}
                <div className="flex flex-col">
                    <h4 className="text-[1rem] font-semibold mb-6 text-[#332b41] uppercase tracking-[0.04em]">Product</h4>
                    <ul className="list-none m-0 p-0">
                        <li className="mb-3"><Link href="/features" className="no-underline text-[#4e3f5c] font-[420] text-[0.95rem] transition-all border-b border-transparent pb-1 hover:text-[#1e142b] hover:border-[#7a66a0]">Overview</Link></li>
                        <li className="mb-3"><Link href="/integrations" className="no-underline text-[#4e3f5c] font-[420] text-[0.95rem] transition-all border-b border-transparent pb-1 hover:text-[#1e142b] hover:border-[#7a66a0]">Integrations</Link></li>
                        <li className="mb-3"><Link href="/pricing" className="no-underline text-[#4e3f5c] font-[420] text-[0.95rem] transition-all border-b border-transparent pb-1 hover:text-[#1e142b] hover:border-[#7a66a0]">Pricing</Link></li>
                        <li className="mb-3"><Link href="/roadmap" className="no-underline text-[#4e3f5c] font-[420] text-[0.95rem] transition-all border-b border-transparent pb-1 hover:text-[#1e142b] hover:border-[#7a66a0]">Roadmap</Link></li>
                    </ul>
                </div>

                {/* Resources Column */}
                <div className="flex flex-col">
                    <h4 className="text-[1rem] font-semibold mb-6 text-[#332b41] uppercase tracking-[0.04em]">Resources</h4>
                    <ul className="list-none m-0 p-0">
                        <li className="mb-3"><Link href="/blog" className="no-underline text-[#4e3f5c] font-[420] text-[0.95rem] transition-all border-b border-transparent pb-1 hover:text-[#1e142b] hover:border-[#7a66a0]">Blog</Link></li>
                        <li className="mb-3"><Link href="/help" className="no-underline text-[#4e3f5c] font-[420] text-[0.95rem] transition-all border-b border-transparent pb-1 hover:text-[#1e142b] hover:border-[#7a66a0]">Help Center</Link></li>
                        <li className="mb-3"><Link href="/guides" className="no-underline text-[#4e3f5c] font-[420] text-[0.95rem] transition-all border-b border-transparent pb-1 hover:text-[#1e142b] hover:border-[#7a66a0]">Guides</Link></li>
                        <li className="mb-3"><Link href="/status" className="no-underline text-[#4e3f5c] font-[420] text-[0.95rem] transition-all border-b border-transparent pb-1 hover:text-[#1e142b] hover:border-[#7a66a0]">Status</Link></li>
                    </ul>
                </div>

                {/* Company & Legal Column */}
                <div className="flex flex-col">
                    <h4 className="text-[1rem] font-semibold mb-6 text-[#332b41] uppercase tracking-[0.04em]">Company</h4>
                    <ul className="list-none m-0 p-0">
                        <li className="mb-3"><Link href="/about" className="no-underline text-[#4e3f5c] font-[420] text-[0.95rem] transition-all border-b border-transparent pb-1 hover:text-[#1e142b] hover:border-[#7a66a0]">About</Link></li>
                        <li className="mb-3"><Link href="/careers" className="no-underline text-[#4e3f5c] font-[420] text-[0.95rem] transition-all border-b border-transparent pb-1 hover:text-[#1e142b] hover:border-[#7a66a0]">Careers</Link></li>
                        <li className="mb-3"><Link href="/privacy-policy" className="no-underline text-[#4e3f5c] font-[420] text-[0.95rem] transition-all border-b border-transparent pb-1 hover:text-[#1e142b] hover:border-[#7a66a0]">Privacy</Link></li>
                        <li className="mb-3"><Link href="/terms-of-service" className="no-underline text-[#4e3f5c] font-[420] text-[0.95rem] transition-all border-b border-transparent pb-1 hover:text-[#1e142b] hover:border-[#7a66a0]">Terms</Link></li>
                    </ul>
                </div>
            </div>
            <div className="text-center pt-11 mt-10 border-t border-[rgba(150,130,170,0.15)] text-[#51446a] text-[0.85rem] font-normal tracking-[0.02em]">
                <span>© {currentYear} SocialHub Inc. Enterprise Grade Social Management.</span>
                <span className="opacity-60 block mt-1">GDPR Compliant · AES-256 Security</span>
            </div>
        </footer>
    );
}
