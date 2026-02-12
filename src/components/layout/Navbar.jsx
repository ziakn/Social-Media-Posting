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
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans",
                (isScrolled || isMobileMenuOpen || forceSolid)
                    ? "bg-[rgba(255,255,255,0.85)] backdrop-blur-md py-3 shadow-sm border-b border-[rgba(180,165,200,0.2)]"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-6 max-w-[1440px]">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2.5 group">
                        <div className="bg-[#5e4a7a] p-2 rounded-[12px] text-white transition-all hover:shadow-lg hover:-translate-y-0.5">
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[#2d253b] font-display">
                            Social<span style={{ color: '#5e4a7a' }}>Hub</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 rounded-[20px] text-[0.95rem] font-medium transition-colors",
                                    pathname === link.href
                                        ? "text-[#5e4a7a] bg-[#5e4a7a]/5 font-semibold"
                                        : "text-[#3d3352] hover:text-[#1e172b] hover:bg-black/5"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <Link href="/auth/login">
                            <Button variant="ghost" className="text-[0.95rem] font-semibold text-[#3d3352] hover:text-[#1e172b] hover:bg-transparent rounded-[40px]">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button className="bg-[#2d253b] hover:bg-[#3f3155] text-white font-medium text-[0.9rem] px-6 py-2.5 rounded-[40px] shadow-sm transition-all hover:-translate-y-0.5 border border-[rgba(255,255,255,0.1)]">
                                Start Free
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-[#2d253b]"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={cn(
                    "lg:hidden absolute top-full left-0 right-0 bg-[rgba(255,255,255,0.95)] backdrop-blur-xl border-b border-[rgba(180,165,200,0.2)] p-6 transition-all duration-300 origin-top shadow-xl",
                    isMobileMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
                )}
            >
                <div className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "py-2 text-base font-medium border-b border-gray-100/50",
                                pathname === link.href ? "text-[#5e4a7a] font-bold" : "text-[#3d3352]"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col space-y-3 pt-4">
                        <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full justify-center rounded-[30px] border-[#2d253b] text-[#2d253b] hover:bg-[#2d253b]/5">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full justify-center bg-[#2d253b] hover:bg-[#3f3155] text-white font-bold rounded-[30px]">
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
