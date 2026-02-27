import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// Helper: resolve a user document from the JWT
async function resolveUser(decoded) {
  const userId = decoded.id || decoded.uid;
  let userDoc = null;
  let userDocId = null;

  const directDocRef = doc(db, "users", userId);
  const directDocSnap = await getDoc(directDocRef);

  if (directDocSnap.exists()) {
    userDoc = directDocSnap.data();
    userDocId = userId;
  } else {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("id", "==", userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      userDoc = querySnapshot.docs[0].data();
      userDocId = querySnapshot.docs[0].id;
    }
  }

  return { userDoc, userDocId };
}

export async function GET() {
  try {
    const decoded = await verifyToken();
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { userDoc, userDocId } = await resolveUser(decoded);

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: userDoc.id || userDocId,
        name: userDoc.name,
        email: userDoc.email,
        avatar: userDoc.avatar || null,
        role_id: userDoc.role_id,
        role: userDoc.role,
        subscription: userDoc.subscription || null,
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT – update profile fields (name, avatar) and/or password
export async function PUT(req) {
  try {
    const decoded = await verifyToken();
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { userDoc, userDocId } = await resolveUser(decoded);

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const updates = {};

    // --- Profile fields ---
    if (body.name !== undefined) {
      const trimmed = body.name.trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
      }
      updates.name = trimmed;
    }

    if (body.avatar !== undefined) {
      updates.avatar = body.avatar; // URL string (or null to remove)
    }

    // --- Password change ---
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password." }, { status: 400 });
      }

      const passwordMatch = await bcrypt.compare(body.currentPassword, userDoc.password);
      if (!passwordMatch) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
      }

      if (body.newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
      }

      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(body.newPassword, salt);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    updates.updatedAt = serverTimestamp();

    const userRef = doc(db, "users", userDocId);
    await updateDoc(userRef, updates);

    return NextResponse.json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
