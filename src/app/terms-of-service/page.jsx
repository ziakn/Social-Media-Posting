// app/terms-of-service/page.jsx
"use client";

import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full shadow-lg">
        <CardContent className="space-y-6">
          <CardTitle className="text-2xl font-bold text-center">
            Terms of Service
          </CardTitle>

          <p>
            Welcome to SocialHub! By using our services, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our platform, you accept these Terms of Service in full. If you disagree with any part, you must not use our services.
          </p>

          <h2 className="text-xl font-semibold">2. Use of Services</h2>
          <p>
            You agree to use our services only for lawful purposes and in accordance with these terms. You must not misuse or interfere with our services in any way.
          </p>

          <h2 className="text-xl font-semibold">3. Account Responsibility</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
          </p>

          <h2 className="text-xl font-semibold">4. Content</h2>
          <p>
            You retain ownership of content you upload but grant us a license to display and distribute it through our services. Do not upload content that violates laws or rights of others.
          </p>

          <h2 className="text-xl font-semibold">5. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at any time if you violate these Terms of Service.
          </p>

          <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
          <p>
            SocialHub is not liable for any damages arising from the use or inability to use our services.
          </p>

          <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
          <p>
            We may update these terms periodically. Continued use of our services constitutes acceptance of any changes.
          </p>

          <h2 className="text-xl font-semibold">8. Contact Us</h2>
          <p>
            For questions about these Terms of Service, please contact us at{" "}
            <a href="mailto:ziakn03@gmail.com" className="text-blue-600 underline">
              ziakn03@gmail.com
            </a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
