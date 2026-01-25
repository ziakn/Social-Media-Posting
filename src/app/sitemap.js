export default function sitemap() {
    const baseUrl = "https://social-hub-demo.vercel.app";

    const routes = [
        "",
        "/features",
        "/pricing",
        "/solutions",
        "/blog",
        "/about",
        "/contact",
        "/careers",
        "/changelog",
        "/developers",
        "/guides",
        "/integrations",
        "/roadmap",
        "/status",
        "/terms-of-service",
        "/privacy-policy",
        "/cookie-policy",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: route === "/blog" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.8,
    }));

    return routes;
}
