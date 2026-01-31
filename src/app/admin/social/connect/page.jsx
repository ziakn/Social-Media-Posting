"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  LogOut,
  Music,
  Youtube,
  RefreshCw,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";
import PinterestLogo from "@/components/icons/PinterestLogo";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

const ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  twitter: Twitter,
  telegram: Send,
  bluesky: BlueSkyLogo,
  reddit: MessageSquare,
  threads: ThreadsLogo,
  tiktok: TiktokLogo,
  youtube: Youtube,
  pinterest: PinterestLogo,
};

// Platform-specific actions
import { checkFacebookConnection } from "../../../actions/social/facebook/connectAccount";
import { disconnectFacebookAccount } from "../../../actions/social/facebook/disconnectAccount";
import { checkInstagramConnection } from "../../../actions/social/instagram/connectAccount";
import { disconnectInstagramAccount } from "../../../actions/social/instagram/disconnectAccount";
import { checkThreadsConnection } from "../../../actions/social/threads/connectAccount";
import { disconnectThreadsAccount } from "../../../actions/social/threads/disconnectAccount";
import { checkTwitterConnection } from "../../../actions/social/twitter/connectAccount";
import { disconnectTwitterAccount } from "../../../actions/social/twitter/disconnectAccount";
import { checkYoutubeConnection } from "../../../actions/social/youtube/connectAccount";
import { disconnectYoutubeAccount } from "../../../actions/social/youtube/disconnectAccount";
import { checkLinkedinConnection } from "../../../actions/social/linkedin/connectAccount";
import { disconnectLinkedinAccount } from "../../../actions/social/linkedin/disconnectAccount";
import { checkPinterestConnection } from "../../../actions/social/pinterest/connectAccount";
import { disconnectPinterestAccount } from "../../../actions/social/pinterest/disconnectAccount";
import { checkTiktokConnection } from "../../../actions/social/tiktok/connectAccount";
import { disconnectTiktokAccount } from "../../../actions/social/tiktok/disconnectAccount";
import { checkBlueSkyConnection } from "../../../actions/social/bluesky/connectAccount";
import { disconnectBlueSkyAccount } from "../../../actions/social/bluesky/disconnectAccount";
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import { getUserUsageAction } from "../../../actions/usage/usageActions";
import { Progress } from "@/components/ui/progress";

const CONNECTION_FUNCTIONS = {
  facebook: checkFacebookConnection,
  instagram: checkInstagramConnection,
  threads: checkThreadsConnection,
  twitter: checkTwitterConnection,
  youtube: checkYoutubeConnection,
  linkedin: checkLinkedinConnection,
  tiktok: checkTiktokConnection,
  bluesky: checkBlueSkyConnection,
  pinterest: checkPinterestConnection,
};

const DISCONNECT_FUNCTIONS = {
  facebook: disconnectFacebookAccount,
  instagram: disconnectInstagramAccount,
  threads: disconnectThreadsAccount,
  twitter: disconnectTwitterAccount,
  youtube: disconnectYoutubeAccount,
  linkedin: disconnectLinkedinAccount,
  tiktok: disconnectTiktokAccount,
  bluesky: disconnectBlueSkyAccount,
  pinterest: disconnectPinterestAccount,
};

export default function SocialConnectPage() {
  const [platforms, setPlatforms] = useState([]);
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(true);
  const [callbackStatus, setCallbackStatus] = useState(null);
  const [callbackPlatform, setCallbackPlatform] = useState(null);
  const [callbackName, setCallbackName] = useState(null);
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);

  // Multi-account management state
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  const socials = useMemo(() => {
    return platforms
      .filter((p) => p.status === "active")
      .map((p) => {
        const platformKey = p.platform_name.toLowerCase();
        const IconComponent = ICONS[platformKey] || null;
        const url = ROUTES[`ADMIN_${p.platform_name.toUpperCase()}`];
        const checkConnection = CONNECTION_FUNCTIONS[platformKey] || null;
        const disconnect = DISCONNECT_FUNCTIONS[platformKey] || null;

        const iconColors = {
          facebook: "text-[#1877F2]",
          instagram: "text-[#E4405F]",
          twitter: "text-[#000000]",
          linkedin: "text-[#0A66C2]",
          whatsapp: "text-[#25D366]",
          threads: "text-black",
          telegram: "text-[#0088cc]",
          bluesky: "text-[#0085ff]",
          reddit: "text-[#FF4500]",
          tiktok: "text-[#000000]",
          youtube: "text-[#FF0000]",
          pinterest: "text-[#E60023]",
        };

        return {
          key: platformKey,
          name: p.platform_name,
          icon: IconComponent ? (
            <IconComponent className={`w-5 h-5 ${iconColors[platformKey] || "text-primary"}`} />
          ) : null,
          description: p.description,
          url: url,
          checkConnection: checkConnection,
          disconnect: disconnect,
          ...p,
        };
      });
  }, [platforms]);

  const fetchPlatforms = async () => {
    try {
      const res = await fetch(API_ROUTES.PLATFORMS);
      const data = await res.json();
      setPlatforms(data.platforms || []);
    } catch (error) {
      console.error("Error fetching platforms:", error);
    }
  };

  const fetchConnections = async () => {
    // Initialize loading state for all platforms that have a check function
    const initialLoadingState = {};
    socials.forEach(platform => {
      if (platform.checkConnection) {
        initialLoadingState[platform.key] = { connected: false, loading: true };
      }
    });
    setConnections(prev => ({ ...prev, ...initialLoadingState }));

    socials.forEach(async (platform) => {
      if (platform.checkConnection) {
        try {
          const result = await platform.checkConnection();
          setConnections(prev => ({
            ...prev,
            [platform.key]: result.connected
              ? { connected: true, ...result, loading: false }
              : { connected: false, loading: false }
          }));
        } catch (error) {
          setConnections(prev => ({ ...prev, [platform.key]: { connected: false, loading: false } }));
        }
      }
    });
  };

  const fetchUsage = async () => {
    setUsageLoading(true);
    try {
      const result = await getUserUsageAction();
      if (result.success) {
        setUsage(result.usage);
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
    } finally {
      setUsageLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPlatforms(), fetchUsage()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (socials.length > 0) fetchConnections();
  }, [socials]);

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
        toast.success(`${platform} connected successfully!`);
      } else {
        toast.error(`${platform} connection failed.`);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleConnect = (platformKey) => {
    // Both BlueSky and others now use the same API route pattern
    window.location.href = `/api/admin/${platformKey}/connect`;
  };

  const handleDisconnectAccount = async (platformKey, accountId, disconnectFn) => {
    toast(`Are you sure you want to disconnect this account?`, {
      action: {
        label: "Disconnect",
        onClick: async () => {
          try {
            // Updated disconnect functions should ideally take an accountId
            // for now we use the general one if it doesn't support IDs yet
            const result = await disconnectFn(accountId);
            if (result?.success) {
              toast.success("Account disconnected");
              fetchConnections();
            } else {
              toast.error(result?.message || "Failed to disconnect");
            }
          } catch (err) {
            toast.error("Something went wrong");
          }
        },
      },
    });
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-6 min-h-screen bg-slate-50/50">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Social Connections</h1>
            <p className="mt-2 text-slate-600">Securely connect and manage your professional social profiles.</p>
          </div>

          {usage && (
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm min-w-[300px] md:min-w-[450px]">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Accounts</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      {usage.accounts.used} / {usage.accounts.limit === -1 ? '∞' : usage.accounts.limit}
                    </span>
                    <span className="bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                      {usage.accounts.limit === -1 ? '∞' : Math.max(0, usage.accounts.limit - usage.accounts.used)} Left
                    </span>
                  </div>
                </div>
                <Progress value={usage.accounts.percent} className="h-1.5 bg-slate-100" />
              </div>

              <div className="hidden sm:block w-px bg-slate-100 mx-2" />

              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Monthly Posts</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      {usage.posts.used} / {usage.posts.limit === -1 ? '∞' : usage.posts.limit}
                    </span>
                    <span className="bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                      {usage.posts.limit === -1 ? '∞' : Math.max(0, usage.posts.limit - usage.posts.used)} Left
                    </span>
                  </div>
                </div>
                <Progress value={usage.posts.percent} className="h-1.5 bg-slate-100" />
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {socials.map((item) => {
            const status = connections[item.key];
            const isConnected = !!status?.connected;
            const accountCount = status?.count || 0;
            const isChecking = status?.loading !== false; // Default to true (loading) if undefined

            return (
              <Card key={item.key} className="flex flex-col h-full border-slate-200 hover:shadow-lg transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                      {item.icon}
                    </div>
                    {isChecking ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                        Checking
                      </span>
                    ) : isConnected && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.description}</p>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  {isConnected && !isChecking ? (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-medium">
                        <span className="text-slate-400 uppercase">Accounts</span>
                        <span className="text-slate-900">{accountCount} Profile{accountCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-10" />
                  )}
                </CardContent>

                <CardFooter className="pt-2">
                  {isChecking ? (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full text-xs font-semibold bg-slate-50 text-slate-400"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Checking Status...
                    </Button>
                  ) : isConnected ? (
                    <Button
                      variant="outline"
                      className="w-full text-xs font-semibold"
                      onClick={() => {
                        setSelectedPlatform(item);
                        setIsManageDialogOpen(true);
                      }}
                    >
                      <MoreVertical className="w-3.5 h-3.5 mr-2" />
                      Manage Accounts
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <Button
                        className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-semibold"
                        onClick={() => handleConnect(item.key)}
                        disabled={usage && usage.accounts.used >= usage.accounts.limit && usage.accounts.limit !== -1}
                      >
                        <Link className="w-3.5 h-3.5 mr-2" />
                        {usage && usage.accounts.used >= usage.accounts.limit && usage.accounts.limit !== -1
                          ? "Limit Reached"
                          : `Connect ${item.name}`}
                      </Button>

                      {usage && usage.accounts.used >= usage.accounts.limit && usage.accounts.limit !== -1 && (
                        <Button
                          variant="ghost"
                          className="w-full text-[10px] h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold uppercase tracking-tight"
                          onClick={() => window.location.href = '/admin/subscription'}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Upgrade Plan
                        </Button>
                      )}
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Multi-Account Management Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedPlatform && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedPlatform.icon}
                  Manage {selectedPlatform.name} Accounts
                </DialogTitle>
                <DialogDescription>
                  Connect additional profiles or manage existing ones.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 my-4">
                {connections[selectedPlatform.key]?.accounts?.map((acc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                        {acc.displayName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{acc.displayName}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">
                          Expires: {acc.tokenExpiresAt ? new Date(acc.tokenExpiresAt).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-rose-600"
                        onClick={() => handleDisconnectAccount(selectedPlatform.key, acc.id, selectedPlatform.disconnect)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <Button
                  className="w-full bg-slate-900"
                  onClick={() => handleConnect(selectedPlatform.key)}
                  disabled={usage && usage.accounts.used >= usage.accounts.limit && usage.accounts.limit !== -1}
                >
                  <Link className="w-3.5 h-3.5 mr-2" />
                  {usage && usage.accounts.used >= usage.accounts.limit && usage.accounts.limit !== -1
                    ? "Account Limit Reached"
                    : "Connect Another Account"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = selectedPlatform.url}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                  Go to {selectedPlatform.name} Dashboard
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
