"use server";

import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

/**
 * Syncs Stripe customer data to Firestore
 * @param {string} userId - Internal User ID
 * @param {string} stripeCustomerId - Stripe Customer ID
 */
async function linkStripeCustomer(userId, stripeCustomerId) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        stripeCustomerId: stripeCustomerId,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Creates a Stripe Checkout Session
 * @param {string} priceId - Stripe Price ID
 * @param {string} successUrl - URL to redirect on success
 * @param {string} cancelUrl - URL to redirect on cancel
 */
export async function createCheckoutSession(priceId, successUrl, cancelUrl) {
    try {
        const user = await verifyToken();
        if (!user) throw new Error("Unauthorized");

        // 1. Get or Create Stripe Customer
        const userRef = doc(db, "users", user.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data() || {};

        let customerId = userData.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: user.id, // Critical for Webhook syncing
                },
            });
            customerId = customer.id;
            await linkStripeCustomer(user.id, customerId);
        }

        // 2. Create Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/portal/subscription?success=true`,
            cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/portal/subscription?canceled=true`,
            metadata: {
                userId: user.id,
            },
            subscription_data: {
                metadata: {
                    userId: user.id,
                },
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
        });

        return { success: true, url: session.url };
    } catch (error) {
        console.error("Error creating checkout session:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Creates a Customer Portal Session
 * @param {string} returnUrl - URL to return to after managing subscription
 */
export async function createPortalSession(returnUrl) {
    try {
        const user = await verifyToken();
        if (!user) throw new Error("Unauthorized");

        const userSnap = await getDoc(doc(db, "users", user.id));
        const customerId = userSnap.data()?.stripeCustomerId;

        if (!customerId) {
            throw new Error("No billing account found. Please subscribe first.");
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/portal/subscription`,
        });

        return { success: true, url: session.url };
    } catch (error) {
        console.error("Error creating portal session:", error);
        return { success: false, error: error.message };
    }
}
