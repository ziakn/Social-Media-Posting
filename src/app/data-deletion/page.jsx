'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Trash2, Shield, AlertTriangle, CheckCircle, FileText, Mail } from "lucide-react";
import { useState } from "react";

export default function FacebookDataDeletion() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    facebookId: "",
    confirmation: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle data deletion request
    setStep(4);
  };

  const steps = [
    { number: 1, title: "Information", description: "Understand the process" },
    { number: 2, title: "Verification", description: "Provide your details" },
    { number: 3, title: "Confirmation", description: "Review and submit" },
    { number: 4, title: "Complete", description: "Request processed" }
  ];

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
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Facebook Data Deletion
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Request deletion of your Facebook data stored by SocialHub in compliance with Facebook's Data Deletion Requirements.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-8">
              {steps.map((stepItem, index) => (
                <div key={stepItem.number} className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= stepItem.number 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {step > stepItem.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{stepItem.number}</span>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div className={`text-sm font-medium ${
                      step >= stepItem.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {stepItem.title}
                    </div>
                    <div className="text-xs text-gray-500">{stepItem.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${
                      step > stepItem.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Information */}
          {step === 1 && (
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Understanding Data Deletion</CardTitle>
                <CardDescription>
                  Important information about what happens when you delete your Facebook data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    This process is specifically for deleting data obtained from your Facebook account through SocialHub.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Trash2 className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">What Data Will Be Deleted</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>Facebook profile information (name, email, profile picture)</li>
                        <li>Facebook page access tokens and permissions</li>
                        <li>Scheduled posts and drafts for Facebook</li>
                        <li>Facebook analytics and insights data</li>
                        <li>Any other data obtained through Facebook Login</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">What Will Not Be Deleted</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>Your SocialHub account (unless you specifically delete it)</li>
                        <li>Data from other connected social media platforms</li>
                        <li>Billing and payment information</li>
                        <li>Analytics data required for legal compliance</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Important Notes</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>This process may take up to 30 days to complete</li>
                        <li>You will receive email confirmation when deletion is complete</li>
                        <li>Some data may be retained for legal or regulatory requirements</li>
                        <li>You can reconnect your Facebook account after deletion if desired</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Facebook Compliance</h4>
                  <p className="text-sm text-gray-700">
                    This data deletion process complies with Facebook's Platform Terms and Developer Policies. 
                    SocialHub is committed to protecting user privacy and providing transparent data management options.
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Link href="/">
                    <Button variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button onClick={() => setStep(2)}>
                    Continue to Verification
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Verification */}
          {step === 2 && (
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
                <CardDescription>
                  Provide the required information to verify your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address Associated with SocialHub
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email address"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Must match the email used for your SocialHub account
                      </p>
                    </div>

                    <div>
                      <label htmlFor="facebookId" className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook User ID (Optional)
                      </label>
                      <input
                        type="text"
                        id="facebookId"
                        value={formData.facebookId}
                        onChange={(e) => setFormData({...formData, facebookId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your Facebook User ID (if known)"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        You can find your Facebook User ID in your Facebook settings under "Apps and Websites"
                      </p>
                    </div>
                  </div>

                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      Providing your Facebook User ID will help us process your request faster and more accurately.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="submit" disabled={!formData.email}>
                      Continue to Confirmation
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Confirm Deletion Request</CardTitle>
                <CardDescription>
                  Review your information before submitting the deletion request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Request Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{formData.email}</span>
                      </div>
                      {formData.facebookId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Facebook ID:</span>
                          <span className="font-medium">{formData.facebookId}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Request Type:</span>
                        <span className="font-medium">Facebook Data Deletion</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submission Date:</span>
                        <span className="font-medium">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Warning:</strong> This action cannot be undone. Once you delete your Facebook data, 
                      it will be permanently removed from our systems and you will need to reconnect your Facebook 
                      account to use Facebook-related features.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="confirmation"
                      required
                      checked={formData.confirmation}
                      onChange={(e) => setFormData({...formData, confirmation: e.target.checked})}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="confirmation" className="text-sm text-gray-700">
                      I understand that this action is permanent and cannot be undone. I confirm that I want to 
                      proceed with deleting my Facebook data from SocialHub's systems.
                    </label>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      variant="destructive"
                      disabled={!formData.confirmation}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Confirm Data Deletion
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Request Submitted Successfully</CardTitle>
                <CardDescription>
                  Your Facebook data deletion request has been received
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Deletion Request Received
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    We've received your request to delete Facebook data associated with your SocialHub account. 
                    You will receive an email confirmation shortly.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">What Happens Next</h4>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>We will process your request within 30 days</li>
                    <li>You'll receive email updates about the progress</li>
                    <li>Once complete, all Facebook data will be permanently deleted</li>
                    <li>You can submit a new request at any time if needed</li>
                  </ul>
                </div>

                <div className="text-center space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                      <Button>
                        Return to Homepage
                      </Button>
                    </Link>
                    <Link href="/privacy-policy">
                      <Button variant="outline">
                        View Privacy Policy
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500">
                    Need help? <a href="mailto:privacy@socialhub.com" className="text-blue-600 hover:underline">Contact our privacy team</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Privacy Policy</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Learn how we collect, use, and protect your data
                </p>
                <Link href="/privacy-policy">
                  <Button variant="outline" size="sm">
                    View Policy
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Get help with data deletion or privacy concerns
                </p>
                <a href="mailto:privacy@socialhub.com">
                  <Button variant="outline" size="sm">
                    Email Us
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Data Management</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Manage all your connected accounts and data
                </p>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Go to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}