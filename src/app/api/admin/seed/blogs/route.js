import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";

export async function GET() {
    try {
        const categories = [
            "Platform Guides",
            "Strategy & Insights",
            "Creator Growth",
            "Agency Workflows",
            "News & Updates",
        ];

        const authors = ["Sarah Jenkins", "Michael Ross", "Jessica Li", "David Kim", "Emily Chen"];

        const dummyPosts = [];
        // Generate 24 posts to ensure we have 4 pages of 6
        for (let i = 1; i <= 24; i++) {
            const category = categories[i % categories.length];
            // Date logic: decreasing dates to ensure order is visible
            // i=1 (newest), i=24 (oldest)
            // Just subtracting days from today
            const dateObj = new Date();
            dateObj.setDate(dateObj.getDate() - i);
            const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

            dummyPosts.push({
                title: `Scalable Social Growth Strategy #${i} for ${category}`,
                excerpt: `This is a generated summary for post #${i}. Learn how to optimize your ${category} workflows effectively in 2026 with AI-driven insights.`,
                category: category,
                author: authors[i % authors.length],
                date: dateStr,
                readTime: `${5 + (i % 5)} min read`,
                image: `https://images.unsplash.com/photo-${1600000000000 + i}?q=80&w=1000&auto=format&fit=crop`, // Fake consistent placeholder
                slug: `scalable-growth-strategy-${i}-${category.toLowerCase().replace(/ /g, '-')}-${Date.now()}`,
                featured: i % 5 === 0, // Every 5th post is featured
                status: "published",
                content: `<h2>Generated Content for Post ${i}</h2><p>This is a dummy post to test pagination.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
                userId: "system-seed-batch"
            });
        }

        let inserted = 0;
        let skipped = 0;

        for (const post of dummyPosts) {
            // Check if it already exists by slug
            const q = query(collection(db, "blogs"), where("slug", "==", post.slug));
            const existing = await getDocs(q);

            if (existing.empty) {
                // Manually create timestamps to distribute them if sorting depends on createdAt too
                // But our query sorts by 'date' string.
                await addDoc(collection(db, "blogs"), {
                    ...post,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
                inserted++;
            } else {
                skipped++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Batch seeding completed. Inserted: ${inserted}, Skipped: ${skipped}`,
        });
    } catch (error) {
        console.error("❌ Error seeding blogs:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
