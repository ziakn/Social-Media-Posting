import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { createToken } from "@/lib/auth";
import { collection, query, where, getDocs, getDoc, doc, documentId } from "firebase/firestore";
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
    const passwordMatch = await bcrypt.compare(password, userDoc.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Fetch role data
    let roleData = null;
    if (userDoc.role_id) {
      const roleSnap = await getDoc(doc(db, "roles", userDoc.role_id));
      if (roleSnap.exists()) {
        roleData = roleSnap.data();
      }
    }

    const permissionData = [];
    if (roleData && roleData.permissions && roleData.permissions.length > 0) {
      // Chunk permissions into batches of 30 (Firestore limit for 'in' operator)
      const chunkSize = 30;
      const permissionChunks = [];

      for (let i = 0; i < roleData.permissions.length; i += chunkSize) {
        permissionChunks.push(roleData.permissions.slice(i, i + chunkSize));
      }

      // Execute queries in parallel
      const queryPromises = permissionChunks.map(chunk => {
        const q = query(collection(db, "permissions"), where(documentId(), "in", chunk));
        return getDocs(q);
      });

      const snapshots = await Promise.all(queryPromises);

      snapshots.forEach(permSnap => {
        permSnap.forEach((doc) => {
          permissionData.push({ id: doc.id, ...doc.data() });
        });
      });
    }

    // Create JWT payload
    const tokenPayload = {
      id: userDocRef.id,
      email: userDoc.email,
      name: userDoc.name,
      role: roleData?.name || "Admin",
      permissions: permissionData.map(item => item.name) || [],
      subscription: userDoc.subscription || null,
    };

    // Create JWT token
    const token = await createToken(tokenPayload);

    // Prepare user data for response
    const userData = {
      id: userDocRef.id,
      name: userDoc.name,
      email: userDoc.email,
      role: roleData?.name || null,
      permissions: permissionData.map(item => item.name) || [],
      subscription: userDoc.subscription || null,

    };


    const response = NextResponse.json({
      success: true,
      user: userData,
      message: "Login successful",
    });

    // Set secure cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: "none",  //strict
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
