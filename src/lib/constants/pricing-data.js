export const getPlans = (isAnnual) => [
    {
        name: "Free",
        id: "free",
        description: "Perfect for individuals just starting out.",
        price: 0,
        interval: "month",
        features: [
            "3 Social Accounts",
            "1 Team Member",
            "30 Monthly Posts",
            "Basic Analytics",
            "Standard-Quality Media",
        ],
        cta: "Start Now",
        popular: false,
        gradient: false,
    },
    {
        name: "Creator",
        id: "creator",
        description: "For influencers and serious content creators.",
        price: isAnnual ? 24 : 29,
        interval: isAnnual ? "month" : "month",
        features: [
            "10 Social Accounts",
            "1 Team Member",
            "Unlimited Monthly Posts",
            "Advanced Analytics",
            "High-Quality Media",
            "AI Caption Tools (50/mo)",
        ],
        cta: "Start Now",
        popular: true,
        gradient: true,
    },
    {
        name: "Pro",
        id: "pro",
        description: "For small teams and growing brands.",
        price: isAnnual ? 49 : 59,
        interval: isAnnual ? "month" : "month",
        features: [
            "25 Social Accounts",
            "3 Team Members",
            "Unlimited Monthly Posts",
            "Team Approval Workflow",
            "Compare Your Progress",
            "AI Caption Tools (Unlimited)",
            "Priority Support",
        ],
        cta: "Start Now",
        popular: false,
        gradient: false,
    },
    {
        name: "Agency",
        id: "agency",
        description: "For agencies managing multiple clients.",
        price: isAnnual ? 129 : 149,
        interval: isAnnual ? "month" : "month",
        features: [
            "50 Social Accounts",
            "10 Team Members",
            "Unlimited Monthly Posts",
            "Client Approval Systems",
            "Custom Branded Reports",
            "Dedicated Account Manager",
            "Priority Support",
        ],
        cta: "Get Started",
        popular: false,
        gradient: false,
    },
];

export const planFeatures = [
    {
        category: "Scheduling & Publishing",
        features: [
            { name: "Social Profiles", free: "3", creator: "10", pro: "25", agency: "50+" },
            { name: "Monthly Posts", free: "30", creator: "Unlimited", pro: "Unlimited", agency: "Unlimited" },
            { name: "Post Tailoring", free: true, creator: true, pro: true, agency: true },
            { name: "First Comment", free: false, creator: true, pro: true, agency: true },
            { name: "Best Time to Post", free: false, creator: true, pro: true, agency: true },
        ],
    },
    {
        category: "Team & Collaboration",
        features: [
            { name: "Team Members", free: "1", creator: "1", pro: "3", agency: "10" },
            { name: "Approval Workflows", free: false, creator: false, pro: true, agency: true },
            { name: "Client Systems", free: false, creator: false, pro: false, agency: true },
        ],
    },
    {
        category: "Analytics & Reporting",
        features: [
            { name: "Performance Insights", free: "Basic", creator: "Advanced", pro: "Advanced", agency: "Advanced" },
            { name: "Report History", free: "7 Days", creator: "30 Days", pro: "Unlimited", agency: "Unlimited" },
            { name: "Downloadable Reports", free: false, creator: true, pro: true, agency: true },
            { name: "Custom Branded Reports", free: false, creator: false, pro: false, agency: true },
        ],
    },
];

export const pricingFaqs = [
    {
        question: "Do you offer a free trial?",
        answer: "Yes, we offer a 14-day free trial for Creator and Pro plans. No credit card required to start.",
    },
    {
        question: "Can I change plans anytime?",
        answer: "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your billing settings.",
    },
    {
        question: "What happens if I hit my post limit?",
        answer: "On the Free plan, you won't be able to schedule more posts until the next month. Upgrading removes this limit instantly.",
    },
    {
        question: "Do you offer discounts for non-profits?",
        answer: "Yes! Contact our support team with your charitable documentation for a 20% discount.",
    },
];
