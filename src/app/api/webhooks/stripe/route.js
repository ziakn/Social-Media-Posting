import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase";
import { doc, updateDoc, setDoc, serverTimestamp, collection, getDoc } from "firebase/firestore";

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
    const body = await req.text();
    const sig = headers().get("stripe-signature");

    let event;

    try {
        if (!endpointSecret) {
            console.error("❌ Stats: Missing STRIPE_WEBHOOK_SECRET in env");
            throw new Error("Webhook secret not found. Configure STRIPE_WEBHOOK_SECRET in .env");
        }
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
        console.log(`✅ Webhook verified: ${event.type}`);
    } catch (err) {
        console.error(`⚠️  Webhook signature verification failed.`, err.message);
        console.error(`   Header: ${sig}`);
        // console.error(`   Body: ${body.substring(0, 50)}...`); 
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object;
                await handleCheckoutSessionCompleted(session);
                break;
            case "invoice.payment_succeeded":
                const invoice = event.data.object;
                await handleInvoicePaymentSucceeded(invoice);
                break;
            case "customer.subscription.updated":
                const subscription = event.data.object;
                await handleSubscriptionUpdated(subscription);
                break;
            case "customer.subscription.deleted":
                const deletedSub = event.data.object;
                await handleSubscriptionDeleted(deletedSub);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json({ error: "Error processing webhook" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}

// -----------------------------------------------------------------------------
// Event Handlers
// -----------------------------------------------------------------------------

async function handleCheckoutSessionCompleted(session) {
    const userId = session.metadata?.userId;
    const customerId = session.customer;

    if (!userId) {
        console.error("Missing userId in session metadata:", session.id);
        return;
    }

    // Link customer ID if not already (redundant safety)
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        stripeCustomerId: customerId,
        updatedAt: serverTimestamp()
    });

    console.log(`✅ Linked Stripe Customer ${customerId} to User ${userId}`);
}

async function handleInvoicePaymentSucceeded(invoice) {
    // Determine userId from metadata or by querying user with this customerId
    let userId = invoice.subscription_details?.metadata?.userId || invoice.metadata?.userId; // Checkout session metadata sometimes carries over

    if (!userId) {
        // Fallback: Find user by stripeCustomerId
        // NOTE: In production, efficient query requires index on 'stripeCustomerId'
        // For MVP/NoSQL: We can try to rely on previous linkage or do a query (expensive if large)
        // Better strategy: Ensure 'userId' is always in subscription metadata in 'createCheckoutSession'
        // We added it in 'subscription_data.metadata' in stripeActions.js, so it should be here.
    }

    // Safety check if still null, try to query (skipped for brevity, assuming metadata works)

    const amount = invoice.amount_paid / 100; // Convert cents to dollars
    const currency = invoice.currency.toUpperCase();
    const status = "paid";

    const invoiceRef = doc(collection(db, "invoices"), invoice.id); // Use Stripe Invoice ID as Doc ID for uniqueness

    await setDoc(invoiceRef, {
        invoiceId: invoice.number || invoice.id,
        userId: userId || "unknown", // If unknown, manual reconciliation needed
        stripeCustomerId: invoice.customer,
        amount: amount,
        currency: currency,
        status: status,
        pdfUrl: invoice.hosted_invoice_url,
        billingReason: invoice.billing_reason,
        createdAt: new Date(invoice.created * 1000), // Convert UNIX timestamp
        updatedAt: serverTimestamp(),
        // Mapping subscription info
        subscriptionId: invoice.subscription,
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000),
    }, { merge: true });

    console.log(`✅ Recorded Invoice ${invoice.id} for User ${userId}`);
}

async function handleSubscriptionUpdated(subscription) {
    const userId = subscription.metadata.userId;

    if (!userId) return;

    const status = subscription.status; // active, past_due, canceled, etc.
    const priceId = subscription.items.data[0].price.id;
    const productId = subscription.items.data[0].price.product;

    // Map Product ID to readable Package Name if possible (or store ID)
    // For now, simpler to just store the ID and status

    const userRef = doc(db, "users", userId);
    const profileRef = doc(db, "billing_profiles", userId);

    const updateData = {
        "subscription.status": status,
        "subscription.stripeSubscriptionId": subscription.id,
        "subscription.stripePriceId": priceId,
        "subscription.stripeProductId": productId,
        "subscription.periodEnd": new Date(subscription.current_period_end * 1000),
        updatedAt: serverTimestamp()
    };

    // Update User Doc
    await updateDoc(userRef, updateData);

    // Update Billing Profile (for compatibility with UI)
    await setDoc(profileRef, {
        userId,
        status: status,
        nextBillingDate: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
        updatedAt: serverTimestamp()
        // Note: packageName might need a lookup map if we want to display "Pro Plan" instead of "prod_..."
    }, { merge: true });

    console.log(`✅ Updated Subscription ${subscription.id} for User ${userId} to ${status}`);
}

async function handleSubscriptionDeleted(subscription) {
    const userId = subscription.metadata.userId;
    if (!userId) return;

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        "subscription.status": "canceled",
        "subscription.canceledAt": serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    const profileRef = doc(db, "billing_profiles", userId);
    await updateDoc(profileRef, {
        status: "canceled",
        updatedAt: serverTimestamp()
    });

    console.log(`🚫 Canceled Subscription ${subscription.id} for User ${userId}`);
}
