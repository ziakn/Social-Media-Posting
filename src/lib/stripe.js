import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: false,
});

/**
 * Creates a Stripe Customer
 */
export async function createStripeCustomer({ email, name, metadata }) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    return { success: true, customer };
  } catch (error) {
    console.error("Stripe createStripeCustomer error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Creates a Checkout Session
 */
export async function createCheckoutSession({ priceId, customerId, successUrl, cancelUrl, trialDays, metadata }) {
  try {
    const sessionParams = {
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      subscription_data: {
        metadata,
      },
    };

    if (trialDays > 0) {
      sessionParams.subscription_data.trial_period_days = trialDays;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return { success: true, session };
  } catch (error) {
    console.error("Stripe createCheckoutSession error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates a Subscription
 */
export async function updateStripeSubscription({ subscriptionId, newPriceId, prorate = true }) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: prorate ? 'always_invoice' : 'none',
    });
    return { success: true, subscription: updatedSubscription };
  } catch (error) {
    console.error("Stripe updateStripeSubscription error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancels a Subscription
 */
export async function cancelStripeSubscription({ subscriptionId, cancelAtPeriodEnd = true }) {
  try {
    let subscription;
    if (cancelAtPeriodEnd) {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    }
    return { success: true, subscription };
  } catch (error) {
    console.error("Stripe cancelStripeSubscription error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Reactivates a Subscription (un-cancels)
 */
export async function reactivateStripeSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return { success: true, subscription };
  } catch (error) {
    console.error("Stripe reactivateStripeSubscription error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Gets Invoices for a Customer
 */
export async function getStripeInvoices(customerId) {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });
    return { success: true, invoices: invoices.data };
  } catch (error) {
    console.error("Stripe getStripeInvoices error:", error);
    return { success: false, error: error.message };
  }
}
