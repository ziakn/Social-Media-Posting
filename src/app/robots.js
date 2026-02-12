export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/portal", "/api", "/auth"],
            },
        ],
        sitemap: "https://social-hub-demo.vercel.app/sitemap.xml",
    };
}
