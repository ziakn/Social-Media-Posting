import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import CreateTelegramPost from "@/components/admin/telegram/CreatePost";
import { redirect } from "next/navigation";

export default async function CreateTelegramPostPage({ params }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
        redirect("/auth/login");
    }

    return <CreateTelegramPost userId={user.id} />;
}
