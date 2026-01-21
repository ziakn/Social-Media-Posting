import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

/**
 * Stripe utility functions for subscription management
 */

/**
 * Create a Stripe customer
 */
export async function createStripeCustomer({ email, name, metadata = {} }) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    return { success: true, customer };
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a Stripe subscription
 */
export async function createStripeSubscription({
  customerId,
  priceId,
  trialDays = 0,
  metadata = {}
}) {
  try {
    const subscriptionData = {
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    };

    if (trialDays > 0) {
      subscriptionData.trial_period_days = trialDays;
    }

    const subscription = await stripe.subscriptions.create(subscriptionData);
    return { success: true, subscription };
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a Stripe subscription (for upgrades/downgrades)
 */
export async function updateStripeSubscription({
  subscriptionId,
  newPriceId,
  prorate = true
}) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: prorate ? 'create_prorations' : 'none',
    });

    return { success: true, subscription: updated };
  } catch (error) {
    console.error('Error updating Stripe subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel a Stripe subscription
 */
export async function cancelStripeSubscription({
  subscriptionId,
  cancelAtPeriodEnd = true
}) {
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
    console.error('Error canceling Stripe subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateStripeSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return { success: true, subscription };
  } catch (error) {
    console.error('Error reactivating Stripe subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get customer invoices
 */
export async function getStripeInvoices(customerId, limit = 10) {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return { success: true, invoices: invoices.data };
  } catch (error) {
    console.error('Error fetching Stripe invoices:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a checkout session
 */
export async function createCheckoutSession({
  priceId,
  customerId,
  successUrl,
  cancelUrl,
  trialDays = 0,
  metadata = {}
}) {
  try {
    const sessionData = {
      customer: customerId,
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    };

    if (trialDays > 0) {
      sessionData.subscription_data = {
        trial_period_days: trialDays,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    return { success: true, session };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Retrieve a subscription
 */
export async function getStripeSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return { success: true, subscription };
  } catch (error) {
    console.error('Error retrieving Stripe subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Calculate proration for subscription change
 */
export async function calculateProration({
  subscriptionId,
  newPriceId
}) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const proration = await stripe.invoices.retrieveUpcoming({
      customer: subscription.customer,
      subscription: subscriptionId,
      subscription_items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
    });

    return {
      success: true,
      amount: proration.amount_due,
      currency: proration.currency,
    };
  } catch (error) {
    console.error('Error calculating proration:', error);
    return { success: false, error: error.message };
  }
}
