import { Zap, BarChart3, Users, Lock, Globe, Smartphone } from "lucide-react";

const features = [
    {
        icon: <Zap className="h-6 w-6 text-warning" />,
        title: "Instant Publishing",
        description: "Post immediately to all platforms without delay."
    },
    {
        icon: <BarChart3 className="h-6 w-6 text-primary" />,
        title: "Detailed Reports",
        description: "Track your performance with comprehensive insights for every post."
    },
    {
        icon: <Users className="h-6 w-6 text-secondary" />,
        title: "Team Collaboration",
        description: "Invite your team and manage permissions easily."
    },
    {
        icon: <Lock className="h-6 w-6 text-success" />,
        title: "Secure and Reliable",
        description: "Secure login and activity tracking to keep your brand safe."
    },
    {
        icon: <Globe className="h-6 w-6 text-info" />,
        title: "Global Reach",
        description: "Auto-translate captions into 30+ languages."
    },
    {
        icon: <Smartphone className="h-6 w-6 text-purple-500" />,
        title: "Mobile App",
        description: "Manage everything on the go with our iOS & Android apps."
    }
];

export default function FeatureGrid() {
    return (
        <div className="py-24 bg-gray-50">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 font-display mb-4">
                        Everything you need to grow
                    </h2>
                    <p className="text-gray-600">
                        We built every feature requested by top social media managers.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="mb-4 bg-gray-50 w-12 h-12 rounded-lg flex items-center justify-center">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 font-display mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
