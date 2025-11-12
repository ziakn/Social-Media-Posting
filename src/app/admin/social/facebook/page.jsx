"use client";

import { useEffect, useState } from "react";
import { fetchFacebookPages } from "@/app/actions/social/facebook/getPages";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Facebook,
  MoreVertical,
  ArrowRight,
  RefreshCcw,
  Link,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function FacebookPagesDashboard() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadPages = async () => {
    setLoading(true);

    const res = await fetchFacebookPages();

    if (!res.success) {
      toast.error(res.message || "Failed to load pages");
    } else {
      setPages(res.pages);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPages();
  }, []);

   if (loading) return <Spinner />;


  if (pages.length === 0)
    return (
      <div className="container mx-auto py-10 text-center max-w-xl">
        <div className="bg-neutral-100 rounded-full p-8 mb-6 inline-block shadow-lg">
          <Facebook className="h-16 w-16 text-neutral-700" />
        </div>
        <h2 className="text-3xl font-extrabold text-neutral-800 mb-3">No Facebook Pages Found</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Connect a Facebook Page to unlock post management and analytics features.
        </p>
        <Button
          className="bg-neutral-800 hover:bg-neutral-900 text-white px-8 py-3 text-lg font-semibold shadow-lg rounded-xl"
          size="lg"
          onClick={() => router.push("/admin/social/connect")}
        >
          <Facebook className="h-6 w-6 mr-2 text-white" /> Connect Page
        </Button>
      </div>
    );

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      {/* --- Header --- */}
      <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-800 mb-2">Facebook Page Manager</h1>
          <p className="text-muted-foreground mt-1 text-base">
            Select a page to manage posts, media, and performance analytics.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadPages}
          className="flex items-center gap-2 border-neutral-300 text-neutral-700 hover:bg-neutral-100 shadow-sm font-semibold"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </Button>
      </header>

      {/* --- Page Cards --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pages.map((page) => (
          <Card
            key={page.pageId}
            className="border border-neutral-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100 group"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-neutral-100 rounded-lg">
                  <Facebook className="w-6 h-6 text-neutral-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-neutral-800 group-hover:text-neutral-900 transition-colors duration-200">
                    {page.pageName}
                  </h3>
                  <Badge variant="secondary" className="text-xs mt-1 bg-neutral-200 text-neutral-700">
                    Connected
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-neutral-500">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push(ROUTES.ADMIN_FACEBOOK_POSTS + `/${page.pageId}`)}
                  >
                    Manage Posts
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.info("Insights feature coming soon!")}
                  >
                    View Insights
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast("Disconnect not implemented yet")}
                  >
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-snug">
                Manage and publish posts directly from your connected Facebook page. Review engagement metrics and upload media in one place.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                size="sm"
                className="bg-neutral-800 hover:bg-neutral-900 text-white flex items-center gap-1 rounded-lg shadow"
                onClick={() => router.push(`/admin/social/facebook/posts/${page.pageId}`)}
              >
                Manage Page
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>

      {/* --- Info Card --- */}
      <Card className="mt-12">
        <CardContent className="p-6 flex items-start gap-3">
          <div className="bg-neutral-100 p-2 rounded-lg">
            <Facebook className="w-5 h-5 text-neutral-700" />
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-neutral-800">Secure Facebook Integration</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This integration uses Facebook’s official Graph API with OAuth 2.0. Your credentials are never stored — only access tokens are used for secure communication.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
