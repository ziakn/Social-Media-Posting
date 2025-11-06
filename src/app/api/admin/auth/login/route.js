import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { createToken } from "@/lib/auth";
import { collection, query, where, getDocs, documentId } from "firebase/firestore";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Find user
    const q = query(
      collection(db, "users"),
      where("email", "==", email.toLowerCase().trim())
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const userDocRef = snapshot.docs[0];
    const userDoc = userDocRef.data();

    // Check password
    const passwordMatch = await bcrypt.compare(password, userDoc.hash_password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Fetch role data
    let roleData = null;
    if (userDoc.role_id) {
      const roleSnap = await getDocs(
        query(collection(db, "roles"), where("__name__", "==", userDoc.role_id))
      );
      if (!roleSnap.empty) {
        roleData = roleSnap.docs[0].data();
      }
    }

    const permissionData = [];
    if (roleData.permissions && roleData.permissions.length > 0) {
      const q = query(collection(db, "permissions"),where(documentId(), "in", roleData.permissions));

      const permSnap = await getDocs(q);

      permSnap.forEach((doc) => {
        permissionData.push({ id: doc.id, ...doc.data() });
      });
    }

    // Create JWT payload
    const tokenPayload = {
      id: userDocRef.id,
      email: userDoc.email,
      name: userDoc.name,
      role: roleData?.name || null,
      permissions: permissionData|| [],

    };

    // Create JWT token
    const token = await createToken(tokenPayload);

    // Prepare user data for response
    const userData = {
      id: userDocRef.id,
      name: userDoc.name,
      email: userDoc.email,
      role: roleData?.name || null,
      permissions: permissionData || [],

    };

    const response = NextResponse.json({
      success: true,
      user: userData,
      message: "Login successful",
    });

    // Set secure cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
