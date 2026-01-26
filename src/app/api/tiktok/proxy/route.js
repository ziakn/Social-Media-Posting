import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url");

    if (!videoUrl) {
        return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 });
    }

    try {
        // Fetch the video from Firebase Storage
        const response = await fetch(videoUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch video from source: ${response.statusText}`);
        }

        const contentType = response.headers.get("Content-Type") || "video/mp4";
        const contentLength = response.headers.get("Content-Length");

        const headers = new Headers();
        headers.set("Content-Type", contentType);
        headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
        headers.set("Access-Control-Allow-Origin", "*");

        if (contentLength) {
            headers.set("Content-Length", contentLength);
        }

        // Stream the response back to TikTok
        return new Response(response.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("TikTok Video Proxy Error:", error);
        return NextResponse.json({
            error: "Failed to proxy video",
            details: error.message
        }, { status: 500 });
    }
}

// Handle HEAD requests separately if needed (TikTok might use HEAD to check file size)
export async function HEAD(request) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url");

    if (!videoUrl) return new Response(null, { status: 400 });

    try {
        const response = await fetch(videoUrl, { method: 'HEAD' });
        const headers = new Headers();
        headers.set("Content-Type", response.headers.get("Content-Type") || "video/mp4");
        headers.set("Content-Length", response.headers.get("Content-Length") || "0");
        headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
        headers.set("Access-Control-Allow-Origin", "*");

        return new Response(null, { status: 200, headers });
    } catch (error) {
        return new Response(null, { status: 500 });
    }
}
