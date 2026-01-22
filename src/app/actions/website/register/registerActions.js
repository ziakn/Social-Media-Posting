"use server";

import { db } from "@/lib/firebase";
import { setDoc, doc, collection, query, where, getDocs, getDoc, documentId } from "firebase/firestore";
import { cookies } from "next/headers";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * Server action to register a user via the website frontend.
 * Purely database-driven, bypasses Firebase Auth.
 */
export async function registerUserAction(formData, selectedPlan, receiveUpdates) {
    try {
        const { name, email, password, confirmPassword, creatorType, country } = formData;

        // 1️⃣ Validation layer
        if (!name || !email || !password || !confirmPassword) {
            return { success: false, error: "Protocol Failure: Required fields missing." };
        }

        if (password !== confirmPassword) {
            return { success: false, error: "Encryption keys do not match. Please verify your password." };
        }

        // 2️⃣ Check for unique identity (email)
        const q = query(collection(db, "users"), where("email", "==", email.toLowerCase().trim()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return { success: false, error: "This email identity is already registered in our network." };
        }

        // 3️⃣ Cryptographic processing (Hashing)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4️⃣ Determine Subscription Status and Limits
        const isPaid = selectedPlan && selectedPlan.name.toLowerCase() !== "free";
        const subscription = isPaid ? {
            status: "pending_payment",
            packageId: selectedPlan.id,
            packageName: selectedPlan.name,
            currentPeriodEnd: null,
            limits: selectedPlan.limits || {}
        } : {
            status: "active",
            packageId: selectedPlan.id,
            packageName: selectedPlan.name,
            limits: selectedPlan.limits || {},
            currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year for free
        };

        // 5️⃣ Deployment: Save User Node to Firestore
        const userRef = doc(collection(db, "users"));
        const userId = userRef.id;
        const roleId = "ewQpzYwfeV49GrYaIk3Y"; // Default Admin role

        const userData = {
            id: userId,
            name,
            email: email.toLowerCase().trim(),
            creatorType,
            country,
            role_id: roleId,
            role_name: "Admin",
            password: hashedPassword,
            subscription,
            coinBalance: 100,
            created_at: new Date(),
            receiveUpdates
        };

        await setDoc(userRef, userData);

        // 6️⃣ Secure Session Generation (Silent Auto-Login)

        // Fetch role & permissions for token payload
        const roleSnap = await getDoc(doc(db, "roles", roleId));
        let roleName = "Admin";
        let permissions = [];
        if (roleSnap.exists()) {
            const roleData = roleSnap.data();
            roleName = roleData.name || "Admin";

            if (roleData.permissions?.length > 0) {
                // Chunk if necessary (Admin usually has < 30 perms currently)
                const permQ = query(collection(db, "permissions"), where(documentId(), "in", roleData.permissions.slice(0, 30)));
                const permSnap = await getDocs(permQ);
                permissions = permSnap.docs.map(doc => doc.data().name);
            }
        }

        const tokenPayload = {
            id: userId,
            email: userData.email,
            name: userData.name,
            role: roleName,
            permissions,
            subscription
        };

        const token = await createToken(tokenPayload);

        // Set cookie on server side
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: true,
            path: "/",
            maxAge: 60 * 60 * 24, // 24 hours
            sameSite: "none",
        });

        // Return success metadata for client-side redirection
        return {
            success: true,
            isPaid,
            planName: selectedPlan.name,
            billingCycle: selectedPlan.billingCycle || "monthly"
        };

    } catch (error) {
        console.error("Critical Register Action Error:", error);
        return { success: false, error: error.message || "Internal Protocol Error" };
    }
}
