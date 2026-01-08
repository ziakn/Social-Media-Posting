"use server";

import { BskyAgent } from "@atproto/api";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, addDoc, Timestamp, doc, serverTimestamp } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        const { identifier, password } = body;

        if (!identifier || !password) {
            return NextResponse.json({ error: "Identifier and Password are required" }, { status: 400 });
        }

        // 1. Verify User
        const sessionToken = request.cookies.get("token")?.value;
        const user = await verifyToken(sessionToken);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Initialize Agent and Login
        const agent = new BskyAgent({
            service: "https://bsky.social",
        });

        try {
            await agent.login({ identifier, password });
        } catch (loginError) {
            console.error("BlueSky Login Error:", loginError);
            return NextResponse.json({ error: "Invalid handle or app password. Please check your credentials." }, { status: 401 });
        }

        // 3. Get Profile Info
        const { data: profile } = await agent.getProfile({ actor: agent.session.did });

        // 4. Check for existing account
        const accountsRef = collection(db, "socialAccounts");
        const q = query(
            accountsRef,
            where("userId", "==", user.id),
            where("platform", "==", "bluesky"),
            where("accountId", "==", profile.did)
        );
        const querySnapshot = await getDocs(q);

        const accountData = {
            userId: user.id,
            platform: "bluesky",
            accountId: profile.did,
            username: profile.handle,
            pageName: profile.displayName || profile.handle,
            profilePicture: profile.avatar || null,
            identifier: identifier, // Store handle for re-login
            password: password,     // Store App Password
            status: "active",
            updatedAt: serverTimestamp(),
            accessToken: agent.session.accessJwt,
            refreshToken: agent.session.refreshJwt,
            tokenExpiresAt: serverTimestamp() // Just a placeholder, as App PW doesn't expire same way
        };

        if (!querySnapshot.empty) {
            // Update existing
            const docId = querySnapshot.docs[0].id;
            await updateDoc(doc(db, "socialAccounts", docId), accountData);
        } else {
            // Create New
            await addDoc(accountsRef, {
                ...accountData,
                createdAt: serverTimestamp()
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Connect BlueSky Error:", error);
        return NextResponse.json({ error: error.message || "Failed to connect account" }, { status: 500 });
    }
}
