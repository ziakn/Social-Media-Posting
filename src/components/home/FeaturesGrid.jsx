
export default function FeaturesGrid() {
    return (
        <section className="w-full my-16 md:my-12">
            <div className="text-center text-[1.9rem] font-[620] tracking-[-0.02em] text-[#282230] mb-10 bg-[rgba(255,255,255,0.3)] py-2 px-8 inline-block rounded-[50px] backdrop-blur-[4px] border border-[rgba(255,255,255,0.6)] flex items-center justify-center mx-auto w-fit">
                <i className="fas fa-square mr-2.5 opacity-50"></i> one workspace, complete control
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-[rgba(255,255,255,0.5)] backdrop-blur-[8px] rounded-[32px] p-9 border border-[rgba(255,255,255,0.6)] transition-[0.15s] text-left hover:bg-[rgba(255,255,255,0.65)] hover:border-[rgba(200,185,230,0.5)]">
                    <div className="text-[2rem] text-[#5b4a70] mb-6 bg-[rgba(235,225,255,0.5)] w-[68px] h-[68px] flex items-center justify-center rounded-[22px] border border-[rgba(255,255,255,0.5)]">
                        <i className="fas fa-inbox"></i>
                    </div>
                    <h3 className="text-[1.5rem] font-[620] mb-3 text-[#2a2335] tracking-[-0.02em]">Unified inbox</h3>
                    <p className="text-[1rem] text-[#464054] leading-[1.6] font-[380]">Respond to comments, DMs, and mentions across all platforms. No more tab switching.</p>
                </div>
                <div className="bg-[rgba(255,255,255,0.5)] backdrop-blur-[8px] rounded-[32px] p-9 border border-[rgba(255,255,255,0.6)] transition-[0.15s] text-left hover:bg-[rgba(255,255,255,0.65)] hover:border-[rgba(200,185,230,0.5)]">
                    <div className="text-[2rem] text-[#5b4a70] mb-6 bg-[rgba(235,225,255,0.5)] w-[68px] h-[68px] flex items-center justify-center rounded-[22px] border border-[rgba(255,255,255,0.5)]">
                        <i className="fas fa-calendar-alt"></i>
                    </div>
                    <h3 className="text-[1.5rem] font-[620] mb-3 text-[#2a2335] tracking-[-0.02em]">Cross-posting</h3>
                    <p className="text-[1rem] text-[#464054] leading-[1.6] font-[380]">Schedule once, publish everywhere. Intelligent format adaptation per network.</p>
                </div>
                <div className="bg-[rgba(255,255,255,0.5)] backdrop-blur-[8px] rounded-[32px] p-9 border border-[rgba(255,255,255,0.6)] transition-[0.15s] text-left hover:bg-[rgba(255,255,255,0.65)] hover:border-[rgba(200,185,230,0.5)]">
                    <div className="text-[2rem] text-[#5b4a70] mb-6 bg-[rgba(235,225,255,0.5)] w-[68px] h-[68px] flex items-center justify-center rounded-[22px] border border-[rgba(255,255,255,0.5)]">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <h3 className="text-[1.5rem] font-[620] mb-3 text-[#2a2335] tracking-[-0.02em]">Unified analytics</h3>
                    <p className="text-[1rem] text-[#464054] leading-[1.6] font-[380]">Consolidated performance metrics. Track growth, engagement, and ROI across channels.</p>
                </div>
                <div className="bg-[rgba(255,255,255,0.5)] backdrop-blur-[8px] rounded-[32px] p-9 border border-[rgba(255,255,255,0.6)] transition-[0.15s] text-left hover:bg-[rgba(255,255,255,0.65)] hover:border-[rgba(200,185,230,0.5)]">
                    <div className="text-[2rem] text-[#5b4a70] mb-6 bg-[rgba(235,225,255,0.5)] w-[68px] h-[68px] flex items-center justify-center rounded-[22px] border border-[rgba(255,255,255,0.5)]">
                        <i className="fas fa-users"></i>
                    </div>
                    <h3 className="text-[1.5rem] font-[620] mb-3 text-[#2a2335] tracking-[-0.02em]">Team collaboration</h3>
                    <p className="text-[1rem] text-[#464054] leading-[1.6] font-[380]">Approval workflows, content calendars, and role-based permissions — enterprise ready.</p>
                </div>
            </div>
        </section>
    );
}
