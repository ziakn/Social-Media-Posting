"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowRight, 
  MessageSquare, 
  Share2, 
  BarChart3, 
  Shield, 
  Users,
  Zap,
  CheckCircle2,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Unified Messaging",
      description: "Manage all your social media messages from one inbox"
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: "Cross-Platform Sharing",
      description: "Schedule and publish content across all platforms simultaneously"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Track performance with comprehensive analytics and insights"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Enterprise-grade security for your social accounts"
    }
  ];

  const supportedPlatforms = [
    { name: "Twitter", icon: <Twitter className="h-5 w-5" />, color: "text-blue-400" },
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, color: "text-pink-500" },
    { name: "Facebook", icon: <Facebook className="h-5 w-5" />, color: "text-blue-600" },
    { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, color: "text-blue-700" },
    { name: "YouTube", icon: <Youtube className="h-5 w-5" />, color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SocialHub
              </span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#platforms" className="text-gray-600 hover:text-gray-900 transition-colors">
                Platforms
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <Badge variant="secondary" className="px-4 py-1 text-sm">
            🚀 All-in-One Social Media Management
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Manage All Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Social Media
            </span>{" "}
            in One Place
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            SocialHub centralizes your social media management. Connect all your accounts, 
            schedule posts, engage with your audience, and analyze performance from a single dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Start Free Trial
                <Zap className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Supported Platforms */}
          <div className="pt-12">
            <p className="text-gray-500 text-sm mb-4">Supported Platforms</p>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              {supportedPlatforms.map((platform) => (
                <div key={platform.name} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                  <div className={platform.color}>{platform.icon}</div>
                  <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Powerful features designed to streamline your social media management and boost your online presence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Social Media Management?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of creators and businesses who use SocialHub to save time and grow their presence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Input 
                placeholder="Enter your email" 
                className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
              />
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 whitespace-nowrap"
              >
                Get Started Free
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-6 text-blue-200 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>No credit card required</span>
              <CheckCircle2 className="h-4 w-4" />
              <span>14-day free trial</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SocialHub
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Centralized social media management for creators and businesses.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Product</h3>
              <div className="space-y-2 text-sm">
                <Link href="#features" className="block text-gray-600 hover:text-gray-900">
                  Features
                </Link>
                <Link href="#pricing" className="block text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
                <Link href="/api" className="block text-gray-600 hover:text-gray-900">
                  API
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Company</h3>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-gray-600 hover:text-gray-900">
                  About
                </Link>
                <Link href="/blog" className="block text-gray-600 hover:text-gray-900">
                  Blog
                </Link>
                <Link href="#" className="block text-gray-600 hover:text-gray-900">
                  Careers
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Legal</h3>
              <div className="space-y-2 text-sm">
                <Link href="/privacy-policy" className="block text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="block text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
                  <Link href="/data-deletion" className="block text-gray-600 hover:text-gray-900">
                  Data Deletion
                </Link>
                <a href="mailto:ziakn03@gmail.com" className="block text-gray-600 hover:text-gray-900">
                  Contact
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 SocialHub. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {supportedPlatforms.map((platform) => (
                <a
                  key={platform.name}
                  href="#"
                  className={`text-gray-400 hover:text-gray-600 transition-colors ${platform.color} hover:scale-110 transform`}
                >
                  {platform.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}