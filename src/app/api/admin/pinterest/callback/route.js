"use server";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

/**
 * Callback endpoint for Pinterest OAuth
 */
export async function GET(request) {
    const sessionToken = request.cookies.get("token")?.value;
    const portalUser = await verifyToken(sessionToken);

    if (!portalUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");

        if (!code) {
            return NextResponse.json({ error: "Missing OAuth code" }, { status: 400 });
        }

        const clientId = process.env.PINTEREST_APP_ID;
        const clientSecret = process.env.PINTEREST_APP_SECRET;
        const redirectUri = process.env.PINTEREST_REDIRECT_URI;

        const apiUrl = process.env.PINTEREST_API_URL || "https://api.pinterest.com/v5";

        // 1. Exchange code → access token
        // Pinterest V5 uses Basic Auth for token exchange
        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

        const tokenRes = await fetch(
            `${apiUrl}/oauth/token`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${authHeader}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: redirectUri,
                }),
            }
        );

        const tokenData = await tokenRes.json();
        if (tokenData.error) {
            console.error("Pinterest Access Token Error:", tokenData.error);
            return NextResponse.json({
                error: tokenData.error_description || "Failed to exchange code for token",
                details: tokenData
            }, { status: 400 });
        }

        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        const expiresIn = tokenData.expires_in; // Current token expiry
        const refreshExpiresIn = tokenData.refresh_token_expires_in;

        // 2. Fetch User Profile Info
        const profileRes = await fetch(
            `${apiUrl}/user_account`,
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );
        const profileData = await profileRes.json();

        if (profileData.error) {
            console.error("Pinterest Profile Fetch Error:", profileData.error);
            return NextResponse.json({
                error: profileData.error.message || "Failed to fetch profile",
                details: profileData.error
            }, { status: 400 });
        }

        // Pinterest user profile fields: account_type, profile_image, website_url, username
        const accountId = profileData.username;

        // 3. Fetch Boards to store initially
        let initialBoards = [];
        try {
            const boardsRes = await fetch(`${apiUrl}/boards`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                }
            });
            const boardsData = await boardsRes.json();
            if (boardsRes.ok && boardsData.items) {
                initialBoards = boardsData.items;
            }
        } catch (e) {
            console.error("Failed to fetch initial boards during callback:", e);
        }

        // 4. Check if account already exists
        const existingQuery = query(
            collection(db, "socialAccounts"),
            where("userId", "==", portalUser.id),
            where("accountId", "==", accountId),
            where("platform", "==", "pinterest")
        );
        const existingSnapshot = await getDocs(existingQuery);

        const accountData = {
            status: "active",
            accessToken: accessToken,
            refreshToken: refreshToken || null,
            username: profileData.username,
            pageName: profileData.username,
            profilePicture: profileData.profile_image,
            boards: initialBoards, // Store boards here
            tokenExpiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000),
            updatedAt: serverTimestamp(),
        };

        if (!existingSnapshot.empty) {
            // Update existing
            const docRef = existingSnapshot.docs[0].ref;
            await updateDoc(docRef, accountData);
        } else {
            // Create new
            await addDoc(collection(db, "socialAccounts"), {
                ...accountData,
                userId: portalUser.id,
                platform: "pinterest",
                accountId: accountId,
                createdAt: serverTimestamp(),
            });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/admin/social/connect?platform=pinterest&status=success&name=${encodeURIComponent(profileData.username)}`
        );
    } catch (err) {
        console.error("Pinterest OAuth callback error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
