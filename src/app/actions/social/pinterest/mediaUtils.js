

import { headers } from "next/headers";

/**
 * Convert relative URL to absolute URL
 */
export async function getAbsoluteUrl(url) {
    if (!url) return url;
    if (url.startsWith('http')) return url;

    try {
        const headerList = await headers();
        const host = headerList.get('host');
        if (!host) return url;

        const protocol = host.includes('localhost') ? 'http' : 'https';
        return `${protocol}://${host}${url.startsWith('/') ? '' : '/'}${url}`;
    } catch (error) {
        console.error("Error getting absolute URL:", error);
        return url;
    }
}

/**
 * Get public test URL for development with uniqueness
 */
export function getTestUrl(type, index = 0) {
    const seed = Date.now() + index;
    let baseUrl;
    if (type === 'video') {
        const videos = [
            "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
        ];
        baseUrl = videos[index % videos.length];
    } else {
        const images = [
            "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&w=1000&q=80"
        ];
        baseUrl = images[index % images.length];
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}t=${seed}`;
}

/**
 * Check if URL needs a test replacement (relative or local)
 */
export function needsTestUrl(url) {
    if (!url) return true;
    if (url.startsWith('blob:')) return true;
    if (url.startsWith('/')) return true;
    if (!url.startsWith('http') && !url.startsWith('blob:')) return true;
    if (url.includes('localhost') || url.includes('127.0.0.1')) return true;
    return false;
}
