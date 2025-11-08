// app/privacy-policy/page.jsx
"use client";

import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full shadow-lg">
        <CardContent className="space-y-6">
          <CardTitle className="text-2xl font-bold text-center">
            Privacy Policy
          </CardTitle>

          <p>
            At SocialHub, your privacy is important to us. This privacy policy explains how we collect, use, and protect your information when you use our services.
          </p>

          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <p>
            We may collect personal information such as your name, email address, and usage data when you interact with our platform.
          </p>

          <h2 className="text-xl font-semibold">How We Use Information</h2>
          <p>
            Your information helps us improve our services, personalize content, and communicate important updates. We do not sell your personal data to third parties.
          </p>

          <h2 className="text-xl font-semibold">Cookies</h2>
          <p>
            We use cookies and similar technologies to enhance your experience and analyze site traffic.
          </p>

          <h2 className="text-xl font-semibold">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your data from unauthorized access, alteration, or disclosure.
          </p>

          <h2 className="text-xl font-semibold">Third-Party Services</h2>
          <p>
            Our platform may contain links to third-party services. We are not responsible for the privacy practices of external sites.
          </p>

          <h2 className="text-xl font-semibold">Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at{" "}
            <a href="mailto:ziakn03@gmail.com" className="text-blue-600 underline">
              ziakn03@gmail.com
            </a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
