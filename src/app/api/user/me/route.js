import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {

    const decoded = await verifyToken();
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id || decoded.uid;
    let userDoc = null;
    let userDocId = null;

    // 1. Try direct Document ID lookup (most reliable)
    const directDocRef = doc(db, "users", userId);
    const directDocSnap = await getDoc(directDocRef);

    if (directDocSnap.exists()) {
      userDoc = directDocSnap.data();
      userDocId = userId;
    } else {

      // 2. Fallback to query by 'id' field
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("id", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        userDoc = querySnapshot.docs[0].data();
        userDocId = querySnapshot.docs[0].id;
      }
    }

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }



    return NextResponse.json({
      user: {
        id: userDoc.id || userDocId,
        name: userDoc.name,
        email: userDoc.email,
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
