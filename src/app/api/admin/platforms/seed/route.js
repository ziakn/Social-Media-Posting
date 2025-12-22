import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, writeBatch } from "firebase/firestore";

export async function GET() {
    try {
        const platforms = [
            {
                platform_name: "Facebook",
                description: "Connect your Facebook Page to enable publishing and analytics.",
                icon_url: "facebook", // Using key as icon_url for now, or actual URL if available
                status: "active",
                sorting_number: 1,
            },
            {
                platform_name: "Instagram",
                description: "Link Instagram to manage Reels, Stories, and analytics.",
                icon_url: "instagram",
                status: "active",
                sorting_number: 2,
            },
            {
                platform_name: "Threads",
                description: "Share text updates and join public conversations.",
                icon_url: "threads",
                status: "active",
                sorting_number: 3,
            },
            {
                platform_name: "WhatsApp",
                description: "Integrate WhatsApp Business for customer messaging.",
                icon_url: "whatsapp",
                status: "active",
                sorting_number: 4,
            },
            {
                platform_name: "LinkedIn",
                description: "Connect LinkedIn to share updates and gather engagement.",
                icon_url: "linkedin",
                status: "active",
                sorting_number: 5,
            },
            {
                platform_name: "Twitter",
                description: "Post tweets and fetch analytics.",
                icon_url: "twitter",
                status: "active",
                sorting_number: 6,
            },
            {
                platform_name: "Bluesky",
                description: "Manage posts and engagement from Bluesky.",
                icon_url: "bluesky",
                status: "active",
                sorting_number: 7,
            },
            {
                platform_name: "Reddit",
                description: "Connect Reddit to schedule posts and track performance.",
                icon_url: "reddit",
                status: "active",
                sorting_number: 8,
            },
            {
                platform_name: "Telegram",
                description: "Integrate Telegram bots for community management.",
                icon_url: "telegram",
                status: "active",
                sorting_number: 9,
            },
            {
                platform_name: "TikTok",
                description: "Short-form video sharing platform for creative content.",
                icon_url: "tiktok",
                status: "active",
                sorting_number: 10,
            },
        ];

        const platformsRef = collection(db, "platforms");
        const batch = writeBatch(db);
        let processedCount = 0;

        for (const platform of platforms) {
            // Use slugified name as ID for consistent upserts
            const platformId = platform.platform_name.toLowerCase().replace(/\s+/g, '-');
            const docRef = doc(db, "platforms", platformId);

            batch.set(docRef, {
                ...platform,
                updated_at: new Date(),
                // Only set created_at if it's a new document (optional, but good practice)
                // However, with batch.set and merge, we can just set it or use a server timestamp
            }, { merge: true });

            processedCount++;
        }

        await batch.commit();

        return new Response(
            JSON.stringify({
                success: true,
                message: `Seeding complete. Processed ${processedCount} platforms.`,
            }),
            { status: 200 }
        );
    } catch (err) {
        console.error("Seeding error:", err);
        return new Response(
            JSON.stringify({ success: false, message: err.message }),
            { status: 500 }
        );
    }
}

// Helper to create doc ref with auto ID since writeBatch.set needs a ref
import { doc } from "firebase/firestore";
