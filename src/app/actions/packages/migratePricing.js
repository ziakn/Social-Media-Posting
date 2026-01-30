"use server";

import { db } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";

/**
 * Migration function to import static pricing data into Firebase
 */
export async function migratePricingData() {
    const pricingPlans = [
        // FREE PLAN
        {
            name: "Free",
            description: "Perfect for individuals just starting out.",
            price: 0,
            currency: "USD",
            billingCycle: "monthly",
            ctaText: "Start Free",
            ctaLink: "/auth/register",
            isActive: true,
            order: 1,
            isPopular: false,
            features: [
                "3 Social Accounts",
                "1 Team Member",
                "30 Scheduled Posts / mo",
                "Basic Analytics",
                "Centralize Gallery (Video, images)"
            ],
            limits: {
                socialAccounts: 3,
                userSeats: 1,
                scheduledPosts: 30,
                aiCaptions: 0
            }
        },

        // CREATOR - MONTHLY
        {
            name: "Creator",
            description: "For influencers and serious content creators.",
            price: 29,
            currency: "USD",
            billingCycle: "monthly",
            ctaText: "Start 14-Day Trial",
            ctaLink: "/auth/register",
            isActive: true,
            order: 2,
            isPopular: true,
            features: [
                "10 Social Accounts",
                "1 Team Member",
                "Unlimited Scheduled Posts",
                "Basic Analytics",
                "Centralize Gallery (Video, images)",
                "Advanced Scheduling Calendar",
                "Automatic Failed Post Recovery & Rescheduling",
                "Invoices & Billing History",
                "AI Caption Generator (50/mo)"
            ],
            limits: {
                socialAccounts: 10,
                userSeats: 1,
                scheduledPosts: -1,
                aiCaptions: 50
            }
        },

        // CREATOR - YEARLY
        {
            name: "Creator",
            description: "For influencers and serious content creators.",
            price: 24,
            currency: "USD",
            billingCycle: "yearly",
            ctaText: "Start 14-Day Trial",
            ctaLink: "/auth/register",
            isActive: true,
            order: 3,
            isPopular: true,
            features: [
                "10 Social Accounts",
                "1 Team Member",
                "Unlimited Scheduled Posts",
                "Basic Analytics",
                "Centralize Gallery (Video, images)",
                "Advanced Scheduling Calendar",
                "Automatic Failed Post Recovery & Rescheduling",
                "Invoices & Billing History",
                "AI Caption Generator (50/mo)"
            ],
            limits: {
                socialAccounts: 10,
                userSeats: 1,
                scheduledPosts: -1,
                aiCaptions: 50
            }
        },

        // PRO - MONTHLY
        {
            name: "Pro",
            description: "For small teams and growing brands.",
            price: 59,
            currency: "USD",
            billingCycle: "monthly",
            ctaText: "Start 14-Day Trial",
            ctaLink: "/auth/register",
            isActive: true,
            order: 4,
            isPopular: false,
            features: [
                "25 Social Accounts",
                "3 Team Members",
                "Unlimited Scheduled Posts",
                "Advanced Analytics",
                "Centralize Gallery (Video, images)",
                "Advanced Scheduling Calendar",
                "Automatic Failed Post Recovery & Rescheduling",
                "Invoices & Billing History",
                "AI Caption Generator (Unlimited)",
                "Priority Email Support"
            ],
            limits: {
                socialAccounts: 25,
                userSeats: 3,
                scheduledPosts: -1,
                aiCaptions: -1
            }
        },

        // PRO - YEARLY
        {
            name: "Pro",
            description: "For small teams and growing brands.",
            price: 49,
            currency: "USD",
            billingCycle: "yearly",
            ctaText: "Start 14-Day Trial",
            ctaLink: "/auth/register",
            isActive: true,
            order: 5,
            isPopular: false,
            features: [
                "25 Social Accounts",
                "3 Team Members",
                "Unlimited Scheduled Posts",
                "Advanced Analytics",
                "Centralize Gallery (Video, images)",
                "Advanced Scheduling Calendar",
                "Automatic Failed Post Recovery & Rescheduling",
                "Invoices & Billing History",
                "AI Caption Generator (Unlimited)",
                "Priority Email Support"
            ],
            limits: {
                socialAccounts: 25,
                userSeats: 3,
                scheduledPosts: -1,
                aiCaptions: -1
            }
        },

        // AGENCY - MONTHLY
        {
            name: "Agency",
            description: "For agencies managing multiple clients.",
            price: 149,
            currency: "USD",
            billingCycle: "monthly",
            ctaText: "Contact Sales",
            ctaLink: "/contact",
            isActive: true,
            order: 6,
            isPopular: false,
            features: [
                "50 Social Accounts",
                "10 Team Members",
                "Unlimited Scheduled Posts",
                "Advanced Analytics",
                "Centralize Gallery (Video, images)",
                "Advanced Scheduling Calendar",
                "Automatic Failed Post Recovery & Rescheduling",
                "Invoices & Billing History",
                "SLA Support"
            ],
            limits: {
                socialAccounts: 50,
                userSeats: 10,
                scheduledPosts: -1,
                aiCaptions: -1
            }
        },

        // AGENCY - YEARLY
        {
            name: "Agency",
            description: "For agencies managing multiple clients.",
            price: 129,
            currency: "USD",
            billingCycle: "yearly",
            ctaText: "Contact Sales",
            ctaLink: "/contact",
            isActive: true,
            order: 7,
            isPopular: false,
            features: [
                "50 Social Accounts",
                "10 Team Members",
                "Unlimited Scheduled Posts",
                "Advanced Analytics",
                "Centralize Gallery (Video, images)",
                "Advanced Scheduling Calendar",
                "Automatic Failed Post Recovery & Rescheduling",
                "Invoices & Billing History",
                "SLA Support"
            ],
            limits: {
                socialAccounts: 50,
                userSeats: 10,
                scheduledPosts: -1,
                aiCaptions: -1
            }
        }
    ];

    try {
        const batch = writeBatch(db);
        const packagesRef = collection(db, "packages");

        pricingPlans.forEach((plan) => {
            const newDocRef = doc(packagesRef);
            batch.set(newDocRef, {
                ...plan,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        });

        await batch.commit();

        return {
            success: true,
            message: `Successfully migrated ${pricingPlans.length} pricing packages`,
            count: pricingPlans.length
        };
    } catch (error) {
        console.error("Migration error:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
