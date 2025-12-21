"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { API_ROUTES } from "@/constants/api";
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
  AtSign,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

const ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  twitter: Twitter,
  telegram: Send,
  bluesky: Globe,
  reddit: MessageSquare,
  threads: AtSign,
};
// Platform-specific actions
import { checkFacebookConnection } from "../../../actions/social/facebook/connectAccount";
import { disconnectFacebookAccount } from "../../../actions/social/facebook/disconnectAccount";
import { checkInstagramConnection } from "../../../actions/social/instagram/connectAccount";
import { disconnectInstagramAccount } from "../../../actions/social/instagram/disconnectAccount";
import { checkThreadsConnection } from "../../../actions/social/threads/connectAccount";
import { disconnectThreadsAccount } from "../../../actions/social/threads/disconnectAccount";

const CONNECTION_FUNCTIONS = {
  facebook: checkFacebookConnection,
  instagram: checkInstagramConnection,
  threads: checkThreadsConnection,
};

// Map platform keys to disconnect functions
const DISCONNECT_FUNCTIONS = {
  facebook: disconnectFacebookAccount,
  instagram: disconnectInstagramAccount,
  threads: disconnectThreadsAccount,
};

export default function SocialConnectPage() {
  const [platforms, setPlatforms] = useState([]);
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(true);
  const [callbackStatus, setCallbackStatus] = useState(null);
  const [callbackPlatform, setCallbackPlatform] = useState(null);
  const [callbackName, setCallbackName] = useState(null);

  // Merge Firestore active platforms with master socials
 const socials = platforms
  .filter(p => p.status === "active").map(p => {
  const IconComponent = ICONS[p.platform_name.toLowerCase()] || null; 
  const url = ROUTES[`ADMIN_${p.platform_name.toUpperCase()}`];
  const checkConnection = CONNECTION_FUNCTIONS[p.platform_name.toLowerCase()] || null;
  const disconnect = DISCONNECT_FUNCTIONS[p.platform_name.toLowerCase()] || null;
  return {
  key: p.platform_name.toLowerCase(),
  name: p.platform_name,
  icon: IconComponent ? <IconComponent className="w-5 h-5 text-blue-600" /> : null,
  description: p.description,
  url: url,
  checkConnection:  checkConnection,
  disconnect: disconnect,
  ...p, // keep other fields like id, created_at, status
}
});

  // Fetch active platforms from API
  const fetchPlatforms = async () => {
    try {
      const res = await fetch(API_ROUTES.PLATFORMS, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setPlatforms(data.platforms || []);
    } catch (error) {
      console.error("Error fetching platforms:", error);
    }
  };

  // Fetch connection status for active platforms
  const fetchConnections = async () => {
    const conn = {};
    for (const platform of socials) {
      if (platform.checkConnection) {
        try {
          const result = await platform.checkConnection();
          conn[platform.key] = result.connected
            ? {
                connected: true,
                displayName: result.displayName,
                tokenExpiresAt: result.tokenExpiresAt,
                count: result.count,
                accounts: result.accounts,
              }
            : false;
        } catch {
          conn[platform.key] = false;
        }
      } else {
        conn[platform.key] = false;
      }
    }
    setConnections(conn);
  };

  // Load platforms and connections
  useEffect(() => {
  let intervalId;

  const init = async () => {
    setLoading(true);
    await fetchPlatforms(); // your API call
    setLoading(false);
  };

  init();
  intervalId = setInterval(() => {
    init();
  }, 10000);
  return () => clearInterval(intervalId);
}, []);

  useEffect(() => {
    if (socials.length > 0) {
      fetchConnections().finally(() => setLoading(false));
    }
  }, [socials]);

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
          `${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected successfully${
            name ? `: ${decodeURIComponent(name)}` : ""
          }`
        );
        setConnections(prev => ({
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

  // Connect / Disconnect handlers
  const handleConnect = platformKey => {
    const platform = socials.find(p => p.key === platformKey);
    if (!platform) {
      toast.warning(`Integration for ${platformKey} is coming soon!`);
      return;
    }
    window.location.href = platform.url || `/api/admin/${platformKey}/connect`;
  };

  const handleDisconnect = (platformKey, disconnectFn) => {
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
            if (result?.success) {
              toast.success(result.message || "Disconnected successfully");
              setConnections(prev => ({ ...prev, [platformKey]: false }));
            } else {
              toast.error(result?.message || "Failed to disconnect");
            }
          } catch (err) {
            toast.error(err?.message || "Something went wrong");
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
        {socials.map(item => {
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
                <p className="text-xs text-muted-foreground leading-snug">
                  <div
                    className="prose text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                </p>
                {isConnected && status.tokenExpiresAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Token expires: {new Date(status.tokenExpiresAt).toLocaleString()}
                  </p>
                )}
              </CardContent>

              <CardFooter>
                {isConnected ? (
                  <div className="text-xs text-muted-foreground">
                    {status.count > 1 ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{status.count} Accounts Connected:</span>
                        <ul className="list-disc list-inside pl-1">
                          {status.accounts.slice(0, 3).map((acc, i) => (
                            <li key={i} className="truncate">{acc.displayName}</li>
                          ))}
                          {status.count > 3 && <li>+ {status.count - 3} more</li>}
                        </ul>
                      </div>
                    ) : (
                      status.displayName && <div>Name: {status.displayName}</div>
                    )}
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
