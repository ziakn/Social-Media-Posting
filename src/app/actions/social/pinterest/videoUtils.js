"use server";

import { getAbsoluteUrl, getTestUrl, needsTestUrl } from "./mediaUtils";

/**
 * Upload a video to Pinterest via the Media API
 * Flow: Register -> Upload -> Poll Status
 * Returns the media_id
 */
export async function uploadPinterestVideo(accessToken, videoUrl) {
    if (!videoUrl) throw new Error("Video URL is required");

    const apiUrl = process.env.PINTEREST_API_URL || "https://api.pinterest.com/v5";

    // 1. Resolve Video URL (handle localhost/test logic)
    // Note: For real uploads, we need the actual file content or a public URL.
    // Ideally, the server fetches the stream if it's external, or reads from FS if local (but usually inputs are URLs).
    const finalVideoUrl = needsTestUrl(videoUrl) ? getTestUrl("video") : await getAbsoluteUrl(videoUrl);
    console.log("Starting Pinterest Video Upload for:", finalVideoUrl);

    // 2. Register Upload
    const registerResponse = await fetch(`${apiUrl}/media`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            media_type: "video"
        })
    });

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
        throw new Error(registerData.message || "Failed to register video upload");
    }

    const { media_id, upload_url, upload_parameters } = registerData;
    console.log("Video registered. Media ID:", media_id);

    // 3. Upload File
    // We need to fetch the file content from the source URL first
    // Then form-data POST it to the upload_url with parameters

    // Fetch video stream
    const videoFileResponse = await fetch(finalVideoUrl);
    if (!videoFileResponse.ok) throw new Error("Failed to fetch source video file");
    const videoBlob = await videoFileResponse.blob();

    // Construct Form Data for Upload
    const formData = new FormData();
    // Pinterest requires specific parameters to be in the form data
    for (const [key, value] of Object.entries(upload_parameters)) {
        formData.append(key, value);
    }
    formData.append("file", videoBlob);

    console.log("Uploading video file to:", upload_url);
    const uploadResponse = await fetch(upload_url, {
        method: "POST",
        body: formData
    });

    if (!uploadResponse.ok) {
        // Some S3/upload endpoints return XML on error, but usually status code is enough
        throw new Error(`Failed to upload video file to Pinterest storage: ${uploadResponse.statusText}`);
    }

    // 4. Poll for Status
    // Media needs to be processed. We poll until "succeeded" or "failed".
    let status = "registering";
    let attempts = 0;
    const maxAttempts = 20; // 20 * 3s = 60s timeout roughly

    while (status !== "succeeded" && status !== "failed" && attempts < maxAttempts) {
        attempts++;
        await new Promise(r => setTimeout(r, 3000)); // Wait 3s

        const statusResponse = await fetch(`${apiUrl}/media/${media_id}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (!statusResponse.ok) {
            console.warn("Check media status failed:", await statusResponse.text());
            continue;
        }

        const statusData = await statusResponse.json();
        status = statusData.status;
        console.log(`Video processing status (${attempts}/${maxAttempts}):`, status);

        if (status === "failed") {
            throw new Error("Pinterest failed to process the video.");
        }
    }

    if (status !== "succeeded") {
        throw new Error("Video upload timed out processing.");
    }

    console.log("Video upload completed and processed. Media ID:", media_id);
    return media_id;
}
