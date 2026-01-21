"use server";

import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    addDoc,
} from "firebase/firestore";
import {
    createStripeCustomer,
    createCheckoutSession,
    updateStripeSubscription,
    cancelStripeSubscription,
    reactivateStripeSubscription,
    getStripeInvoices,
} from "@/lib/stripe";

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId) {
    try {
        const subscriptionsRef = collection(db, "subscriptions");
        const q = query(
            subscriptionsRef,
            where("userId", "==", userId),
            where("status", "in", ["active", "trialing"]),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: true, subscription: null };
        }

        const subscription = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
            currentPeriodStart: snapshot.docs[0].data().currentPeriodStart?.toDate().toISOString(),
            currentPeriodEnd: snapshot.docs[0].data().currentPeriodEnd?.toDate().toISOString(),
            trialStart: snapshot.docs[0].data().trialStart?.toDate().toISOString() || null,
            trialEnd: snapshot.docs[0].data().trialEnd?.toDate().toISOString() || null,
            createdAt: snapshot.docs[0].data().createdAt?.toDate().toISOString(),
            updatedAt: snapshot.docs[0].data().updatedAt?.toDate().toISOString(),
        };

        return { success: true, subscription };
    } catch (error) {
        console.error("Error fetching subscription:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create Stripe checkout session for subscription
 */
export async function createSubscriptionCheckout({ userId, packageId, billingCycle }) {
    try {
        // Get user data
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
            return { success: false, error: "User not found" };
        }

        const user = userDoc.data();

        // Get package data
        const packagesRef = collection(db, "packages");
        const q = query(
            packagesRef,
            where("name", "==", packageId),
            where("billingCycle", "==", billingCycle),
            where("isActive", "==", true)
        );

        const packageSnapshot = await getDocs(q);
        if (packageSnapshot.empty) {
            return { success: false, error: "Package not found" };
        }

        const packageData = packageSnapshot.docs[0].data();

        // Create or get Stripe customer
        let stripeCustomerId = user.stripeCustomerId;

        if (!stripeCustomerId) {
            const customerResult = await createStripeCustomer({
                email: user.email,
                name: user.name || user.email,
                metadata: { userId }
            });

            if (!customerResult.success) {
                return { success: false, error: "Failed to create Stripe customer" };
            }

            stripeCustomerId = customerResult.customer.id;

            // Save customer ID to user
            await updateDoc(doc(db, "users", userId), {
                stripeCustomerId,
                updatedAt: serverTimestamp(),
            });
        }

        // Determine price ID based on package and billing cycle
        // You'll need to map your packages to Stripe price IDs
        const priceId = getPriceIdForPackage(packageData.name, billingCycle);

        if (!priceId) {
            return { success: false, error: "Price ID not configured for this package" };
        }

        // Create checkout session
        const sessionResult = await createCheckoutSession({
            priceId,
            customerId: stripeCustomerId,
            successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
            trialDays: packageData.price > 0 ? 14 : 0, // 14-day trial for paid plans
            metadata: {
                userId,
                packageId: packageSnapshot.docs[0].id,
                packageName: packageData.name,
                billingCycle,
            }
        });

        if (!sessionResult.success) {
            return { success: false, error: "Failed to create checkout session" };
        }

        return {
            success: true,
            sessionId: sessionResult.session.id,
            url: sessionResult.session.url,
        };
    } catch (error) {
        console.error("Error creating checkout session:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Helper function to map package names to Stripe price IDs
 * TODO: Move this to environment variables or database
 */
function getPriceIdForPackage(packageName, billingCycle) {
    const priceMap = {
        "Creator": {
            monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_CREATOR_MONTHLY,
            yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_CREATOR_YEARLY,
        },
        "Pro": {
            monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY,
            yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY,
        },
        "Agency": {
            monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_AGENCY_MONTHLY,
            yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_AGENCY_YEARLY,
        },
    };

    return priceMap[packageName]?.[billingCycle];
}

/**
 * Save subscription to database (called by webhook)
 */
export async function saveSubscription(subscriptionData) {
    try {
        const subscriptionRef = doc(db, "subscriptions", subscriptionData.id);

        await setDoc(subscriptionRef, {
            ...subscriptionData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Update user's subscription info
        await updateDoc(doc(db, "users", subscriptionData.userId), {
            subscription: {
                status: subscriptionData.status,
                packageId: subscriptionData.packageId,
                packageName: subscriptionData.packageName,
                stripeCustomerId: subscriptionData.stripeCustomerId,
                currentPeriodEnd: subscriptionData.currentPeriodEnd,
                limits: subscriptionData.limits,
            },
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error saving subscription:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update subscription (upgrade/downgrade)
 */
export async function updateSubscription({ userId, newPackageId, newBillingCycle, immediate = true }) {
    try {
        // Get current subscription
        const currentSub = await getUserSubscription(userId);
        if (!currentSub.success || !currentSub.subscription) {
            return { success: false, error: "No active subscription found" };
        }

        // Get new package
        const packagesRef = collection(db, "packages");
        const q = query(
            packagesRef,
            where("name", "==", newPackageId),
            where("billingCycle", "==", newBillingCycle),
            where("isActive", "==", true)
        );

        const packageSnapshot = await getDocs(q);
        if (packageSnapshot.empty) {
            return { success: false, error: "Package not found" };
        }

        const newPackage = packageSnapshot.docs[0].data();
        const newPriceId = getPriceIdForPackage(newPackage.name, newBillingCycle);

        if (!newPriceId) {
            return { success: false, error: "Price ID not configured" };
        }

        // Update Stripe subscription
        const updateResult = await updateStripeSubscription({
            subscriptionId: currentSub.subscription.stripeSubscriptionId,
            newPriceId,
            prorate: immediate,
        });

        if (!updateResult.success) {
            return { success: false, error: "Failed to update Stripe subscription" };
        }

        // Log subscription history
        await addDoc(collection(db, "subscription_history"), {
            userId,
            subscriptionId: currentSub.subscription.id,
            action: immediate ? "upgraded" : "downgraded",
            fromPackage: currentSub.subscription.packageName,
            toPackage: newPackage.name,
            details: {
                oldAmount: currentSub.subscription.amount,
                newAmount: newPackage.price,
            },
            createdAt: serverTimestamp(),
        });

        return { success: true, message: "Subscription updated successfully" };
    } catch (error) {
        console.error("Error updating subscription:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription({ userId, cancelAtPeriodEnd = true }) {
    try {
        const currentSub = await getUserSubscription(userId);
        if (!currentSub.success || !currentSub.subscription) {
            return { success: false, error: "No active subscription found" };
        }

        const cancelResult = await cancelStripeSubscription({
            subscriptionId: currentSub.subscription.stripeSubscriptionId,
            cancelAtPeriodEnd,
        });

        if (!cancelResult.success) {
            return { success: false, error: "Failed to cancel subscription" };
        }

        // Update database
        await updateDoc(doc(db, "subscriptions", currentSub.subscription.id), {
            cancelAtPeriodEnd,
            canceledAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Log history
        await addDoc(collection(db, "subscription_history"), {
            userId,
            subscriptionId: currentSub.subscription.id,
            action: "canceled",
            fromPackage: currentSub.subscription.packageName,
            toPackage: "Free",
            createdAt: serverTimestamp(),
        });

        return { success: true, message: "Subscription canceled successfully" };
    } catch (error) {
        console.error("Error canceling subscription:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(userId) {
    try {
        const currentSub = await getUserSubscription(userId);
        if (!currentSub.success || !currentSub.subscription) {
            return { success: false, error: "No subscription found" };
        }

        const reactivateResult = await reactivateStripeSubscription(
            currentSub.subscription.stripeSubscriptionId
        );

        if (!reactivateResult.success) {
            return { success: false, error: "Failed to reactivate subscription" };
        }

        // Update database
        await updateDoc(doc(db, "subscriptions", currentSub.subscription.id), {
            cancelAtPeriodEnd: false,
            canceledAt: null,
            updatedAt: serverTimestamp(),
        });

        // Log history
        await addDoc(collection(db, "subscription_history"), {
            userId,
            subscriptionId: currentSub.subscription.id,
            action: "reactivated",
            fromPackage: currentSub.subscription.packageName,
            toPackage: currentSub.subscription.packageName,
            createdAt: serverTimestamp(),
        });

        return { success: true, message: "Subscription reactivated successfully" };
    } catch (error) {
        console.error("Error reactivating subscription:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get billing history
 */
export async function getBillingHistory(userId) {
    try {
        // Get user's Stripe customer ID
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists() || !userDoc.data().stripeCustomerId) {
            return { success: true, invoices: [] };
        }

        const invoicesResult = await getStripeInvoices(userDoc.data().stripeCustomerId);

        if (!invoicesResult.success) {
            return { success: false, error: "Failed to fetch invoices" };
        }

        return { success: true, invoices: invoicesResult.invoices };
    } catch (error) {
        console.error("Error fetching billing history:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if user has reached a limit
 */
export async function checkSubscriptionLimit(userId, limitType) {
    try {
        const subscription = await getUserSubscription(userId);

        if (!subscription.success || !subscription.subscription) {
            // No subscription = Free plan limits
            const freeLimits = {
                socialAccounts: 3,
                userSeats: 1,
                scheduledPosts: 30,
                aiCaptions: 0,
            };
            return { success: true, limit: freeLimits[limitType] || 0 };
        }

        const limit = subscription.subscription.limits[limitType];
        return { success: true, limit: limit === -1 ? Infinity : limit };
    } catch (error) {
        console.error("Error checking limit:", error);
        return { success: false, error: error.message };
    }
}
