export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/portal/", "/api/"],
            },
        ],
        sitemap: "https://social-hub-demo.vercel.app/sitemap.xml",
    };
}
