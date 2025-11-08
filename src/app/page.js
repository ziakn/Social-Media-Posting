"use client";

import Link from "next/link";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-3xl w-full shadow-lg">
        <CardContent className="space-y-6 text-center">
          <CardTitle className="text-3xl font-bold">SocialHub</CardTitle>
          <CardDescription className="text-gray-700 text-base">
            Welcome to SocialHub — your centralized platform for connecting, sharing, and managing content seamlessly.
          </CardDescription>

          <div className="space-y-2">
            <Link
              href="/privacy-policy"
              className="inline-block text-blue-600 underline text-lg"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="inline-block text-blue-600 underline text-lg"
            >
              Terms of Service
            </Link>
          </div>

          <div className="mt-4 flex justify-center gap-4">
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Deploy Now
            </a>
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Documentation
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
