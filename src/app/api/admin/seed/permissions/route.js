import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";

export async function GET() {
  try {
    const modules = ["dashboard", "permissions", "roles", "settings", "users", "connect", "gallery", "plateforms", "billing", "composer", "scheduled", "failed", "analytics", "invoices", "help", "packages", "billing_analytics", "subscription", "blog"];
    const actions = ["view", "create", "edit", "delete"];

    let inserted = 0;
    let skipped = 0;

    for (const module of modules) {
      for (const action of actions) {
        const name = `${action}_${module}`;
        const description = `Allows user to ${action} in ${module} module`;

        // Check if it already exists
        const q = query(collection(db, "permissions"), where("name", "==", name));
        const existing = await getDocs(q);

        if (existing.empty) {
          await addDoc(collection(db, "permissions"), {
            name,
            description,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          });
          console.log(`✅ Inserted: ${name}`);
          inserted++;
        } else {
          console.log(`⏭️ Skipped (already exists): ${name}`);
          skipped++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeding completed. Inserted: ${inserted}, Skipped: ${skipped}`,
    });
  } catch (error) {
    console.error("❌ Error seeding permissions:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
