// src/app/actions/social/tiktok/disconnectAccount.js
"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function disconnectTiktokAccount(accountId) {
    try {
        const user = await verifyToken();
        if (!user) throw new Error("Unauthorized");

        const accountRef = doc(db, "socialAccounts", accountId);

        await updateDoc(accountRef, {
            status: "disconnected",
            updatedAt: serverTimestamp()
        });

        revalidatePath("/admin/social/connect");
        return { success: true };
    } catch (error) {
        console.error("Error disconnecting TikTok account:", error);
        return { success: false, message: error.message };
    }
}
