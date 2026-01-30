"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const UNWANTED_FEATURES = [
    "Standard-Quality Media",
    "High-Quality Media",
    "Team Approval Workflow",
    "Compare Your Progress",
    "Client Approval Systems",
    "Custom Branded Reports",
    "Dedicated Account Manager",
    "720p Image Uploads",
    "1080p Image & Video",
    "Competitor Analysis",
    "Client Approval Portals",
    "White-label Reports"
];

export async function cleanupPackageFeatures() {
    try {
        const querySnapshot = await getDocs(collection(db, "packages"));
        let updatedCount = 0;

        for (const document of querySnapshot.docs) {
            const data = document.data();
            const features = data.features || [];

            const newFeatures = features.filter(feature => {
                // Check if the feature (after trimming and normalizing) is in the unwanted list
                const normalizedFeature = feature.replace(/^[✓\s*-]+/, "").trim();
                return !UNWANTED_FEATURES.some(unwanted =>
                    normalizedFeature.toLowerCase() === unwanted.toLowerCase()
                );
            });

            if (newFeatures.length !== features.length) {
                await updateDoc(doc(db, "packages", document.id), {
                    features: newFeatures,
                    updatedAt: new Date()
                });
                updatedCount++;
            }
        }

        return { success: true, message: `Updated ${updatedCount} packages.`, count: updatedCount };
    } catch (error) {
        console.error("Cleanup error:", error);
        return { success: false, error: error.message };
    }
}
