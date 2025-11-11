"use client";

import { useEffect, useState } from "react";
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
  Instagram,
  Linkedin,
  MessageCircle,
  Check,
  Link,
  MoreVertical,
  Twitter,
  Send,
  Globe,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { checkFacebookConnection } from "../../../actions/social/facebook/connectAccount";
import { disconnectFacebookAccount } from "../../../actions/social/facebook/disconnectAccount";
import { toast } from "sonner";

export default function SocialConnectPage() {
  const [connections, setConnections] = useState({
    facebook: false,
    instagram: false,
    whatsapp: false,
    linkedin: false,
    twitter: false,
    bluesky: false,
    reddit: false,
    telegram: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnections = async () => {
      try {

        const result = await checkFacebookConnection();

        if (result.connected) {
          setConnections((prev) => ({ ...prev, facebook: true }));
        }
      } catch (err) {
        console.error("Error checking connection:", err);
      }
    };

    checkConnections();
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success" && params.get("platform")) {
      const platform = params.get("platform");
      setConnections((prev) => ({ ...prev, [platform]: true }));
    }

    setTimeout(() => setLoading(false), 500);

  }, []);



  const handleConnect = (platform) => {
    if (platform === "facebook") {
      window.location.href = "/api/admin/facebook/connect";
    } else {
      alert(`Integration for ${platform} is coming soon!`);
    }
  };


  const handleDisconnect = async (platform) => {
    toast("Are you sure you want to Disconnect " + platform + "?", {
      action: {
        label: "Disconnect",
        onClick: async () => {
          try {
            if (platform === "facebook") {
              const result = await disconnectFacebookAccount();
              if (result.success) {
                toast.success(result.message);
                setConnections((prev) => ({ ...prev, facebook: false }));
              } else {
                toast.error(error.message)
              }
            }
          } catch (error) {
            toast.error(error.message)
          }
        },
      },
    });
  };


  const socials = [
    {
      name: "Facebook",
      key: "facebook",
      icon: <Facebook className="w-5 h-5 text-blue-600" />,
      description:
        "Connect your Facebook Page to enable publishing and insights analytics.",
    },
    {
      name: "Instagram",
      key: "instagram",
      icon: <Instagram className="w-5 h-5 text-pink-500" />,
      description:
        "Link your Instagram to manage Reels, Stories, and analytics.",
    },
    {
      name: "WhatsApp",
      key: "whatsapp",
      icon: <MessageCircle className="w-5 h-5 text-green-600" />,
      description:
        "Integrate WhatsApp Business for customer messaging and automation.",
    },
    {
      name: "LinkedIn",
      key: "linkedin",
      icon: <Linkedin className="w-5 h-5 text-blue-500" />,
      description:
        "Connect LinkedIn to share professional updates and gather engagement data.",
    },
    {
      name: "X (Twitter)",
      key: "twitter",
      icon: <Twitter className="w-5 h-5 text-black" />,
      description:
        "Post tweets and fetch analytics directly from your connected X account.",
    },
    {
      name: "Bluesky",
      key: "bluesky",
      icon: <Globe className="w-5 h-5 text-sky-600" />,
      description:
        "Manage posts and engagement from your decentralized Bluesky account.",
    },
    {
      name: "Reddit",
      key: "reddit",
      icon: <MessageSquare className="w-5 h-5 text-orange-600" />,
      description:
        "Connect Reddit to schedule posts and track subreddit performance.",
    },
    {
      name: "Telegram",
      key: "telegram",
      icon: <Send className="w-5 h-5 text-sky-500" />,
      description:
        "Integrate Telegram bots for community management and updates.",
    },
  ];

  const connectedCount = Object.values(connections).filter(Boolean).length;
  if (loading) return <Spinner />;

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      {/* --- Header --- */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Social Media Integrations
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Connect your social accounts to manage and automate content from one
          dashboard.
        </p>
      </header>

      {/* --- Stats --- */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Connected" value={connectedCount} accent="text-green-600" />
        <StatCard label="Available" value={socials.length - connectedCount} accent="text-blue-600" />
        <StatCard label="Total Platforms" value={socials.length} />
        <StatCard label="Features" value="8" />
      </section>

      {/* --- Social Cards --- */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {socials.map((item) => {
          const isConnected = connections[item.key];
          return (
            <Card
              key={item.key}
              className={`transition-all hover:shadow-md ${isConnected ? "border-green-400" : "border-border"
                }`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${isConnected ? "bg-green-50" : "bg-muted"
                      }`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    {isConnected && (
                      <Badge
                        variant="secondary"
                        className="mt-1 flex items-center gap-1 text-xs"
                      >
                        <Check className="w-3 h-3" /> Connected
                      </Badge>
                    )}
                  </div>
                </div>

                {isConnected && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDisconnect(item.key)}>
                        Disconnect
                      </DropdownMenuItem>
                      <DropdownMenuItem>Manage Settings</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardHeader>

              <CardContent>
                <p className="text-xs text-muted-foreground leading-snug">
                  {item.description}
                </p>
              </CardContent>

              <CardFooter>
                {isConnected ? (
                  <div className="flex w-full gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDisconnect(item.key)}
                    >
                      Disconnect
                    </Button>
                    <Button variant="default" size="sm" className="flex-1">
                      <Link className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleConnect(item.key)}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </section>

      {/* --- Security Info --- */}
      <Card className="mt-10">
        <CardContent className="flex items-start gap-3 p-6">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Check className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold mb-2">Secure OAuth Connection</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All integrations use secure OAuth 2.0 protocols. Your passwords are never stored,
              and access is limited to permissions you grant explicitly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* --- Stat Card Component --- */
function StatCard({ label, value, accent }) {
  return (
    <Card className="text-center">
      <CardContent className="p-4">
        <div className={`text-2xl font-bold ${accent || ""}`}>{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
