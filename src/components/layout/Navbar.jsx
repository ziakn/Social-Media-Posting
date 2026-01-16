"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Menu,
    X,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Features", href: "/features" },
        { name: "Solutions", href: "/solutions" },
        { name: "Pricing", href: "/pricing" },
        { name: "Blog", href: "/blog" },
        { name: "About", href: "/about" },
    ];

    const isHomePage = pathname === "/";
    const forceSolid = !isHomePage;

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                (isScrolled || forceSolid)
                    ? "bg-white/95 backdrop-blur-md py-3 shadow-sm border-b border-slate-100"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="flex items-center justify-between">
                    {/* Logo - Inter Bold */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="bg-[#0C1B33] p-2 rounded-[6px] text-[#F9C80E] transition-all hover:shadow-subtle hover:-translate-y-0.5">
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-[#0C1B33] font-plus-jakarta">
                            SocialHub
                        </span>
                    </Link>

                    {/* Desktop Navigation - DM Sans Medium */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors font-inter",
                                    pathname === link.href
                                        ? "text-[#00A2FF]"
                                        : "text-[#3E4652] hover:text-[#0C1B33] hover:bg-slate-50"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden lg:flex items-center space-x-4 font-plus-jakarta">
                        <Link href="/auth/login">
                            <button className="text-sm font-bold text-[#0C1B33] px-4 py-2 hover:opacity-70 transition-opacity">
                                Sign In
                            </button>
                        </Link>
                        <Link href="/auth/register">
                            <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-sm px-6 py-3 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle hover:-translate-y-0.5 active:translate-y-0">
                                Start Free
                            </button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-[#0C1B33]"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={cn(
                    "lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 transition-all duration-300 origin-top shadow-xl",
                    isMobileMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
                )}
            >
                <div className="flex flex-col space-y-4 font-inter">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "py-2 text-base font-bold",
                                pathname === link.href ? "text-[#00A2FF]" : "text-[#3E4652]"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <hr className="border-slate-100" />
                    <div className="flex flex-col space-y-3 pt-2 font-plus-jakarta">
                        <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <button className="w-full py-4 rounded-[8px] font-bold text-[#0C1B33] border border-slate-200">
                                Sign In
                            </button>
                        </Link>
                        <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                            <button className="w-full bg-[#F9C80E] text-[#0C1B33] rounded-[6px] py-4 font-black shadow-subtle translate-y-0">
                                Start Free
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
