"use server";

import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    updateDoc,
    increment,
    runTransaction
} from "firebase/firestore";

/**
 * Initialize a billing profile for a new user
 */
export async function initializeBillingProfile(userId, packageData, billingCycle) {
    try {
        const billingProfileRef = doc(db, "billing_profiles", userId);

        const nextBillingDate = new Date();
        if (billingCycle === "monthly") {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        } else {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }

        const billingProfile = {
            userId,
            packageId: packageData.id,
            packageName: packageData.name,
            billingCycle,
            amount: packageData.price || 0,
            currency: packageData.currency || "USD",
            status: packageData.price > 0 ? "past_due" : "active", // Past due for paid until first payment
            nextBillingDate: nextBillingDate,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            billingAddress: null,
            taxId: null
        };

        await setDoc(billingProfileRef, billingProfile);

        // Generate initial invoice if it's a paid plan
        if (packageData.price > 0) {
            await generateInvoice(userId, billingProfile, true);
        }

        return { success: true };
    } catch (error) {
        console.error("Error initializing billing profile:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate a new invoice
 */
export async function generateInvoice(userId, billingProfile, isInitial = false) {
    try {
        const invoiceRef = doc(collection(db, "invoices"));
        const timestamp = new Date();
        const year = timestamp.getFullYear();

        // Simple friendly ID generation (in a real app, use a tracker/sequence)
        const friendlyId = `INV-${year}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const billingPeriodStart = new Date();
        const billingPeriodEnd = new Date(billingProfile.nextBillingDate);
        const dueDate = isInitial ? new Date() : new Date(billingPeriodStart.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days grace

        // Fetch user data for invoice records
        const userSnap = await getDoc(doc(db, "users", userId));
        const userData = userSnap.exists() ? userSnap.data() : {};

        const invoiceData = {
            invoiceId: friendlyId,
            userId,
            userName: userData.name || "Subscriber",
            userEmail: userData.email || "",
            userCountry: userData.country || "",
            amount: billingProfile.amount,
            currency: billingProfile.currency,
            status: "unpaid",
            billingPeriodStart,
            billingPeriodEnd,
            dueDate,
            lineItems: [
                {
                    description: `${billingProfile.packageName} Plan - ${billingProfile.billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Subscription`,
                    amount: billingProfile.amount,
                    quantity: 1
                }
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(invoiceRef, { ...invoiceData, id: invoiceRef.id });

        return { success: true, invoice: { ...invoiceData, id: invoiceRef.id } };
    } catch (error) {
        console.error("Error generating invoice:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Record a payment and update invoice status
 */
export async function recordPayment(invoiceId, paymentData) {
    try {
        await runTransaction(db, async (transaction) => {
            const invoiceRef = doc(db, "invoices", invoiceId);
            const invoiceSnap = await transaction.get(invoiceRef);

            if (!invoiceSnap.exists()) {
                throw new Error("Invoice not found");
            }

            const invoice = invoiceSnap.data();
            const userId = invoice.userId;

            // 1. Create payment record
            const paymentRef = doc(collection(db, "payments"));
            const paymentRecord = {
                paymentId: paymentRef.id,
                invoiceId,
                userId,
                amount: invoice.amount,
                method: paymentData.method || "stripe",
                confirmationId: paymentData.confirmationId,
                status: "succeeded",
                createdAt: serverTimestamp(),
            };
            transaction.set(paymentRef, paymentRecord);

            // 2. Update invoice status
            transaction.update(invoiceRef, {
                status: "paid",
                paymentReference: paymentData.confirmationId,
                updatedAt: serverTimestamp(),
            });

            // 3. Update billing profile status
            const profileRef = doc(db, "billing_profiles", userId);
            transaction.update(profileRef, {
                status: "active",
                updatedAt: serverTimestamp(),
            });

            // 4. Update user's subscription status in user doc
            const userRef = doc(db, "users", userId);
            transaction.update(userRef, {
                "subscription.status": "active",
                updatedAt: serverTimestamp(),
            });
        });

        return { success: true };
    } catch (error) {
        console.error("Error recording payment:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get billing history for a user
 */
export async function getBillingHistory(userId) {
    try {
        const invoicesRef = collection(db, "invoices");
        const q = query(
            invoicesRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const invoices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate().toISOString() : doc.data().updatedAt,
            dueDate: doc.data().dueDate?.toDate ? doc.data().dueDate.toDate().toISOString() : doc.data().dueDate,
            billingPeriodStart: doc.data().billingPeriodStart?.toDate ? doc.data().billingPeriodStart.toDate().toISOString() : doc.data().billingPeriodStart,
            billingPeriodEnd: doc.data().billingPeriodEnd?.toDate ? doc.data().billingPeriodEnd.toDate().toISOString() : doc.data().billingPeriodEnd,
        }));

        return { success: true, invoices };
    } catch (error) {
        console.error("Error fetching billing history:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get billing profile for a user
 */
export async function getBillingProfile(userId) {
    try {
        const profileRef = doc(db, "billing_profiles", userId);
        const snap = await getDoc(profileRef);

        if (!snap.exists()) {
            return { success: true, profile: null };
        }

        const data = snap.data();
        return {
            success: true,
            profile: {
                ...data,
                nextBillingDate: data.nextBillingDate?.toDate ? data.nextBillingDate.toDate().toISOString() : data.nextBillingDate,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            }
        };
    } catch (error) {
        console.error("Error fetching billing profile:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all invoices for admin analytics
 */
export async function getAllInvoices() {
    try {
        const invoicesRef = collection(db, "invoices");
        const q = query(invoicesRef, orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);

        return {
            success: true,
            invoices: snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt,
                updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate().toISOString() : doc.data().updatedAt,
            }))
        };
    } catch (error) {
        console.error("Error fetching all invoices:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update a billing subscription (Upgrade/Downgrade)
 */
export async function updateBillingSubscription(userId, newPackageData, newBillingCycle) {
    try {
        const profileRef = doc(db, "billing_profiles", userId);

        const nextBillingDate = new Date();
        if (newBillingCycle === "monthly") {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        } else {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }

        await updateDoc(profileRef, {
            packageId: newPackageData.id,
            packageName: newPackageData.name,
            billingCycle: newBillingCycle,
            amount: newPackageData.price,
            nextBillingDate,
            updatedAt: serverTimestamp(),
            status: "active" // Reset status to active if they just upgraded/downgraded
        });

        // Trigger a fresh invoice for the new plan
        const profileSnap = await getDoc(profileRef);
        await generateInvoice(userId, profileSnap.data(), true);

        // Also update standard subscription fields in user doc
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            "subscription.packageName": newPackageData.name,
            "subscription.packageId": newPackageData.id,
            "subscription.status": "active",
            "subscription.limits": newPackageData.limits || {}
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating billing subscription:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Cancel a billing subscription
 */
export async function cancelBillingSubscription(userId) {
    try {
        const profileRef = doc(db, "billing_profiles", userId);
        await updateDoc(profileRef, {
            status: "canceled",
            updatedAt: serverTimestamp(),
        });

        // Also update user doc
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            "subscription.status": "canceled",
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error canceling billing subscription:", error);
        return { success: false, error: error.message };
    }
}
