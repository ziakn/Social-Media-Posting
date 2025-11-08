"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle } from "lucide-react";

export default function TermsOfService() {
  const effectiveDate = "December 1, 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SocialHub
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Scale className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-lg text-gray-600">
              Effective Date: {effectiveDate}
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                {/* Agreement */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
                  <p className="text-gray-700">
                    By accessing or using SocialHub, you agree to be bound by these Terms of Service and our Privacy Policy. 
                    If you disagree with any part of the terms, you may not access our service.
                  </p>
                </section>

                {/* Accounts */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Accounts</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Eligibility</h3>
                        <p className="text-gray-700">
                          You must be at least 13 years old to use SocialHub. If you are under 18, you need permission from a parent or guardian.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Account Security</h3>
                        <p className="text-gray-700">
                          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Account Information</h3>
                        <p className="text-gray-700">
                          You agree to provide accurate and complete information when creating your account and to keep it updated.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Acceptable Use */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Acceptable Use</h2>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-yellow-800">Prohibited Activities</h3>
                        <ul className="list-disc list-inside text-yellow-700 space-y-1 mt-2">
                          <li>Violating any laws or regulations</li>
                          <li>Posting harmful, abusive, or illegal content</li>
                          <li>Spamming or harassing other users</li>
                          <li>Attempting to gain unauthorized access to our systems</li>
                          <li>Impersonating others or providing false information</li>
                          <li>Interfering with the proper functioning of our service</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Social Media Platforms */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Platforms</h2>
                  <p className="text-gray-700 mb-4">
                    When you connect your social media accounts to SocialHub, you acknowledge that:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>You are responsible for complying with each platform's terms of service</li>
                    <li>We are not affiliated with or endorsed by any social media platform</li>
                    <li>Platforms may change their APIs or access rules at any time</li>
                    <li>We cannot guarantee uninterrupted access to any third-party platform</li>
                  </ul>
                </section>

                {/* Payments */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payments and Billing</h2>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Subscription Plans:</strong> We offer various subscription tiers. You can upgrade, downgrade, or cancel at any time.</p>
                    <p><strong>Billing Cycle:</strong> Payments are charged on a recurring basis according to your selected plan.</p>
                    <p><strong>Refunds:</strong> We offer a 14-day money-back guarantee for annual plans. Monthly plans can be canceled anytime.</p>
                    <p><strong>Price Changes:</strong> We reserve the right to change pricing with 30 days notice.</p>
                  </div>
                </section>

                {/* Intellectual Property */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Our Content:</strong> All SocialHub platform content, features, and functionality are owned by us.</p>
                    <p><strong>Your Content:</strong> You retain all rights to the content you create and post through our platform.</p>
                    <p><strong>License:</strong> You grant us a limited license to use your content solely to provide our services.</p>
                  </div>
                </section>

                {/* Termination */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Termination</h2>
                  <p className="text-gray-700">
                    We may suspend or terminate your account if you violate these terms. You may terminate your account at any time. 
                    Upon termination, your right to use our service will immediately cease.
                  </p>
                </section>

                {/* Disclaimer */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
                  <p className="text-gray-700">
                    Our service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that 
                    our service will be uninterrupted, secure, or error-free.
                  </p>
                </section>

                {/* Limitation of Liability */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
                  <p className="text-gray-700">
                    To the fullest extent permitted by law, SocialHub shall not be liable for any indirect, incidental, special, 
                    consequential, or punitive damages resulting from your use of or inability to use our service.
                  </p>
                </section>

                {/* Contact */}
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      For any questions about these Terms of Service, please contact us at:<br />
                      <strong>Email:</strong> <a href="mailto:legal@socialhub.com" className="text-blue-600 hover:underline">legal@socialhub.com</a><br />
                      <strong>Address:</strong> 123 Legal Avenue, Compliance City, CC 12345
                    </p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/privacy-policy" className="flex-1">
              <Button variant="outline" className="w-full">
                View Privacy Policy
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                Back to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}