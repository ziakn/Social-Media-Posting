"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock, Eye, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "December 1, 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
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
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Last updated: {lastUpdated}
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                {/* Introduction */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                  <p className="text-gray-700 mb-4">
                    Welcome to SocialHub. We are committed to protecting your personal information and your right to privacy. 
                    If you have any questions or concerns about this privacy notice or our practices with regard to your personal 
                    information, please contact us at <a href="mailto:privacy@socialhub.com" className="text-blue-600 hover:underline">privacy@socialhub.com</a>.
                  </p>
                </section>

                {/* Information We Collect */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Personal Information</h3>
                        <p className="text-gray-700">
                          When you register for SocialHub, we collect information such as your name, email address, 
                          and social media account credentials necessary to provide our services.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Eye className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Usage Data</h3>
                        <p className="text-gray-700">
                          We automatically collect information about how you use our platform, including your interactions 
                          with features, posting patterns, and analytics data.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Social Media Data</h3>
                        <p className="text-gray-700">
                          With your permission, we access and store data from your connected social media accounts, 
                          including posts, messages, followers, and engagement metrics.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* How We Use Your Information */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>To provide and maintain our social media management services</li>
                    <li>To schedule and publish content across your connected accounts</li>
                    <li>To analyze performance and provide insights</li>
                    <li>To communicate with you about platform updates and features</li>
                    <li>To ensure the security and integrity of our platform</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </section>

                {/* Data Sharing */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
                  <p className="text-gray-700 mb-4">
                    We do not sell your personal information. We may share your information only in the following situations:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li><strong>Service Providers:</strong> With trusted third-party vendors who help us operate our platform</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
                    <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
                  </ul>
                </section>

                {/* Data Security */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                  <p className="text-gray-700">
                    We implement appropriate technical and organizational security measures designed to protect the security 
                    of any personal information we process. However, please also remember that we cannot guarantee that the 
                    internet itself is 100% secure.
                  </p>
                </section>

                {/* Your Rights */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Privacy Rights</h2>
                  <p className="text-gray-700 mb-4">
                    Depending on your location, you may have the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Access and receive a copy of your personal data</li>
                    <li>Rectify or update your personal information</li>
                    <li>Delete your personal information</li>
                    <li>Restrict or object to the processing of your data</li>
                    <li>Data portability</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                </section>

                {/* Contact Information */}
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
                  <p className="text-gray-700 mb-4">
                    If you have questions or comments about this policy, you may contact our Data Protection Officer at:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      <strong>Email:</strong> <a href="mailto:privacy@socialhub.com" className="text-blue-600 hover:underline">privacy@socialhub.com</a><br />
                      <strong>Address:</strong> 123 Privacy Lane, Security City, SC 12345<br />
                      <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 48 hours.
                    </p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/terms-of-service" className="flex-1">
              <Button variant="outline" className="w-full">
                View Terms of Service
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