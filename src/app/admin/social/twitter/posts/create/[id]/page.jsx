import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import CreateTwitterPost from "@/components/admin/twitter/CreatePost";
import { redirect } from "next/navigation";

export default async function CreateTwitterPostPage({ params }) {
    const user = await verifyToken();

    if (!user) {
        redirect("/auth/login");
    }

    return <CreateTwitterPost userId={user.id} />;
}
