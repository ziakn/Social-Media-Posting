"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Zap,
    Linkedin,
    Twitter,
    Youtube,
    Instagram,
    ShieldCheck,
    Lock,
    Globe
} from "lucide-react";

const Footer = () => {
    const [currentYear, setCurrentYear] = useState(2026); // Default to current year in metadata

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    const footerLinks = {
        Company: [
            { name: "About", href: "/about" },
            { name: "Contact", href: "/contact" },
            { name: "Press", href: "/press" },
        ],
        Resources: [
            { name: "Blog", href: "/blog" },
            { name: "Help Center", href: "/help" },
            { name: "Guides", href: "/guides" },
            { name: "Changelog", href: "/changelog" },
        ],
        Legal: [
            { name: "Terms of Service", href: "/terms-of-service" },
            { name: "Privacy Policy", href: "/privacy-policy" },
            { name: "Data Deletion", href: "/data-deletion" },
            { name: "Cookie Policy", href: "/cookie-policy" },
        ],
        Product: [
            { name: "Platform Overview", href: "/features" },
            { name: "Integrations", href: "/integrations" },
            { name: "Pricing", href: "/pricing" },
            { name: "Roadmap", href: "/roadmap" },
        ],
    };

    const socialLinks = [
        { name: "LinkedIn", icon: <Linkedin className="h-4 w-4" />, href: "#" },
        { name: "X", icon: <Twitter className="h-4 w-4" />, href: "#" },
        { name: "YouTube", icon: <Youtube className="h-4 w-4" />, href: "#" },
        { name: "Instagram", icon: <Instagram className="h-4 w-4" />, href: "#" },
    ];

    return (
        <footer className="bg-gray-900 text-white pt-20 pb-12 font-inter">
            <div className="container mx-auto px-6 max-w-[1440px]">
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="col-span-2 space-y-6">
                        <Link href="/" className="flex items-center space-x-2 group w-fit">
                            <div className="bg-primary p-2 rounded-lg text-white transition-transform group-hover:scale-110">
                                <Zap className="h-5 w-5 fill-current" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight font-display">
                                SocialHub
                            </span>
                        </Link>
                        <p className="text-gray-400 text-base leading-relaxed max-w-sm">
                            The professional command center for scheduling, analyzing, and growing your digital voice across every major platform.
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all border border-white/5"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title} className="col-span-1 space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-primary font-inter">{title}</h4>
                            <ul className="space-y-4">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-400 hover:text-primary transition-colors text-sm font-medium"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <ShieldCheck className="h-3 w-3 text-success" />
                            GDPR
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <Lock className="h-3 w-3 text-info" />
                            AES-256
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <Globe className="h-3 w-3 text-primary" />
                            99.9% Uptime
                        </div>
                    </div>

                    <div className="text-gray-500 text-sm font-medium">
                        © {currentYear} SocialHub Inc. Enterprise Grade Social Management.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
