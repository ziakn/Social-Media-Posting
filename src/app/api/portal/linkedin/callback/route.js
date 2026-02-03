import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
    const user = await verifyToken();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

        // Collect all potential profiles (Person + Organizations)
        const potentialProfiles = [];

        // 1. Personal Profile
        potentialProfiles.push({
            pageId: linkedinProfile.sub, // Using 'sub' as ID
            pageName: linkedinProfile.name, // Personal Name
            type: 'person',
            platformUserId: linkedinProfile.sub,
            username: linkedinProfile.email || linkedinProfile.preferred_username || linkedinProfile.name,
            profilePicture: linkedinProfile.picture,
            platformUrn: `urn:li:person:${linkedinProfile.sub}` // Approximate URN
        });

        // 2. Organization Pages
        try {
            const acls = await fetchOrganizationAcls(access_token);
            for (const acl of acls) {
                const orgUrn = acl.organizationalTarget;
                try {
                    const orgDetails = await fetchOrganizationDetails(access_token, orgUrn);
                    potentialProfiles.push({
                        pageId: orgDetails.id,
                        pageName: orgDetails.name,
                        type: 'organization',
                        platformUserId: orgDetails.id,
                        platformUrn: orgDetails.urn,
                        username: orgDetails.name,
                        profilePicture: orgDetails.logo
                    });
                } catch (orgErr) {
                    console.error("Failed to fetch/save organization details:", orgUrn, orgErr);
                }
            }
        } catch (aclErr) {
            console.error("Failed to fetch organization ACLs:", aclErr);
        }

        // Store in pending_connections
        const pendingDoc = await addDoc(collection(db, "pending_connections"), {
            userId: portalUserId,
            platform: "linkedin",
            displayName: linkedinProfile.name, // Context name
            accessToken: access_token,
            refreshToken: refresh_token || null,
            tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            pages: potentialProfiles, // Stores both person and orgs
            status: "pending",
            createdAt: serverTimestamp()
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/portal/social/connect?status=pending&platform=linkedin&pendingId=${pendingDoc.id}`
        );

    } catch (error) {
        console.error("LinkedIn OAuth callback error:", error);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/portal/social/connect?status=failed&platform=linkedin&message=${encodeURIComponent(error.message)}`
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
