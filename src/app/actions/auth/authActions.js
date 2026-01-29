"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, getDoc, limit } from "firebase/firestore";
import { createToken, verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

const RESET_TOKEN_EXPIRATION = "15m"; // 15 minutes

/**
 * Server action to initiate password reset
 */
export async function requestResetAction(email) {
    try {
        if (!email) {
            return { success: false, error: "Email is required." };
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Find user by email
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", normalizedEmail), limit(1));
        const querySnapshot = await getDocs(q);

        // Security Best Practice: Even if user not found, return success to prevent email enumeration
        if (querySnapshot.empty) {
            console.log(`[AUTH] Password reset requested for non-existent email: ${normalizedEmail}`);
            return { success: true, message: "If an account exists with this email, a reset link has been generated." };
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // 2. Generate a short-lived reset token
        const resetToken = await createToken({
            id: userDoc.id,
            email: normalizedEmail,
            purpose: "password_reset"
        }, RESET_TOKEN_EXPIRATION);

        // 3. Store reset request in Firestore
        await addDoc(collection(db, "passwordResets"), {
            userId: userDoc.id,
            email: normalizedEmail,
            token: resetToken,
            used: false,
            createdAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
        });

        // 4. Construct reset link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;

        // 5. Log for development (In production, this would be an email send)
        console.log("==========================================");
        console.log(`PASSWORD RESET REQUEST FOR: ${normalizedEmail}`);
        console.log(`RESET LINK: ${resetLink}`);
        console.log("==========================================");

        return {
            success: true,
            message: "Check your email for instructions to reset your password.",
            devLink: process.env.NODE_ENV === "development" ? resetLink : null
        };

    } catch (error) {
        console.error("Critical Request Reset Error:", error);
        return { success: false, error: "Internal Protocol Error" };
    }
}

/**
 * Server action to confirm password reset
 */
export async function confirmResetAction(token, newPassword) {
    try {
        if (!token || !newPassword) {
            return { success: false, error: "Invalid request payload." };
        }

        // 1. Verify token signature and purpose
        const payload = await verifyToken(token);
        if (!payload || payload.purpose !== "password_reset") {
            return { success: false, error: "Invalid or expired reset token." };
        }

        // 2. Check token in Firestore to ensure it hasn't been used
        const resetsRef = collection(db, "passwordResets");
        const q = query(resetsRef, where("token", "==", token), where("used", "==", false), limit(1));
        const resetSnap = await getDocs(q);

        if (resetSnap.empty) {
            return { success: false, error: "This link has already been used or is invalid." };
        }

        const resetDoc = resetSnap.docs[0];
        const resetData = resetDoc.data();

        // 3. Check expiration manually just in case
        if (resetData.expiresAt.toDate() < new Date()) {
            return { success: false, error: "This reset link has expired." };
        }

        // 4. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 5. Update user password
        const userRef = doc(db, "users", payload.id);
        await updateDoc(userRef, {
            password: hashedPassword,
            updatedAt: serverTimestamp()
        });

        // 6. Mark token as used
        await updateDoc(doc(db, "passwordResets", resetDoc.id), {
            used: true,
            usedAt: serverTimestamp()
        });

        return { success: true, message: "Password updated successfully. You can now log in." };

    } catch (error) {
        console.error("Critical Confirm Reset Error:", error);
        return { success: false, error: "Internal Protocol Error" };
    }
}
