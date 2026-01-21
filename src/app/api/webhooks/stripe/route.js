import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Stripe Webhook Handler
 * Handles events from Stripe (subscription created, updated, deleted, invoices, etc.)
 */
export async function POST(req) {
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(event.data.object);
                break;

            case "customer.subscription.created":
                await handleSubscriptionCreated(event.data.object);
                break;

            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event.data.object);
                break;

            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object);
                break;

            case "invoice.paid":
                await handleInvoicePaid(event.data.object);
                break;

            case "invoice.payment_failed":
                await handleInvoicePaymentFailed(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
        console.error("Error handling webhook:", error);
        return new Response(`Webhook handler failed: ${error.message}`, { status: 500 });
    }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session) {
    const { customer, subscription, metadata } = session;
    const { userId, packageId, packageName, billingCycle } = metadata;

    console.log("Checkout completed for user:", userId);

    // The subscription will be handled by subscription.created event
    // Just log for now
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription) {
    const { id, customer, items, status, current_period_start, current_period_end, trial_start, trial_end, metadata } = subscription;

    // Get package info from metadata
    const { userId, packageId, packageName, billingCycle } = metadata;

    if (!userId) {
        console.error("No userId in subscription metadata");
        return;
    }

    // Get package details to save limits
    const packageDoc = await getDoc(doc(db, "packages", packageId));
    const packageData = packageDoc.exists() ? packageDoc.data() : {};

    // Save subscription to database
    await setDoc(doc(db, "subscriptions", id), {
        userId,
        packageId,
        packageName,
        stripeCustomerId: customer,
        stripeSubscriptionId: id,
        stripePriceId: items.data[0].price.id,
        status,
        billingCycle,
        amount: items.data[0].price.unit_amount / 100,
        currency: items.data[0].price.currency.toUpperCase(),
        currentPeriodStart: new Date(current_period_start * 1000),
        currentPeriodEnd: new Date(current_period_end * 1000),
        trialStart: trial_start ? new Date(trial_start * 1000) : null,
        trialEnd: trial_end ? new Date(trial_end * 1000) : null,
        canceledAt: null,
        cancelAtPeriodEnd: false,
        limits: packageData.limits || {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    // Update user document
    await updateDoc(doc(db, "users", userId), {
        subscription: {
            status,
            packageId,
            packageName,
            stripeCustomerId: customer,
            currentPeriodEnd: new Date(current_period_end * 1000),
            limits: packageData.limits || {},
        },
        updatedAt: serverTimestamp(),
    });

    console.log("Subscription created:", id);
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription) {
    const { id, customer, items, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at } = subscription;

    // Update subscription in database
    await updateDoc(doc(db, "subscriptions", id), {
        status,
        stripePriceId: items.data[0].price.id,
        amount: items.data[0].price.unit_amount / 100,
        currentPeriodStart: new Date(current_period_start * 1000),
        currentPeriodEnd: new Date(current_period_end * 1000),
        cancelAtPeriodEnd: cancel_at_period_end,
        canceledAt: canceled_at ? new Date(canceled_at * 1000) : null,
        updatedAt: serverTimestamp(),
    });

    console.log("Subscription updated:", id);
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription) {
    const { id, metadata } = subscription;
    const { userId } = metadata;

    // Update subscription status
    await updateDoc(doc(db, "subscriptions", id), {
        status: "canceled",
        updatedAt: serverTimestamp(),
    });

    // Update user to free plan
    if (userId) {
        await updateDoc(doc(db, "users", userId), {
            subscription: {
                status: "canceled",
                packageId: null,
                packageName: "Free",
                limits: {
                    socialAccounts: 3,
                    userSeats: 1,
                    scheduledPosts: 30,
                    aiCaptions: 0,
                },
            },
            updatedAt: serverTimestamp(),
        });
    }

    console.log("Subscription deleted:", id);
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(invoice) {
    const { id, customer, subscription, amount_paid, currency, hosted_invoice_url, billing_reason } = invoice;

    // Save invoice to billing history
    await setDoc(doc(db, "billing_history", id), {
        userId: invoice.metadata?.userId || null,
        subscriptionId: subscription,
        stripeInvoiceId: id,
        amount: amount_paid / 100,
        currency: currency.toUpperCase(),
        status: "paid",
        description: invoice.lines.data[0]?.description || "Subscription payment",
        billingReason,
        invoiceDate: new Date(invoice.created * 1000),
        paidAt: new Date(invoice.status_transitions.paid_at * 1000),
        invoicePdf: hosted_invoice_url,
        createdAt: serverTimestamp(),
    });

    console.log("Invoice paid:", id);
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice) {
    const { id, subscription, metadata } = invoice;
    const { userId } = metadata;

    // Update subscription status to past_due
    if (subscription) {
        await updateDoc(doc(db, "subscriptions", subscription), {
            status: "past_due",
            updatedAt: serverTimestamp(),
        });
    }

    // TODO: Send email notification to user about failed payment

    console.log("Invoice payment failed:", id);
}

// Helper to get document
import { getDoc } from "firebase/firestore";
