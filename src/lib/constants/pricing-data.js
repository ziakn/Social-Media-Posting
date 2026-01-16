export const planFeatures = [
    { name: "Unified Content Gallery", starter: true, pro: true, enterprise: true },
    { name: "Social Platforms", starter: "5 Nodes", pro: "20 Nodes", enterprise: "Unlimited + Custom" },
    { name: "Daily Posts", starter: "25 Posts", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "AI Media Lab (Resizing)", starter: true, pro: true, enterprise: true },
    { name: "AI Caption Generation", starter: "Basic", pro: "Advanced", enterprise: "Custom Training" },
    { name: "Unified Inbox", starter: "Basic", pro: "Enterprise", enterprise: "Universal Hub" },
    { name: "Analytics Dashboard", starter: "Standard", pro: "Advanced", enterprise: "Real-time + Export" },
    { name: "Team Approvals", starter: false, pro: "3 Users", enterprise: "Unlimited" },
    { name: "Custom API Access", starter: false, pro: false, enterprise: true },
    { name: "Support", starter: "Community", pro: "Priority 24/7", enterprise: "Dedicated Manager" },
];

export const pricingFaqs = [
    {
        q: "How does the 14-day free trial work?",
        a: "Every Professional and Starter subscription begins with a 14-day zero-liability period. You can test all AI Lab features without restriction. No credit card is required to initiate the trial."
    },
    {
        q: "Can I upgrade or downgrade my plan?",
        a: "Yes, you can swap protocol tiers at any time from your dashboard. Upgrades are prorated immediately, while downgrades take effect at the end of the current billing cycle."
    },
    {
        q: "What payment methods are supported?",
        a: "We accept all major credit cards, Apple Pay, Google Pay, and Coinbase Commerce for crypto-native teams."
    },
    {
        q: "Do you offer enterprise-grade support?",
        a: "Absolutely. Our Enterprise tier includes a dedicated growth engineer, custom SLA guarantees, and priority node troubleshooting."
    }
];

export const getPlans = (isAnnual) => [
    {
        name: "Starter",
        id: "starter",
        description: "Best for solo creators and small teams.",
        price: isAnnual ? "19" : "24",
        features: ["5 Social Accounts", "25 Posts / Day", "AI Media Lab", "Standard Analytics"],
        cta: "Start Starter Plan",
        popular: false,
        priceId: isAnnual ? "price_starter_annual" : "price_starter_monthly"
    },
    {
        name: "Professional",
        id: "pro",
        description: "Comprehensive tools for high-growth brands.",
        price: isAnnual ? "49" : "59",
        features: ["20 Social Accounts", "Unlimited Posts", "Advanced AI Lab", "Unified Inbox", "ROI Tracking"],
        cta: "Start Professional Plan",
        popular: true,
        priceId: isAnnual ? "price_pro_annual" : "price_pro_monthly"
    },
    {
        name: "Enterprise",
        id: "enterprise",
        description: "For agencies or large teams",
        price: "Custom / $99+",
        features: ["Unlimited accounts", "Team Approvals", "Custom API Access", "White-label reports"],
        cta: "Contact Sales",
        popular: false
    }
];
