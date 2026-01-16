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
        { name: "Pricing", href: "/pricing" },
        { name: "Blog", href: "/blog" },
        { name: "Help Center", href: "/help" },
        { name: "About", href: "/about" },
    ];

    const isHomePage = pathname === "/";
    const forceSolid = !isHomePage;

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                (isScrolled || forceSolid)
                    ? "bg-white/95 backdrop-blur-md py-3 shadow-sm border-b border-gray-100"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-6 max-w-[1440px]">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="bg-primary p-2 rounded-[10px] text-white transition-all hover:shadow-lg hover:-translate-y-0.5">
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900 font-display">
                            SocialHub
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors font-inter",
                                    pathname === link.href
                                        ? "text-primary bg-primary/5"
                                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden lg:flex items-center space-x-4 font-inter">
                        <Link href="/auth/login">
                            <Button variant="ghost" className="text-sm font-semibold text-gray-900 hover:text-primary hover:bg-transparent">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-sm px-6 py-2 rounded-[8px] shadow-sm transition-all hover:-translate-y-0.5">
                                Start Free
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-gray-900"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={cn(
                    "lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 transition-all duration-300 origin-top shadow-xl",
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
                                pathname === link.href ? "text-primary" : "text-gray-600"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <hr className="border-gray-100" />
                    <div className="flex flex-col space-y-3 pt-2">
                        <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full justify-center">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full justify-center bg-primary hover:bg-primary/90 text-white font-bold">
                                Start Free
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
