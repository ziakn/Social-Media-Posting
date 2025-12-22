import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import TwitterDashboardClient from "./TwitterDashboardClient";

export default async function TwitterDashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
        redirect("/auth/login");
    }

    return <TwitterDashboardClient userId={user.id} />;
}
