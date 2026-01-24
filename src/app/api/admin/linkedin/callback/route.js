import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
    const user = await verifyToken();

    try {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (!code) {
            return NextResponse.json({ error: "Missing code" }, { status: 400 });
        }

        // Exchange code for access token
        const tokenResponse = await exchangeCodeForToken(code);
        const { access_token, expires_in, refresh_token } = tokenResponse;

        // Get user profile info from LinkedIn OpenID Connect
        const linkedinProfile = await fetchLinkedinProfile(access_token);

        if (!user) {
            return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 403 });
        }

        const portalUserId = user.id;

        // Deactivate existing active records for this user and platform
        const socialAccountsRef = collection(db, "socialAccounts");
        const q = query(socialAccountsRef, where("userId", "==", portalUserId), where("platform", "==", "linkedin"), where("status", "==", "active"));
        const existingAccountsSnap = await getDocs(q);
        for (const docSnap of existingAccountsSnap.docs) {
            await updateDoc(docSnap.ref, { status: "inactive", updatedAt: serverTimestamp() });
        }

        // 1. Save Personal Profile
        await addDoc(collection(db, "socialAccounts"), {
            userId: portalUserId,
            platform: "linkedin",
            accountType: "person", // Explicit type
            platformUserId: linkedinProfile.sub,
            displayName: linkedinProfile.name,
            username: linkedinProfile.email || linkedinProfile.preferred_username || linkedinProfile.name,
            profilePicture: linkedinProfile.picture,
            accessToken: access_token,
            refreshToken: refresh_token || null,
            tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // 2. Fetch and Save Company Pages
        try {
            const acls = await fetchOrganizationAcls(access_token);
            for (const acl of acls) {
                const orgUrn = acl.organizationalTarget; // urn:li:organization:123456
                try {
                    const orgDetails = await fetchOrganizationDetails(access_token, orgUrn);

                    await addDoc(collection(db, "socialAccounts"), {
                        userId: portalUserId,
                        platform: "linkedin",
                        accountType: "organization",
                        platformUserId: orgDetails.id, // ID only
                        platformUrn: orgDetails.urn, // Full URN
                        displayName: orgDetails.name,
                        username: orgDetails.name, // Display name as username fallback
                        profilePicture: orgDetails.logo,
                        accessToken: access_token, // Same user token manages the page
                        refreshToken: refresh_token || null,
                        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
                        status: "active",
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                } catch (orgErr) {
                    console.error("Failed to fetch/save organization details:", orgUrn, orgErr);
                }
            }
        } catch (aclErr) {
            console.error("Failed to fetch organization ACLs:", aclErr);
            // Don't fail the whole connection if companies fail, just log it
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/admin/social/connect?status=success&platform=linkedin&name=${encodeURIComponent(linkedinProfile.name)}`
        );

    } catch (error) {
        console.error("LinkedIn OAuth callback error:", error);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/admin/social/connect?status=failed&platform=linkedin&message=${encodeURIComponent(error.message)}`
        );
    }
}

async function exchangeCodeForToken(code) {
    const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET,
            redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error_description || data.error);
    return data;
}

async function fetchLinkedinProfile(accessToken) {
    // Fetch profile using OpenID Connect userinfo endpoint
    const res = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    const data = await res.json();
    if (data.error) throw new Error(data.message || "Failed to fetch LinkedIn profile");

    return data;
}

async function fetchOrganizationAcls(accessToken) {
    // Fetch companies where the user is an Administrator
    const res = await fetch("https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED", {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0"
        }
    });

    const data = await res.json();
    if (data.elements) {
        return data.elements;
    }
    return [];
}

async function fetchOrganizationDetails(accessToken, orgUrn) {
    // orgUrn format: urn:li:organization:12345
    // We need to extract the ID: 12345
    const parts = orgUrn.split(":");
    const orgId = parts[parts.length - 1];

    const res = await fetch(`https://api.linkedin.com/v2/organizations/${orgId}?projection=(id,localizedName,logoV2(original~:playableStreams))`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0"
        }
    });

    const data = await res.json();

    // Extract logo
    let logo = null;
    if (data.logoV2 && data.logoV2["original~"] && data.logoV2["original~"].elements && data.logoV2["original~"].elements.length > 0) {
        logo = data.logoV2["original~"].elements[0].identifiers[0].identifier;
    }

    return {
        id: orgId,
        name: data.localizedName,
        logo: logo,
        urn: orgUrn
    };
}
