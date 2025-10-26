import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Check for missing fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // Find user in Firestore
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ error: "Email not found!" }, { status: 404 });
    }

    const userDocRef = snapshot.docs[0];
    const userDoc = userDocRef.data();

    const passwordMatch = await bcrypt.compare(password, userDoc.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Incorrect password!" }, { status: 401 });
    }

    // Fetch Role & Permissions
    let roleData = null;
    if (userDoc.role_id) {
      const roleSnap = await getDocs(
        query(collection(db, "roles"), where("__name__", "==", userDoc.role_id))
      );
      if (!roleSnap.empty) {
        roleData = roleSnap.docs[0].data();
      }
    }

    const sessionUser = {
      id: userDocRef.id,
      name: userDoc.name,
      email: userDoc.email,
      role_id: userDoc.role_id,
      role: roleData?.name || null,
      permissions: roleData?.permissions || [],
    };

    const response = NextResponse.json({ success: true, user: sessionUser });
    
     response.cookies.set("token", JSON.stringify({ id: sessionUser.id, role: sessionUser.role }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}
