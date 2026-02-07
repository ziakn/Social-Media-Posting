const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

/**
 * Initialize Firebase Admin with flexible credential loading.
 * 1. Looks for FIREBASE_SERVICE_ACCOUNT environment variable (JSON string or path).
 * 2. Looks for serviceAccountKey.json in the project root.
 * 3. Falls back to Application Default Credentials (ADC) via projectId.
 */
function initAdmin() {
    if (getApps().length > 0) return getFirestore();

    // 1. Try to load local .env files automatically
    try {
        ['.env', '.env.local'].forEach(f => {
            const p = path.join(process.cwd(), f);
            if (fs.existsSync(p)) {
                console.log(`[Firebase Admin] Detected ${f}, loading...`);
                process.loadEnvFile(p);
            } else {
                console.log(`[Firebase Admin] ${f} not found at ${p}`);
            }
        });
    } catch (e) {
        console.warn("[Firebase Admin] Native loadEnvFile error:", e.message);
    }

    // 2. Define Manual Fallbacks
    const MANUAL_PROJECT_ID = "news-aggregator-49d79";
    const MANUAL_SERVICE_ACCOUNT = null;

    // 3. Select the best available credential
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT || MANUAL_SERVICE_ACCOUNT;

    console.log(`[Firebase Admin] Checking credentials...`);
    console.log(`[Firebase Admin] Project ID in env: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
    console.log(`[Firebase Admin] FIREBASE_SERVICE_ACCOUNT in env: ${!!process.env.FIREBASE_SERVICE_ACCOUNT}`);

    let credential;

    if (saVar) {
        try {
            console.log(`[Firebase Admin] Attempting to parse service account credential...`);
            const sa = typeof saVar === 'string' && saVar.trim().startsWith('{') ? JSON.parse(saVar) : saVar;
            credential = cert(sa);
            console.log(`[Firebase Admin] Credential parsed successfully.`);
        } catch (e) {
            console.error("[Firebase Admin] Error parsing credentials:", e.message);
        }
    }

    // 4. Final Initialization Configuration
    const options = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || MANUAL_PROJECT_ID,
    };

    if (credential) {
        options.credential = credential;
    } else {
        console.warn("⚠️ [Firebase Admin] No Service Account Key found. Background worker will FAIL until you add credentials to .env (FIREBASE_SERVICE_ACCOUNT).");
    }

    try {
        initializeApp(options);
    } catch (err) {
        if (err.code !== 'app/duplicate-app') throw err;
    }

    return getFirestore();
}

module.exports = { initAdmin };
