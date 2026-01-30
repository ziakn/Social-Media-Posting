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

async function moveAnalytics() {
    console.log("Starting analytics feature move in database...");
    try {
        const querySnapshot = await getDocs(collection(db, "packages"));
        let updatedCount = 0;

        for (const document of querySnapshot.docs) {
            const data = document.data();
            const features = data.features || [];
            let changed = false;
            let newFeatures = [...features];

            if (data.name.toLowerCase() === "creator") {
                // Remove Advanced, ensure Basic
                if (newFeatures.includes("Advanced Analytics")) {
                    newFeatures = newFeatures.filter(f => f !== "Advanced Analytics");
                    if (!newFeatures.includes("Basic Analytics")) {
                        newFeatures.push("Basic Analytics");
                    }
                    changed = true;
                }
            } else if (data.name.toLowerCase() === "pro" || data.name.toLowerCase() === "agency") {
                // Remove Basic, ensure Advanced
                if (newFeatures.includes("Basic Analytics")) {
                    newFeatures = newFeatures.filter(f => f !== "Basic Analytics");
                }
                if (!newFeatures.includes("Advanced Analytics")) {
                    newFeatures.push("Advanced Analytics");
                    changed = true;
                }
            }

            if (changed) {
                console.log(`Updating package: ${data.name} (${data.billingCycle})...`);
                await updateDoc(doc(db, "packages", document.id), {
                    features: newFeatures,
                    updatedAt: new Date()
                });
                updatedCount++;
            }
        }

        console.log(`Move complete. Updated ${updatedCount} packages.`);
        process.exit(0);
    } catch (error) {
        console.error("Move error:", error);
        process.exit(1);
    }
}

moveAnalytics();
