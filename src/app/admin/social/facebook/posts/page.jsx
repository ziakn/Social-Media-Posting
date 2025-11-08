"use client";

import { Button } from "@/components/ui/button";

export default function FacebookConnectPage() {
  const handleConnect = () => {
    window.location.href = "/api/facebook/connect";
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Connect Your Facebook Account</h1>
      <Button onClick={handleConnect}>Connect with Facebook</Button>
    </div>
  );
}
