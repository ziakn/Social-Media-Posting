export const getPlans = (isAnnual) => [
    {
        name: "Free",
        id: "free",
        description: "Perfect for individuals just starting out.",
        price: 0,
        interval: "month",
        features: [
            "3 Social Accounts",
            "1 User Seat",
            "30 Scheduled Posts / mo",
            "Basic Analytics",
            "720p Image Uploads",
        ],
        cta: "Start Free",
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
            "1 User Seat",
            "Unlimited Scheduled Posts",
            "Advanced Analytics",
            "1080p Image & Video",
            "AI Caption Generator (50/mo)",
        ],
        cta: "Start 14-Day Trial",
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
            "3 User Seats",
            "Unlimited Scheduled Posts",
            "Team Approval Workflow",
            "Competitor Analysis",
            "AI Caption Generator (Unlimited)",
            "Priority Email Support",
        ],
        cta: "Start 14-Day Trial",
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
            "10 User Seats",
            "Unlimited Scheduled Posts",
            "Client Approval Portals",
            "White-label Reports",
            "Dedicated Account Manager",
            "SLA Support",
        ],
        cta: "Contact Sales",
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
            { name: "User Seats", free: "1", creator: "1", pro: "3", agency: "10" },
            { name: "Approval Workflows", free: false, creator: false, pro: true, agency: true },
            { name: "Client Portal", free: false, creator: false, pro: false, agency: true },
        ],
    },
    {
        category: "Analytics & Reporting",
        features: [
            { name: "Engagement Metrics", free: "Basic", creator: "Advanced", pro: "Advanced", agency: "Advanced" },
            { name: "Report History", free: "7 Days", creator: "30 Days", pro: "Unlimited", agency: "Unlimited" },
            { name: "PDF Exports", free: false, creator: true, pro: true, agency: true },
            { name: "White-label Reports", free: false, creator: false, pro: false, agency: true },
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
        answer: "Yes! Contact our support team with proof of your non-profit status for a 20% discount.",
    },
];
