import { Zap, BarChart3, Users, Lock, Globe, Smartphone } from "lucide-react";

const features = [
    {
        icon: <Zap className="h-6 w-6" />,
        title: "Instant Publishing",
        description: "Post immediately to all platforms without delay.",
        color: "bg-[#5e4a7a]"
    },
    {
        icon: <BarChart3 className="h-6 w-6" />,
        title: "Detailed Reports",
        description: "Track your performance with comprehensive insights for every post.",
        color: "bg-[#6f5b8b]"
    },
    {
        icon: <Users className="h-6 w-6" />,
        title: "Team Collaboration",
        description: "Invite your team and manage permissions easily.",
        color: "bg-[#5e4a7a]"
    },
    {
        icon: <Lock className="h-6 w-6" />,
        title: "Secure and Reliable",
        description: "Secure login and activity tracking to keep your brand safe.",
        color: "bg-[#6f5b8b]"
    },
    {
        icon: <Globe className="h-6 w-6" />,
        title: "Global Reach",
        description: "Auto-translate captions into 30+ languages.",
        color: "bg-[#5e4a7a]"
    },
    {
        icon: <Smartphone className="h-6 w-6" />,
        title: "Mobile App",
        description: "Manage everything on the go with our iOS & Android apps.",
        color: "bg-[#6f5b8b]"
    }
];

export default function FeatureGrid() {
    return (
        <div className="py-24 relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-[#5e4a7a]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#5e4a7a]/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-[2.8rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[1.15] mb-4">
                        Everything you need to grow
                    </h2>
                    <p className="text-[#4a3d58] font-[420] text-lg">
                        We built every feature requested by top social media managers.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] p-8 rounded-[32px] border border-[rgba(255,255,255,0.6)] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`mb-4 ${feature.color} w-12 h-12 rounded-[16px] flex items-center justify-center text-white`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-[#2d253b] mb-2">{feature.title}</h3>
                            <p className="text-[#4a3d58] text-sm leading-relaxed font-[420]">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
