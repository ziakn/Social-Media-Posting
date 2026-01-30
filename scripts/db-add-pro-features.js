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

const PRO_FEATURES = [
    "Advanced Scheduling Calendar",
    "Automatic Failed Post Recovery"
];

async function updateProFeatures() {
    console.log("Starting professional features update...");
    try {
        const querySnapshot = await getDocs(collection(db, "packages"));
        let updatedCount = 0;

        for (const document of querySnapshot.docs) {
            const data = document.data();
            const features = data.features || [];

            // Skip "Free" packages
            if (data.name.toLowerCase() === "free") {
                console.log(`Skipping package: ${data.name}`);
                continue;
            }

            let featuresChanged = false;
            let updatedFeatures = [...features];

            PRO_FEATURES.forEach(newFeature => {
                const exists = updatedFeatures.some(f =>
                    f.toLowerCase().includes(newFeature.toLowerCase())
                );
                if (!exists) {
                    updatedFeatures.push(newFeature);
                    featuresChanged = true;
                }
            });

            if (featuresChanged) {
                console.log(`Updating package: ${data.name} (${data.billingCycle})...`);
                await updateDoc(doc(db, "packages", document.id), {
                    features: updatedFeatures,
                    updatedAt: new Date()
                });
                updatedCount++;
            }
        }

        console.log(`Update complete. Updated ${updatedCount} professional packages.`);
        process.exit(0);
    } catch (error) {
        console.error("Update error:", error);
        process.exit(1);
    }
}

updateProFeatures();
