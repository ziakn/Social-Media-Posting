"use client";

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
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Platform: [
            { name: "Features", href: "/features" },
            { name: "Solutions", href: "/solutions" },
            { name: "Pricing", href: "/pricing" },
        ],
        Resources: [
            { name: "Blog", href: "/blog" },
            { name: "User Guide", href: "/guide" },
            { name: "Help Center", href: "/help" },
        ],
        Company: [
            { name: "About", href: "/about" },
            { name: "Careers", href: "/careers" },
            { name: "Contact", href: "/contact" },
        ],
        Legal: [
            { name: "Privacy Policy", href: "/privacy-policy" },
            { name: "Terms of Service", href: "/terms-of-service" },
            { name: "Cookie Policy", href: "/cookie-policy" },
            { name: "Data Deletion", href: "/data-deletion" },
        ],
    };

    const socialLinks = [
        { name: "LinkedIn", icon: <Linkedin className="h-4 w-4" />, href: "#" },
        { name: "X", icon: <Twitter className="h-4 w-4" />, href: "#" },
        { name: "YouTube", icon: <Youtube className="h-4 w-4" />, href: "#" },
        { name: "Instagram", icon: <Instagram className="h-4 w-4" />, href: "#" },
    ];

    return (
        <footer className="bg-[#0C1B33] text-white pt-20 pb-12 font-inter">
            <div className="container mx-auto px-6 max-w-[1200px]">
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="col-span-2 space-y-6">
                        <Link href="/" className="flex items-center space-x-2 group w-fit">
                            <div className="bg-[#F9C80E] p-2 rounded-lg text-[#0C1B33] transition-transform group-hover:scale-110">
                                <Zap className="h-5 w-5 fill-current" />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight font-plus-jakarta">
                                SocialHub
                            </span>
                        </Link>
                        <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                            The professional command center for scheduling, analyzing, and growing your digital voice across every major platform.
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-500 transition-all border border-white/5"
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
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#00A2FF] font-plus-jakarta">{title}</h4>
                            <ul className="space-y-4">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-slate-400 hover:text-[#F9C80E] transition-colors text-sm font-medium"
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
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            GDPR
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                            <Lock className="h-3 w-3 text-blue-500" />
                            AES-256
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                            <Globe className="h-3 w-3 text-indigo-500" />
                            99.9% Uptime
                        </div>
                    </div>

                    <div className="text-slate-500 text-sm font-medium">
                        © {currentYear} SocialHub Inc. Enterprise Grade Social Management.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
