import { db } from "@/lib/firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
export const revalidate = 60;

function serializeBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export const GET = async () => {
  try {
    const data = await getDocs(collection(db, "roles"));
    const roles = data.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return new Response(
      JSON.stringify({ success: true, roles: serializeBigInt(roles) }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
};

export async function POST(req) {
  try {
    const { name, email, role_id, password } = await req.json();

    if (!name || !email || !role_id || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "All fields are required" }),
        { status: 400 }
      );
    }
    const hash_password = await bcrypt.hash(password, 10);

    // Optional: Check if email already exists
    const usersSnap = await getDocs(collection(db, "users"));
    const emailExists = usersSnap.docs.some((u) => u.data().email === email);
    if (emailExists) {
      return new Response(
        JSON.stringify({ success: false, message: "Email already exists" }),
        { status: 400 }
      );
    }

    const user = await addDoc(collection(db, "users"), {
      name,
      email,
      role_id,
      password: hash_password,
      created_at: new Date(),
    });

    revalidatePath("/api/admin/users");
    return new Response(
      JSON.stringify({
        success: true,
        user: { id: user.id, name, email, role_id },
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
}
