export const planFeatures = [
    { name: "Social Accounts", free: "2", pro: "10", enterprise: "Unlimited" },
    { name: "Platforms", free: "Limited (TikTok/IG)", pro: "All Platforms", enterprise: "All Platforms" },
    { name: "AI Tools", free: "Limited (30/mo)", pro: "Full Suite", enterprise: "Full Suite" },
    { name: "Unified Inbox", free: false, pro: true, enterprise: true },
    { name: "Analytics", free: "Basic", pro: "Full Suite", enterprise: "Full + White-label" },
    { name: "Post Scheduling", free: "Basic", pro: "Advanced", enterprise: "Bulk + Priority" },
    { name: "Multi-user / Teams", free: false, pro: false, enterprise: true },
    { name: "Media Storage", free: "Basic", pro: "10GB", enterprise: "Unlimited" },
    { name: "API & Webhooks", free: false, pro: false, enterprise: true },
    { name: "Support", free: "Help Center", pro: "Email", enterprise: "Dedicated Manager" },
    { name: "SLAs & Security", free: false, pro: false, enterprise: true },
];

export const pricingFaqs = [
    {
        q: "Is the free plan free forever?",
        a: "Yes, our Free/Starter plan is free forever. It's designed to help creators and small businesses get started with their social media journey without any upfront costs."
    },
    {
        q: "Can I upgrade anytime?",
        a: "Absolutely! You can upgrade to a higher tier at any time from your account settings. Upgrades are processed immediately so you can access new features right away."
    },
    {
        q: "Can I cancel anytime?",
        a: "Yes, we offer monthly flexibility. You can cancel your subscription at any time, and you'll continue to have access to your paid features until the end of your current billing period."
    },
    {
        q: "Do you offer refunds?",
        a: "We provide a 14-day money-back guarantee for all our paid plans. If you're not satisfied, just reach out to our support team."
    },
    {
        q: "What happens when my usage limits run out?",
        a: "If you hit your plan limits (like AI credits or account counts), you'll be prompted to upgrade or wait until your next billing cycle for credits to reset."
    }
];

export const getPlans = (isAnnual) => [
    {
        name: "Free / Starter",
        id: "free",
        description: "Perfect for creators testing the system.",
        price: "0",
        features: ["2 Social Accounts", "Basic Scheduling (TikTok/IG)", "30 AI Credits / mo", "Basic Media Uploads", "Community Support"],
        cta: "Start for Free",
        popular: false,
    },
    {
        name: "Professional",
        id: "pro",
        description: "Most popular for small businesses & solo marketers.",
        price: isAnnual ? "29" : "39",
        features: ["10 Social Accounts", "All Supported Platforms", "Full AI Suite (Unlimited)", "10GB Media Library", "Unified Inbox & Analytics", "Email Support"],
        cta: "Upgrade to Professional",
        popular: true,
        priceId: isAnnual ? "price_pro_annual" : "price_pro_monthly"
    },
    {
        name: "Agency / Enterprise",
        id: "enterprise",
        description: "For agencies and large scale marketing firms.",
        price: "99",
        features: ["Unlimited Accounts & Brands", "Team Roles & Approvals", "API & Webhooks", "White-label Reporting", "Dedicated Manager", "SLAs & Priority Support"],
        cta: "Contact Sales",
        popular: false
    }
];
