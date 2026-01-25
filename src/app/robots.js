export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/api/"],
            },
        ],
        sitemap: "https://social-hub-demo.vercel.app/sitemap.xml",
    };
}
