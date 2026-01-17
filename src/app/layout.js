import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"], // Enterprise weights only
  variable: "--font-inter",
});

// Enterprise Font Only: Inter (300, 400, 500, 600)

export const metadata = {
  title: {
    default: "SocialHub | Multi-Platform Social Media Scheduling Tool",
    template: "%s | SocialHub"
  },
  description: "The 2026 command center for creators to schedule, analyze, and grow across every major platform. AI-powered tiktok, instagram, and pinterest scheduling.",
  keywords: ["social media scheduler", "multi-platform posting", "AI social media", "TikTok scheduler", "Instagram planner"],
  authors: [{ name: "SocialHub" }],
  creator: "SocialHub",
  publisher: "SocialHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://social-hub-demo.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SocialHub | Multi-Platform Social Media Scheduling Tool",
    description: "Manage TikTok, Pinterest, Bluesky, Instagram posts in one tool. AI-powered scheduling, analytics, and publishing.",
    url: "https://social-hub-demo.vercel.app",
    siteName: "SocialHub",
    images: [
      {
        url: "/og-image.png", // Need to ensure this exists or use a generic one
        width: 1200,
        height: 630,
        alt: "SocialHub Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialHub | Multi-Platform Social Media Scheduling Tool",
    description: "Manage TikTok, Pinterest, Bluesky, Instagram posts in one tool. AI-powered scheduling, analytics, and publishing.",
    creator: "@socialhub",
    images: ["/twitter-card.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased text-gray-900 bg-gray-50`}>
        {children}
        <Toaster position="top-right" expand={false} richColors />
      </body>
    </html>
  );
}

