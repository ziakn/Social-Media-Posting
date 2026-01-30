const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, updateDoc, doc } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

// Simple .env parser
const envPath = path.join(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        env[match[1]] = value;
    }
});

const firebaseConfig = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTHREADS_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

async function cleanup() {
    console.log("Starting database cleanup...");
    try {
        const querySnapshot = await getDocs(collection(db, "packages"));
        let updatedCount = 0;

        for (const document of querySnapshot.docs) {
            const data = document.data();
            const features = data.features || [];

            const newFeatures = features.filter(feature => {
                const normalizedFeature = feature.replace(/^[✓\s*-]+/, "").trim();
                return !UNWANTED_FEATURES.some(unwanted =>
                    normalizedFeature.toLowerCase() === unwanted.toLowerCase()
                );
            });

            if (newFeatures.length !== features.length) {
                console.log(`Updating package: ${data.name}...`);
                await updateDoc(doc(db, "packages", document.id), {
                    features: newFeatures,
                    updatedAt: new Date()
                });
                updatedCount++;
            }
        }

        console.log(`Cleanup complete. Updated ${updatedCount} packages.`);
        process.exit(0);
    } catch (error) {
        console.error("Cleanup error:", error);
        process.exit(1);
    }
}

cleanup();
