import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe("sk_test_51Su54tJtCKrjTjWiIN4wVuzAdxu2EeLiFlIA723OqR0F6nJ2VoDyl1nJtc8EZX3gXV9ugBlaZ2jqWMDBBWGMGZ0N00aGNzKtzj");

// Hardcoded for script run
const NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY = "price_1Su84XJtCKrjTjWiurOthpFw";
const NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY = "price_1Su86qJtCKrjTjWiu4DdefgG";
const NEXT_PUBLIC_STRIPE_PRICE_AGENCY_YEARLY = "price_1Su8BuJtCKrjTjWiEGQ8fPXV";

async function checkPrices() {
    const pricesToCheck = [
        { id: NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY, name: 'Creator Yearly' },
        { id: NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY, name: 'Pro Yearly' },
        { id: NEXT_PUBLIC_STRIPE_PRICE_AGENCY_YEARLY, name: 'Agency Yearly' }
    ];

    console.log("Checking Stripe Prices:");
    for (const p of pricesToCheck) {
        try {
            const price = await stripe.prices.retrieve(p.id);
            console.log(`${p.name}: $${price.unit_amount / 100} / ${price.recurring.interval}`);
        } catch (e) {
            console.log(`${p.name}: Error - ${e.message}`);
        }
    }
}

checkPrices();
