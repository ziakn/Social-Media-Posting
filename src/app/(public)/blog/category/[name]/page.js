import BlogContent from "../../BlogContent";

export async function generateMetadata({ params }) {
    const { name } = await params;
    const categoryName = decodeURIComponent(name)
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return {
        title: `${categoryName} Tips & Guides | SocialHub Blog`,
        description: `Explore ${categoryName} tips, strategies, and tutorials to grow your social media presence. Read expert insights on SocialHub.`,
    };
}

export default function CategoryPage() {
    return <BlogContent />;
}
