import bcrypt from "bcryptjs";
import { db } from "@/lib/firebase"; // your Firebase instance
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";




export async function GET(req, { params }) {
  try {
    const { id } = await params;


    const userRef = doc(db, "users", id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    const userData = userSnap.data();
    return new Response(
      JSON.stringify({ success: true, user: { id, ...userData } }),
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/admin/users/[id] error:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
      const { id } = await params;

    const userRef = doc(db, "users", id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
    }

    // await deleteDoc(userRef);

    return new Response(JSON.stringify({ success: true, message: "User deleted" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { name, email, password, role_id } = await req.json();

    const userRef = doc(db, "users", id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
    }

    const data = { name, email, role_id };
    if (password && password.trim() !== "") {
      data.password = await bcrypt.hash(password, 10);
    }

    await updateDoc(userRef, data);

    return new Response(JSON.stringify({ success: true, user: { id, ...data } }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
