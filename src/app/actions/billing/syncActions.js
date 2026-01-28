"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase";
import { doc, updateDoc, setDoc, getDoc, collection, serverTimestamp } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

/**
 * Manually syncs Stripe subscription data for a user to Firestore.
 * Useful as a fallback if webhooks are delayed or local listener is down.
 */
export async function syncSubscription() {
    try {
        const user = await verifyToken();
        if (!user) throw new Error("Unauthorized");

        const userRef = doc(db, "users", user.id);
        const profileRef = doc(db, "billing_profiles", user.id);

        // 1. Get Customer ID from Firestore
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const customerId = userData?.stripeCustomerId;

        if (!customerId) {
            return { success: false, error: "No linked Stripe customer found." };
        }

        // 2. Fetch Active Subscriptions from Stripe
        // Optimized: Reduced expansion depth to avoid API errors
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
            expand: ['data.items.data.price'],
            limit: 1
        });

        if (subscriptions.data.length === 0) {
            return { success: true, message: "No active subscriptions found on Stripe." };
        }

        // 3. Update Firestore with latest subscription data
        const sub = subscriptions.data[0];
        const status = sub.status;
        const price = sub.items.data[0].price;
        // When not expanding 'product', it is a string ID
        const productId = typeof price.product === 'string' ? price.product : price.product.id;

        const updateData = {
            "subscription.status": status,
            "subscription.stripeSubscriptionId": sub.id,
            "subscription.stripePriceId": price.id,
            "subscription.stripeProductId": productId,
            "subscription.periodEnd": new Date(sub.current_period_end * 1000),
            updatedAt: serverTimestamp()
        };

        // Update User Doc
        await updateDoc(userRef, updateData);

        // Update Billing Profile 
        // Logic: Map Price ID from Env to Package Name
        let packageName = "Pro Protocol"; // Default fallback
        let billingCycle = price.recurring?.interval === 'year' ? 'yearly' : 'monthly';

        // Check against environment variables
        const currentPriceId = price.id;

        // Helper map 
        const priceMap = {
            [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER]: "Starter Protocol",
            [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO]: "Pro Protocol",

            [process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY]: "Creator Protocol",
            [process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY]: "Creator Protocol",
            [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY]: "Pro Protocol",
            [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY]: "Pro Protocol",
            [process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY]: "Agency Protocol",
            [process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_YEARLY]: "Agency Protocol"
        };

        if (priceMap[currentPriceId]) {
            packageName = priceMap[currentPriceId];
        }

        await setDoc(profileRef, {
            userId: user.id,
            status: status,
            packageName: packageName,
            amount: price.unit_amount / 100,
            billingCycle: billingCycle,
            nextBillingDate: new Date(sub.current_period_end * 1000),
            stripeSubscriptionId: sub.id,
            updatedAt: serverTimestamp()
        }, { merge: true });

        // 4. Sync Invoices (Industry Best Practice: Reconcile Ledger)
        // Fetch up to 10 latest invoices to ensure history is up to date
        const invoices = await stripe.invoices.list({
            customer: customerId,
            limit: 10
        });

        const invoiceBatchPromises = invoices.data.map(async (invoice) => {
            const invoiceRef = doc(db, "invoices", invoice.id);
            const amount = invoice.amount_paid / 100;
            const currency = invoice.currency.toUpperCase();

            return setDoc(invoiceRef, {
                invoiceId: invoice.number || invoice.id,
                userId: user.id,
                stripeCustomerId: invoice.customer,
                amount: amount,
                currency: currency,
                status: invoice.status, // paid, open, void, uncollectible
                pdfUrl: invoice.hosted_invoice_url,
                billingReason: invoice.billing_reason,
                createdAt: new Date(invoice.created * 1000),
                updatedAt: serverTimestamp(),
                subscriptionId: invoice.subscription,
                periodStart: new Date(invoice.period_start * 1000),
                periodEnd: new Date(invoice.period_end * 1000),
            }, { merge: true });
        });

        await Promise.all(invoiceBatchPromises);

        return { success: true, status };
    } catch (error) {
        console.error("Manual sync failed:", error);
        return { success: false, error: error.message };
    }
}
