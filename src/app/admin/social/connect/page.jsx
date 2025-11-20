"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Twitter,
  Send,
  Globe,
  MessageSquare,
  Check,
  Link,
  MoreVertical,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

// Platform-specific actions
import { checkFacebookConnection } from "../../../actions/social/facebook/connectAccount";
import { disconnectFacebookAccount } from "../../../actions/social/facebook/disconnectAccount";
import { checkInstagramConnection } from "../../../actions/social/instagram/connectAccount";
import { disconnectInstagramAccount } from "../../../actions/social/instagram/disconnectAccount";

// Future: WhatsApp, LinkedIn, Twitter, etc.

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

  const [callbackStatus, setCallbackStatus] = useState(null);
  const [callbackPlatform, setCallbackPlatform] = useState(null);
  const [callbackName, setCallbackName] = useState(null);

  const socials = [
    {
      name: "Facebook",
      key: "facebook",
      icon: <Facebook className="w-5 h-5 text-blue-600" />,
      description: "Connect your Facebook Page to enable publishing and analytics.",
      url: ROUTES.ADMIN_FACEBOOK,
      checkConnection: checkFacebookConnection,
      disconnect: disconnectFacebookAccount,
    },
    {
      name: "Instagram",
      key: "instagram",
      icon: <Instagram className="w-5 h-5 text-pink-500" />,
      description: "Link Instagram to manage Reels, Stories, and analytics.",
      url: ROUTES.ADMIN_INSTAGRAM,
      checkConnection: checkInstagramConnection,
      disconnect: disconnectInstagramAccount,
    },
    {
      name: "WhatsApp",
      key: "whatsapp",
      icon: <MessageCircle className="w-5 h-5 text-green-600" />,
      description: "Integrate WhatsApp Business for customer messaging.",
      url: ROUTES.ADMIN_WHATSAPP,
    },
    {
      name: "LinkedIn",
      key: "linkedin",
      icon: <Linkedin className="w-5 h-5 text-blue-500" />,
      description: "Connect LinkedIn to share updates and gather engagement.",
      url: ROUTES.ADMIN_LINKEDIN,
    },
    {
      name: "Twitter",
      key: "twitter",
      icon: <Twitter className="w-5 h-5 text-black" />,
      description: "Post tweets and fetch analytics.",
      url: ROUTES.ADMIN_TWITTER,
    },
    {
      name: "Bluesky",
      key: "bluesky",
      icon: <Globe className="w-5 h-5 text-sky-600" />,
      description: "Manage posts and engagement from Bluesky.",
      url: ROUTES.ADMIN_BLUESKY,
    },
    {
      name: "Reddit",
      key: "reddit",
      icon: <MessageSquare className="w-5 h-5 text-orange-600" />,
      description: "Connect Reddit to schedule posts and track performance.",
      url: ROUTES.ADMIN_REDDIT,
    },
    {
      name: "Telegram",
      key: "telegram",
      icon: <Send className="w-5 h-5 text-sky-500" />,
      description: "Integrate Telegram bots for community management.",
      url: ROUTES.ADMIN_TELEGRAM,
    },
  ];

  // Fetch connections for all platforms
  useEffect(() => {
    const fetchConnections = async () => {
      const conn = { ...connections };

      for (const platform of socials) {
        if (platform.checkConnection) {
          try {
            const result = await platform.checkConnection();
            conn[platform.key] = result.connected
              ? { connected: true, displayName: result.displayName, tokenExpiresAt: result.tokenExpiresAt }
              : false;
          } catch {
            conn[platform.key] = false;
          }
        }
      }

      setConnections(conn);
      setLoading(false);
    };

    fetchConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle OAuth callback query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const platform = params.get("platform");
    const name = params.get("name");

    if (status && platform) {
      setCallbackStatus(status);
      setCallbackPlatform(platform);
      setCallbackName(name ? decodeURIComponent(name) : null);

      if (status === "success") {
        toast.success(
          `${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected successfully${name ? `: ${decodeURIComponent(name)}` : ""}`
        );
        setConnections((prev) => ({
          ...prev,
          [platform]: { connected: true, displayName: decodeURIComponent(name) },
        }));
      } else {
        toast.error(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connection failed`);
      }

      // Clear query params from URL
      if (window.history.replaceState) {
        const url = new URL(window.location);
        url.search = "";
        window.history.replaceState({}, document.title, url);
      }
    }
  }, []);

  const handleConnect = (platformKey) => {
    const platform = socials.find((p) => p.key === platformKey);
    if (!platform || !platform.url) {
      toast.warning(`Integration for ${platformKey} is coming soon!`);
      return;
    }
    window.location.href = `/api/admin/${platformKey}/connect`;
  };

  const handleDisconnect = async (platformKey, disconnectFn) => {
    if (!disconnectFn) {
      toast.warning(`Disconnect not implemented for ${platformKey}`);
      return;
    }
    toast(`Are you sure you want to disconnect ${platformKey}?`, {
      action: {
        label: "Disconnect",
        onClick: async () => {
          try {
            const result = await disconnectFn();
            if (result.success) {
              toast.success(result.message);
              setConnections((prev) => ({ ...prev, [platformKey]: false }));
            } else {
              toast.error(result.message || "Failed to disconnect");
            }
          } catch (err) {
            toast.error(err.message || "Something went wrong");
          }
        },
      },
    });
  };

  if (loading) return <Spinner />;

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      {/* Banner for OAuth callback */}
      {callbackStatus === "success" && callbackPlatform && (
        <div className="mb-6">
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>
              Successfully connected {callbackPlatform.charAt(0).toUpperCase() + callbackPlatform.slice(1)} account
              {callbackName ? `: ${callbackName}` : ""}.
            </span>
          </div>
        </div>
      )}

      {/* Social Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {socials.map((item) => {
          const status = connections[item.key];
          const isConnected = !!status?.connected;

          return (
            <Card key={item.key} className={`transition-all hover:shadow-md ${isConnected ? "border-green-400" : "border-border"}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isConnected ? "bg-green-50" : "bg-muted"}`}>{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    {isConnected && (
                      <Badge variant="secondary" className="mt-1 flex items-center gap-1 text-xs">
                        <Check className="w-3 h-3" /> Connected
                      </Badge>
                    )}
                  </div>
                </div>
                {isConnected && item.disconnect && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDisconnect(item.key, item.disconnect)}>Disconnect</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => (window.location.href = item.url)}>Manage</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardHeader>

              <CardContent>
                <p className="text-xs text-muted-foreground leading-snug">{item.description}</p>
                {isConnected && status.tokenExpiresAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Token expires: {new Date(status.tokenExpiresAt).toLocaleString()}
                  </p>
                )}
              </CardContent>

              <CardFooter>
                {isConnected ? (
                  <div className="text-xs text-muted-foreground">
                    {status.displayName && <div>Name: {status.displayName}</div>}
                  </div>
                ) : (
                  <Button className="w-full" size="sm" onClick={() => handleConnect(item.key)}>
                    <Link className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
