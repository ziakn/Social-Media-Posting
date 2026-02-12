import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import JsonLdSchema from "@/components/seo/JsonLdSchema";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"], // Enterprise weights only
  variable: "--font-inter",
});

// Enterprise Font Only: Inter (300, 400, 500, 600)

export const metadata = {
  title: {
    default: "UNI.social | AI-Powered Social Media Management & Distribution",
    template: "%s | UNI.social"
  },
  description: "UNI.social is the enterprise command center for automated social media distribution. Schedule, synchronize, and analyze performance across TikTok, Instagram, Pinterest, and LinkedIn.",
  keywords: [
    "social media scheduler",
    "AI social media management",
    "TikTok auto-posting",
    "Instagram planner",
    "Pinterest marketing tool",
    "social media analytics 2026",
    "content calendar",
    "SocialHub"
  ],
  authors: [{ name: "SocialHub Team" }],
  creator: "SocialHub AI",
  publisher: "SocialHub Global",
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
    title: "SocialHub | Streamline Your Social Media with AI",
    description: "Connect all your social accounts. Schedule posts, track viral trends, and scale your brand with SocialHub's AI-driven platform.",
    url: "https://social-hub-demo.vercel.app",
    siteName: "SocialHub",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SocialHub AI Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialHub | The Future of Social Media Management",
    description: "One tool to rule them all. Schedule content for TikTok, Instagram, and more with AI precision.",
    creator: "@socialhub",
    images: ["/twitter-card.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <JsonLdSchema />
        {children}
        <Toaster position="top-right" expand={false} richColors />
      </body>
    </html>
  );
}

