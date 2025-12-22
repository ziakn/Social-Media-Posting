"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const socials = useMemo(() => {
    return platforms
      .filter((p) => p.status === "active")
      .map((p) => {
        const IconComponent = ICONS[p.platform_name.toLowerCase()] || null;
        const url = ROUTES[`ADMIN_${p.platform_name.toUpperCase()}`];
        const checkConnection =
          CONNECTION_FUNCTIONS[p.platform_name.toLowerCase()] || null;
        const disconnect =
          DISCONNECT_FUNCTIONS[p.platform_name.toLowerCase()] || null;
        return {
          key: p.platform_name.toLowerCase(),
          name: p.platform_name,
          icon: IconComponent ? (
            <IconComponent className="w-5 h-5 text-blue-600" />
          ) : null,
          description: p.description,
          url: url,
          checkConnection: checkConnection,
          disconnect: disconnect,
          ...p, // keep other fields like id, created_at, status
        };
      });
  }, [platforms]);

  // Fetch active platforms from API
  const fetchPlatforms = async () => {
    try {
      const res = await fetch(API_ROUTES.PLATFORMS, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      // Only update if data actually changed to avoid unnecessary re-renders
      setPlatforms(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(data.platforms)) {
          return data.platforms || [];
        }
        return prev;
      });
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
    const init = async () => {
      setLoading(true);
      await fetchPlatforms();
      setLoading(false);
    };

    init();

    // Silent polling every 30 seconds
    const intervalId = setInterval(() => {
      fetchPlatforms();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (socials.length > 0) {
      fetchConnections();
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
          `${platform.charAt(0).toUpperCase() + platform.slice(1)
          } account connected successfully${name ? `: ${decodeURIComponent(name)}` : ""
          }`
        );
        setConnections((prev) => ({
          ...prev,
          [platform]: {
            connected: true,
            displayName: decodeURIComponent(name),
          },
        }));
      } else {
        toast.error(
          `${platform.charAt(0).toUpperCase() + platform.slice(1)
          } connection failed`
        );
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
  const handleConnect = (platformKey) => {
    const platform = socials.find((p) => p.key === platformKey);
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
              setConnections((prev) => ({ ...prev, [platformKey]: false }));
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
    <div className="p-4 min-h-screen bg-slate-50/50">
      <Card className="shadow-sm border-slate-200/60 bg-white">
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Social Connections</h1>
            <p className="mt-2 text-slate-600">Manage and monitor your connected social media platforms.</p>
          </div>

          {/* Banner for OAuth callback */}
          {callbackStatus === "success" && callbackPlatform && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="bg-emerald-500 p-1 rounded-full">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">
                  Successfully connected{" "}
                  <span className="font-bold capitalize">{callbackPlatform}</span>
                  {callbackName ? ` as ${callbackName}` : ""}.
                </span>
              </div>
            </div>
          )}

          {/* Social Cards Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {socials.map((item) => {
              const status = connections[item.key];
              const isConnected = !!status?.connected;

              // Platform specific colors
              const platformColors = {
                facebook: "hover:border-[#1877F2] group-hover:text-[#1877F2]",
                instagram: "hover:border-[#E4405F] group-hover:text-[#E4405F]",
                twitter: "hover:border-[#000000] group-hover:text-[#000000]",
                linkedin: "hover:border-[#0A66C2] group-hover:text-[#0A66C2]",
                whatsapp: "hover:border-[#25D366] group-hover:text-[#25D366]",
                threads: "hover:border-[#000000] group-hover:text-[#000000]",
                telegram: "hover:border-[#0088cc] group-hover:text-[#0088cc]",
                bluesky: "hover:border-[#0085ff] group-hover:text-[#0085ff]",
                reddit: "hover:border-[#FF4500] group-hover:text-[#FF4500]",
              };

              const accentColor = platformColors[item.key] || "hover:border-primary";

              return (
                <Card
                  key={item.key}
                  className={`group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white flex flex-col h-full ${isConnected ? "border-emerald-100 shadow-sm" : "border-slate-100"
                    } ${accentColor}`}
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 ${isConnected ? "bg-emerald-500" : "bg-transparent group-hover:bg-slate-200"
                    }`} />

                  <CardHeader className="pt-6 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl transition-all duration-300 ${isConnected
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:scale-110"
                          }`}>
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-inherit transition-colors">
                            {item.name}
                          </h3>
                          {isConnected ? (
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Connected</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Not Connected</span>
                          )}
                        </div>
                      </div>

                      {isConnected && item.disconnect && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-slate-100">
                              <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              className="text-slate-600 focus:text-slate-900"
                              onClick={() => (window.location.href = item.url)}
                            >
                              <Globe className="w-4 h-4 mr-2" /> Manage Platform
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                              onClick={() => handleDisconnect(item.key, item.disconnect)}
                            >
                              <LogOut className="w-4 h-4 mr-2" /> Disconnect
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4 flex-1 flex flex-col">
                    <div
                      className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />

                    {isConnected && (
                      <div className="mt-auto space-y-2 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-medium uppercase tracking-tight">Account</span>
                          <span className="text-slate-900 font-bold truncate max-w-[120px]">
                            {status.count > 1 ? `${status.count} Accounts` : status.displayName}
                          </span>
                        </div>

                        {status.tokenExpiresAt && (
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 font-medium uppercase tracking-tight">Expires</span>
                            <span className={`font-bold ${new Date(status.tokenExpiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                              ? "text-amber-600"
                              : "text-slate-700"
                              }`}>
                              {new Date(status.tokenExpiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-0 pb-6 mt-auto">
                    {isConnected ? (
                      <Button
                        variant="outline"
                        className="w-full border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg h-9 text-xs"
                        onClick={() => (window.location.href = item.url)}
                      >
                        View Dashboard
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg h-9 text-xs shadow-md shadow-slate-200 transition-all hover:shadow-lg active:scale-[0.98]"
                        onClick={() => handleConnect(item.key)}
                      >
                        <Link className="w-3.5 h-3.5 mr-2" />
                        Connect Account
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

