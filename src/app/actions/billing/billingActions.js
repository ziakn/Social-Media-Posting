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
    runTransaction,
    limit,
    startAfter
} from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

/**
 * Initialize a billing profile for a new user
 */
export async function initializeBillingProfile(userId, packageData, billingCycle) {
    try {
        const user = await verifyToken();
        if (!user) return { success: false, error: "Unauthorized" };
        if (userId !== user.id && user.role !== 'Administrator') return { success: false, error: "Access Denied" };

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
export async function generateInvoice(userId, billingProfile, isInitial = false, prorationData = null) {
    try {
        const user = await verifyToken();
        if (!user) return { success: false, error: "Unauthorized" };
        if (userId !== user.id && user.role !== 'Administrator') return { success: false, error: "Access Denied" };

        const invoiceRef = doc(collection(db, "invoices"));
        const timestamp = new Date();
        const year = timestamp.getFullYear();
        const month = String(timestamp.getMonth() + 1).padStart(2, '0');

        const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
        const friendlyId = `INV-${year}${month}-${randomPart}`;

        const billingPeriodStart = new Date();
        const billingPeriodEnd = new Date(billingProfile.nextBillingDate);
        const dueDate = isInitial ? new Date() : new Date(billingPeriodStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        const userSnap = await getDoc(doc(db, "users", userId));
        const userData = userSnap.exists() ? userSnap.data() : {};

        const lineItems = [
            {
                description: `${billingProfile.packageName} Plan - ${billingProfile.billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Subscription`,
                amount: billingProfile.amount,
                quantity: 1
            }
        ];

        // Add proration credits if they exist
        if (prorationData && prorationData.creditAmount > 0) {
            lineItems.push({
                description: `Prorated Credit: Unused time on ${prorationData.oldPackageName}`,
                amount: -prorationData.creditAmount,
                quantity: 1
            });
        }

        const totalAmount = lineItems.reduce((acc, item) => acc + (item.amount * item.quantity), 0);

        const invoiceData = {
            invoiceId: friendlyId,
            userId,
            userName: userData.name || "Subscriber",
            userEmail: userData.email || "",
            userCountry: userData.country || "",
            amount: Math.max(0, totalAmount), // Don't let total go negative
            currency: billingProfile.currency,
            status: totalAmount <= 0 ? "paid" : "unpaid",
            billingPeriodStart,
            billingPeriodEnd,
            dueDate,
            billingCycle: billingProfile.billingCycle,
            lineItems,
            sellerInfo: {
                company: "Social Media Posting Platform",
                address: "Global HQ, Tech District",
                taxId: "TAX-123456789-GLOBAL",
                vatId: "VAT-987654321"
            },
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

            // 1. Create payment record (Detailed Audit Trail)
            const paymentRef = doc(collection(db, "payments"));
            const paymentRecord = {
                paymentId: paymentRef.id,
                invoiceId,
                invoiceFriendlyId: invoice.invoiceId,
                userId,
                amount: invoice.amount,
                currency: invoice.currency,
                method: paymentData.method || "card",
                paymentProvider: paymentData.provider || "Stripe",
                transactionId: paymentData.confirmationId,
                receiptNumber: `REC-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
                status: "succeeded",
                auditMetadata: {
                    ipAddress: paymentData.ipAddress || null,
                    userAgent: paymentData.userAgent || null,
                },
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
 * Get billing profile for a user
 */
export async function getBillingProfile(userId = null) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const targetId = userId || user.id;
        if (targetId !== user.id && user.role !== 'Administrator') {
            return { success: false, error: "Access Denied" };
        }

        const profileRef = doc(db, "billing_profiles", targetId);
        const snap = await getDoc(profileRef);

        if (!snap.exists()) {
            return { success: true, profile: null };
        }

        const data = snap.data();
        return {
            success: true,
            profile: {
                ...data,
                nextBillingDate: data.nextBillingDate?.toDate ? data.nextBillingDate.toDate().toISOString() : (data.nextBillingDate instanceof Date ? data.nextBillingDate.toISOString() : data.nextBillingDate),
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt),
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
export async function getAllInvoices(userId = null) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const invoicesRef = collection(db, "invoices");
        let q;

        // Strict role check: Only 'Administrator'
        const isAdmin = user.role === 'Administrator';
        const finalUserId = isAdmin ? userId : user.id;

        if (finalUserId) {
            q = query(invoicesRef, where("userId", "==", finalUserId), orderBy("createdAt", "asc"));
        } else if (!isAdmin) {
            // Standard users (including simple 'Admin') MUST have a userId filter
            q = query(invoicesRef, where("userId", "==", user.id), orderBy("createdAt", "asc"));
        } else {
            // Only 'Administrator' get here without a userId
            q = query(invoicesRef, orderBy("createdAt", "asc"));
        }

        const snapshot = await getDocs(q);

        return {
            success: true,
            invoices: snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt),
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt),
                    periodStart: data.periodStart?.toDate ? data.periodStart.toDate().toISOString() : (data.periodStart instanceof Date ? data.periodStart.toISOString() : data.periodStart),
                    periodEnd: data.periodEnd?.toDate ? data.periodEnd.toDate().toISOString() : (data.periodEnd instanceof Date ? data.periodEnd.toISOString() : data.periodEnd),
                };
            })
        };
    } catch (error) {
        console.error("Error fetching all invoices:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get paginated invoices with role-based access control and search
 * Administrators see all invoices, Users see only their own
 */
export async function getPaginatedInvoices(pageSize = 10, cursor = null, searchQuery = "") {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const invoicesRef = collection(db, "invoices");
        let constraints = [];

        const isSearching = searchQuery && searchQuery.trim().length > 0;
        const normalizedQuery = isSearching ? searchQuery.trim().toUpperCase() : "";

        if (isSearching) {
            // Search by Invoice ID (Prefix)
            constraints.push(where("invoiceId", ">=", normalizedQuery));
            constraints.push(where("invoiceId", "<=", normalizedQuery + "\uf8ff"));
            constraints.push(orderBy("invoiceId", "asc")); // Firestore requires orderBy to match range filter
        } else {
            // Default: newest first
            constraints.push(orderBy("createdAt", "desc"));
        }

        // Apply pagination cursor
        if (cursor) {
            // If searching, cursor is likely an ID (string). If not, it's a date string/timestamp.
            const startVal = isSearching ? cursor : new Date(cursor);
            constraints.push(startAfter(startVal));
        }

        constraints.push(limit(pageSize));

        let q;
        if (user.role === 'Administrator') { // Strict check
            q = query(invoicesRef, ...constraints);
        } else {
            // Standard users must filter by userId
            q = query(invoicesRef, where("userId", "==", user.id), ...constraints);
        }

        const snapshot = await getDocs(q);

        const invoices = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt),
                dueDate: data.dueDate?.toDate ? data.dueDate.toDate().toISOString() : (data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate),
                billingPeriodStart: data.billingPeriodStart?.toDate ? data.billingPeriodStart.toDate().toISOString() : (data.billingPeriodStart instanceof Date ? data.billingPeriodStart.toISOString() : data.billingPeriodStart),
                billingPeriodEnd: data.billingPeriodEnd?.toDate ? data.billingPeriodEnd.toDate().toISOString() : (data.billingPeriodEnd instanceof Date ? data.billingPeriodEnd.toISOString() : data.billingPeriodEnd),
                // Handle nested timestamps if any
                periodStart: data.periodStart?.toDate ? data.periodStart.toDate().toISOString() : (data.periodStart instanceof Date ? data.periodStart.toISOString() : data.periodStart),
                periodEnd: data.periodEnd?.toDate ? data.periodEnd.toDate().toISOString() : (data.periodEnd instanceof Date ? data.periodEnd.toISOString() : data.periodEnd),
            };
        });

        const hasMore = invoices.length === pageSize;

        // Calculate next cursor
        let nextCursor = null;
        if (hasMore) {
            const lastDoc = invoices[invoices.length - 1];
            nextCursor = isSearching ? lastDoc.invoiceId : lastDoc.createdAt;
        }

        return { success: true, invoices, hasMore, nextCursor };
    } catch (error) {
        console.error("Error fetching paginated invoices:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update a billing subscription (Upgrade/Downgrade)
 */
export async function updateBillingSubscription(userId, newPackageData, newBillingCycle) {
    try {
        const user = await verifyToken();
        if (!user) return { success: false, error: "Unauthorized" };
        if (userId !== user.id && user.role !== 'Administrator') return { success: false, error: "Access Denied" };

        const profileRef = doc(db, "billing_profiles", userId);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
            return await initializeBillingProfile(userId, newPackageData, newBillingCycle);
        }

        const currentProfile = profileSnap.data();
        let prorationData = null;

        // Calculate proration if upgrading/downgrading mid-cycle
        if (currentProfile.status === 'active' && currentProfile.packageName !== 'Free') {
            const now = new Date();
            const nextBillingDate = currentProfile.nextBillingDate?.toDate ? currentProfile.nextBillingDate.toDate() : new Date(currentProfile.nextBillingDate);
            const cycleStart = currentProfile.updatedAt?.toDate ? currentProfile.updatedAt.toDate() : new Date(currentProfile.updatedAt);

            const totalCycleTime = nextBillingDate - cycleStart;
            const remainingTime = nextBillingDate - now;

            if (remainingTime > 0 && totalCycleTime > 0) {
                const prorationFactor = remainingTime / totalCycleTime;
                const creditAmount = Math.round(currentProfile.amount * prorationFactor * 100) / 100;

                prorationData = {
                    creditAmount,
                    oldPackageName: currentProfile.packageName
                };
            }
        }

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
            status: "active"
        });

        // Trigger a fresh invoice with potential proration credit
        const updatedProfileSnap = await getDoc(profileRef);
        await generateInvoice(userId, updatedProfileSnap.data(), true, prorationData);

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
        const user = await verifyToken();
        if (!user) return { success: false, error: "Unauthorized" };
        if (userId !== user.id && user.role !== 'Administrator') return { success: false, error: "Access Denied" };

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

/**
 * Get the latest invoice for a user
 */
export async function getLatestInvoice(userId = null) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const targetId = userId || user.id;
        if (targetId !== user.id && user.role !== 'Administrator') {
            return { success: false, error: "Access Denied" };
        }

        const invoicesRef = collection(db, "invoices");
        const q = query(
            invoicesRef,
            where("userId", "==", targetId),
            orderBy("createdAt", "desc"),
            limit(1)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return { success: true, invoice: null };

        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        const invoice = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt),
            dueDate: data.dueDate?.toDate ? data.dueDate.toDate().toISOString() : (data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate),
            // Handle potential nested fields that caused the error
            periodStart: data.periodStart?.toDate ? data.periodStart.toDate().toISOString() : (data.periodStart instanceof Date ? data.periodStart.toISOString() : data.periodStart),
            periodEnd: data.periodEnd?.toDate ? data.periodEnd.toDate().toISOString() : (data.periodEnd instanceof Date ? data.periodEnd.toISOString() : data.periodEnd),
            billingPeriodStart: data.billingPeriodStart?.toDate ? data.billingPeriodStart.toDate().toISOString() : (data.billingPeriodStart instanceof Date ? data.billingPeriodStart.toISOString() : data.billingPeriodStart),
            billingPeriodEnd: data.billingPeriodEnd?.toDate ? data.billingPeriodEnd.toDate().toISOString() : (data.billingPeriodEnd instanceof Date ? data.billingPeriodEnd.toISOString() : data.billingPeriodEnd),
        };

        return { success: true, invoice };
    } catch (error) {
        console.error("Error fetching latest invoice:", error);
        return { success: false, error: error.message };
    }
}
