import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export async function GET() {
    try {
        const results = {};

        // Test 1: Simple fetch of all docs (no filters)
        try {
            const allDocsSnapshot = await getDocs(collection(db, "blogs"));
            results.allDocsCount = allDocsSnapshot.size;
            results.sampleDoc = allDocsSnapshot.empty ? null : allDocsSnapshot.docs[0].data();
        } catch (e) {
            results.allDocsError = e.message;
        }

        // Test 2: Filter by status only
        try {
            const q = query(collection(db, "blogs"), where("status", "==", "published"));
            const snapshot = await getDocs(q);
            results.statusFilterCount = snapshot.size;
        } catch (e) {
            results.statusFilterError = e.message;
        }

        // Test 3: Filter + Order (The one used in action)
        try {
            const q = query(
                collection(db, "blogs"),
                where("status", "==", "published"),
                orderBy("date", "desc")
            );
            const snapshot = await getDocs(q);
            results.orderedFilterCount = snapshot.size;
        } catch (e) {
            results.orderedFilterError = e.message;
            results.indexLink = e.message.includes('index') ? "CHECK CONSOLE FOR LINK" : "No index link found";
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
