import FeaturesContent from "./FeaturesContent";
import JsonLdSchema from "@/components/seo/JsonLdSchema";

export const metadata = {
    title: "Enterprise Social Media Features | UNI.social",
    description: "Explore the advanced social distribution tools, AI media lab, and unified analytics that power UNI.social.",
    keywords: [
        "social media automation features",
        "AI caption generator",
        "multi-platform social hub",
        "enterprise social analytics",
        "bulk social media scheduler"
    ]
};

export default function FeaturesPage() {
    return (
        <>
            <JsonLdSchema type="SoftwareApplication" />
            <FeaturesContent />
        </>
    );
}
