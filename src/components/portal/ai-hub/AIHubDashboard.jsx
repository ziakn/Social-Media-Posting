"use client";

import { useEffect, useState, useRef } from "react";
import {
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    Send,
    MessageCircle,
    MessageSquare,
    Sparkles,
    Check,
    AlertCircle
} from "lucide-react";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";
import PinterestLogo from "@/components/icons/PinterestLogo";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import { XLogo } from "@/components/icons/XLogo";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { getDetailedConnectedAccounts } from "@/app/actions/social/getConnectedAccounts";
import { ROUTES } from "@/constants/routes";
import AIComposerModal from "./AIComposerModal";

const PLATFORM_ICONS = {
    facebook: { icon: Facebook, color: "text-[#1877F2]", glow: "shadow-[#1877F2]/40", bg: "bg-[#1877F2]/10" },
    instagram: { icon: Instagram, color: "text-[#E4405F]", glow: "shadow-[#E4405F]/40", bg: "bg-[#E4405F]/10" },
    linkedin: { icon: Linkedin, color: "text-[#0A66C2]", glow: "shadow-[#0A66C2]/40", bg: "bg-[#0A66C2]/10" },
    twitter: { icon: XLogo, color: "text-slate-900", glow: "shadow-slate-900/20", bg: "bg-slate-900/10" },
    threads: { icon: ThreadsLogo, color: "text-slate-900", glow: "shadow-slate-900/20", bg: "bg-slate-900/10" },
    tiktok: { icon: TiktokLogo, color: "text-slate-900", glow: "shadow-slate-900/20", bg: "bg-slate-900/10" },
    youtube: { icon: Youtube, color: "text-[#FF0000]", glow: "shadow-[#FF0000]/40", bg: "bg-[#FF0000]/10" },
    pinterest: { icon: PinterestLogo, color: "text-[#E60023]", glow: "shadow-[#E60023]/40", bg: "bg-[#E60023]/10" },
    bluesky: { icon: BlueSkyLogo, color: "text-[#0085ff]", glow: "shadow-[#0085ff]/40", bg: "bg-[#0085ff]/10" },
    whatsapp: { icon: MessageCircle, color: "text-[#25D366]", glow: "shadow-[#25D366]/40", bg: "bg-[#25D366]/10" },
    telegram: { icon: Send, color: "text-[#0088cc]", glow: "shadow-[#0088cc]/40", bg: "bg-[#0088cc]/10" },
    reddit: { icon: MessageSquare, color: "text-[#FF4500]", glow: "shadow-[#FF4500]/40", bg: "bg-[#FF4500]/10" },
};

export default function AIHubDashboard() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccountIds, setSelectedAccountIds] = useState([]);
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [containerSize, setContainerSize] = useState(700);
    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setIsMounted(true);
        loadAccounts();
    }, []);

    // Measure container size for responsive orbital radius
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                setContainerSize(width);
            }
        };

        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd/Ctrl + K to open composer
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsComposerOpen(true);
            }
            // Cmd/Ctrl + A to select all accounts
            if ((e.metaKey || e.ctrlKey) && e.key === 'a' && accounts.length > 0) {
                e.preventDefault();
                setSelectedAccountIds(accounts.map(a => a.id));
                toast.success(`Selected all ${accounts.length} accounts`);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [accounts]);

    const loadAccounts = async () => {
        setLoading(true);
        const res = await getDetailedConnectedAccounts();
        if (res.success) {
            setAccounts(res.data);
        } else {
            toast.error("Failed to load connected accounts");
        }
        setLoading(false);
    };

    const toggleAccount = (id) => {
        setSelectedAccountIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleComposerSuccess = () => {
        setSelectedAccountIds([]);
        loadAccounts();
    };

    if (!isMounted) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 md:p-6">
                {/* Skeleton Loader */}
                <div className="w-full max-w-[700px]">
                    <div className="relative flex items-center justify-center w-full aspect-square">
                        {/* Skeleton rings */}
                        <div className="absolute w-[85%] h-[85%] border-2 border-slate-200 rounded-full animate-pulse"></div>
                        <div className="absolute w-[60%] h-[60%] border-2 border-slate-200 rounded-full animate-pulse"></div>

                        {/* Skeleton nucleus */}
                        <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 bg-slate-200 rounded-full animate-pulse"></div>

                        {/* Skeleton accounts */}
                        {isMounted && [0, 1, 2, 3, 4, 5].map((i) => {
                            const angle = (i / 6) * 2 * Math.PI;
                            // Responsive radius: 37.5% of container width (between 60% and 85% rings)
                            const radius = containerSize * 0.375;
                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * radius;
                            return (
                                <div
                                    key={i}
                                    className="absolute w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 rounded-2xl animate-pulse"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        transform: `translate(-50%, -50%) translate(${x.toFixed(3)}px, ${y.toFixed(3)}px)`
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    const selectedAccounts = accounts.filter(acc => selectedAccountIds.includes(acc.id));

    return (
        <div className="relative min-h-screen bg-slate-50/50 overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 gap-6 md:gap-10">
            {/* Screen reader announcement for selection changes */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
                {selectedAccountIds.length} of {accounts.length} accounts selected
            </div>

            {/* Central Visualization Area - Fully Responsive */}
            <div ref={containerRef} className="w-full max-w-[90vw] sm:max-w-[600px] md:max-w-[700px]">
                <div className="relative flex items-center justify-center w-full aspect-square">
                    {/* Subtle Background Rings - Responsive */}
                    <div className="absolute w-[85%] h-[85%] border border-slate-200 rounded-full animate-in fade-in zoom-in-95 duration-700"></div>
                    <div className="absolute w-[60%] h-[60%] border border-slate-200 rounded-full animate-in fade-in zoom-in-95 duration-700 delay-100"></div>

                    {/* Central AI Nucleus - Accessible & Responsive */}
                    <button
                        onClick={() => {
                            if (selectedAccountIds.length > 0) {
                                setIsComposerOpen(true);
                            } else {
                                toast.error("Please select at least one social node to launch the composer", {
                                    icon: <AlertCircle className="w-4 h-4 text-red-500" />,
                                    duration: 3000
                                });
                            }
                        }}
                        className="relative z-20 group cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2 rounded-full animate-in fade-in zoom-in-50 duration-700 delay-200"
                        aria-label="Open post composer to create content for selected accounts"
                        aria-haspopup="dialog"
                        title={selectedAccountIds.length > 0 ? "Click to Launch Smart Composer (⌘K)" : "Select a node first"}
                    >
                        {/* Main Circle - Responsive */}
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-primary to-blue-600 rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-white group-hover:shadow-xl transition-all">
                            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">AI</span>
                            <span className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold tracking-widest text-blue-100 uppercase mt-[-4px]">NUCLEUS</span>

                            {/* Click Indicator */}
                            <div className="absolute bottom-3 sm:bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Sparkles className="w-4 h-4 text-white animate-bounce" />
                            </div>
                        </div>

                        {/* Subtle Pulse Ring with animation */}
                        <div className="absolute inset-[-8px] border-2 border-primary/20 rounded-full group-hover:border-primary/40 transition-colors animate-pulse"></div>
                    </button>

                    {/* Orbiting Accounts - Fully Responsive */}
                    {isMounted && accounts.length > 0 ? (
                        (() => {
                            // GROUPING LOGIC: Group accounts by platform
                            const groupedAccounts = accounts.reduce((acc, account) => {
                                const platformKey = account.platform?.toLowerCase();
                                if (!acc[platformKey]) {
                                    acc[platformKey] = [];
                                }
                                acc[platformKey].push(account);
                                return acc;
                            }, {});

                            const uniquePlatforms = Object.keys(groupedAccounts);
                            const totalNodes = uniquePlatforms.length;

                            return uniquePlatforms.map((platformKey, index) => {
                                const platformAccounts = groupedAccounts[platformKey];
                                const angle = (index / totalNodes) * 2 * Math.PI;
                                // Responsive radius: 37.5% of container width (between 60% and 85% rings)
                                const radius = containerSize * 0.375;
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;

                                // Check if ALL accounts of this platform are selected
                                const platformAccountIds = platformAccounts.map(a => a.id);
                                const isSelected = platformAccountIds.every(id => selectedAccountIds.includes(id));
                                // Also check if SOME are selected for partial state (optional UI enhancement)
                                const isPartial = !isSelected && platformAccountIds.some(id => selectedAccountIds.includes(id));

                                const PlatformInfo = PLATFORM_ICONS[platformKey] || { icon: Send, color: "text-slate-600", glow: "shadow-slate-500/20", bg: "bg-slate-500/10" };
                                const Icon = PlatformInfo.icon;
                                // Calculate total reachable targets (pages or profiles)
                                const totalTargets = platformAccounts.reduce((sum, acc) => {
                                    if (Array.isArray(acc.pages) && acc.pages.length > 0) {
                                        return sum + acc.pages.length;
                                    }
                                    return sum + 1;
                                }, 0);

                                const displayName = totalTargets > 1
                                    ? `${totalTargets} Destinations`
                                    : platformAccounts[0].displayName?.split(' ')?.[0] || 'Account';

                                const handlePlatformClick = () => {
                                    // If all are selected, deselect all. Otherwise, select all.
                                    if (isSelected) {
                                        setSelectedAccountIds(prev => prev.filter(id => !platformAccountIds.includes(id)));
                                    } else {
                                        // Add all IDs that aren't already selected
                                        setSelectedAccountIds(prev => {
                                            const newIds = [...prev];
                                            platformAccountIds.forEach(id => {
                                                if (!newIds.includes(id)) newIds.push(id);
                                            });
                                            return newIds;
                                        });
                                    }
                                };

                                return (
                                    <button
                                        key={platformKey}
                                        onClick={handlePlatformClick}
                                        className="absolute z-30 group transition-all duration-300 flex flex-col items-center gap-2 sm:gap-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-2xl p-1 animate-in fade-in zoom-in-50"
                                        style={{
                                            left: '50%',
                                            top: '50%',
                                            transform: `translate(-50%, -50%) translate(${x.toFixed(3)}px, ${y.toFixed(3)}px)`,
                                            animationDelay: `${300 + index * 100}ms`,
                                            animationDuration: '500ms'
                                        }}
                                        aria-label={`${isSelected ? 'Deselect' : 'Select'} all ${platformKey} accounts`}
                                        aria-pressed={isSelected}
                                        title={`${platformKey} - ${displayName}`}
                                    >
                                        <div className={`
                                            relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center
                                            border-2 transition-all duration-300 bg-white shadow-md
                                            ${isSelected
                                                ? `border-primary scale-110 shadow-lg ${PlatformInfo.glow}`
                                                : isPartial
                                                    ? `border-primary/50 border-dashed scale-105 shadow-md`
                                                    : `border-slate-200 hover:border-slate-300 hover:shadow-lg hover:scale-105`
                                            }
                                        `}>
                                            <Icon className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-transform duration-300 ${isSelected ? PlatformInfo.color + " scale-110" : "text-slate-600 group-hover:text-slate-700 group-hover:scale-110"}`} />

                                            {/* Selection Badge with animation */}
                                            {isSelected && (
                                                <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-primary rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
                                                    <Check className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white font-bold" />
                                                </div>
                                            )}

                                            {/* Count Badge for multiple targets (Pages/Profiles) */}
                                            {totalTargets > 1 && !isSelected && (
                                                <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center shadow-sm text-[10px] font-bold text-slate-600">
                                                    {totalTargets}
                                                </div>
                                            )}

                                            {/* Subtle pulse for unselected accounts */}
                                            {!isSelected && (
                                                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className={`text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                                                {platformKey}
                                            </span>
                                            <span className={`text-[8px] sm:text-[8px] md:text-[9px] font-medium transition-colors duration-300 ${isSelected ? 'text-slate-700' : 'text-slate-600'}`}>
                                                {displayName}
                                            </span>
                                        </div>
                                    </button>
                                );
                            });
                        })()
                    ) : isMounted ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-white rounded-full border-2 border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mb-4" />
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2">No Connections Found</h3>
                            <p className="text-slate-600 text-xs sm:text-sm mb-6 px-4">Your social universe is currently empty. Connect your professional profiles to launch your first multi-platform post.</p>
                            <Button
                                className="bg-primary hover:bg-blue-600 rounded-lg px-6 sm:px-8 font-semibold transition-all hover:scale-105"
                                onClick={() => window.location.href = ROUTES.PORTAL_SOCIAL_CONNECT}
                            >
                                Connect Accounts
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>


            {/* Composer Modal */}
            <AIComposerModal
                open={isComposerOpen}
                onOpenChange={setIsComposerOpen}
                selectedAccounts={selectedAccounts}
                onSuccess={handleComposerSuccess}
            />
        </div>
    );
}
