import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, addDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
export const dynamic = "force-dynamic";

function serializeBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export const GET = async () => {
  try {
    const platformsSnap = await getDocs(collection(db, "platforms"));

    //  Use map properly and collect promises
    const platformsPromises = platformsSnap.docs.map(async (d) => {
      const platform = d.data();
      let role = null;

      if (platform.role_id) {
        const roleSnap = await getDoc(doc(db, "roles", platform.role_id));
        if (roleSnap.exists()) {
          role = { id: roleSnap.id, ...roleSnap.data() }; // ✅ Include role id too
        }
      }

      return {
        id: d.id,
        ...platform,
        role, //  Attach the role object
      };
    });

    //  Resolve all async map promises
    const platforms = await Promise.all(platformsPromises);

    // Sort by sorting_number
    platforms.sort((a, b) => (a.sorting_number || 0) - (b.sorting_number || 0));

    return new Response(
      JSON.stringify({ success: true, platforms: serializeBigInt(platforms) }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching platforms:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
};

export async function POST(req) {
  try {
    console.log(req.body);
    const { platform_name, description, icon_url, status, sorting_number } = await req.json();

    if (!platform_name || !description || !icon_url || !status) {
      return new Response(
        JSON.stringify({ success: false, message: "All fields are required" }),
        { status: 400 }
      );
    }

    // Optional: Check if email already exists
    const platformsSnap = await getDocs(collection(db, "platforms"));
    const platformExists = platformsSnap.docs.some((p) => p.data().platform_name === platform_name);
    if (platformExists) {
      return new Response(
        JSON.stringify({ success: false, message: "Platform already exists" }),
        { status: 400 }
      );
    }

    const platform = await addDoc(collection(db, "platforms"), {
      platform_name,
      description,
      icon_url,
      status,
      sorting_number: parseInt(sorting_number) || 0,
      created_at: new Date(),
    });

    revalidatePath("/api/portal/platform");
    return new Response(
      JSON.stringify({
        success: true,
        platform: { id: platform.id, platform_name, description, icon_url, status },
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
