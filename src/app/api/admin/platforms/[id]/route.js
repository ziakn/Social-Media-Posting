import bcrypt from "bcryptjs";
import { db } from "@/lib/firebase"; // your Firebase instance
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export async function GET(req, { params }) {
  try {
    
    const { id } = await params;
    const platformRef = doc(db, "platforms", id);
    const platformSnap = await getDoc(platformRef);

    if (!platformSnap.exists()) {
      return new Response(
        JSON.stringify({ success: false, message: "Platform not found" }),
        { status: 404 }
      );
    }

    const platformData = platformSnap.data();
    return new Response(
      JSON.stringify({ success: true, platform: { id, ...platformData } }),
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/admin/platforms/[id] error:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    const platformRef = doc(db, "platforms", id);
    const platformSnap = await getDoc(platformRef);

    if (!platformSnap.exists()) {
      return new Response(JSON.stringify({ success: false, message: "Platform not found" }), { status: 404 });
    }

    await deleteDoc(platformRef);

    return new Response(JSON.stringify({ success: true, message: "Platform deleted" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { platform_name, description, icon_url, status } = await req.json();
    const platformRef = doc(db, "platforms", id);
    const platformSnap = await getDoc(platformRef);

    if (!platformSnap.exists()) {
      return new Response(JSON.stringify({ success: false, message: "Platform not found" }), { status: 404 });
    }

    const data = { platform_name, description, icon_url, status };

    await updateDoc(platformRef, data);

    return new Response(JSON.stringify({ success: true, platform: { id, ...data } }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
