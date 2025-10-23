"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function Login() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("asdasdasd");
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setAlert("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setAlert(data.error || "Login failed!");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setSuccess(true); // Show success notification

      // Redirect after a short delay to show the success alert
      setTimeout(() => router.push("/admin"), 1000);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setAlert("Login failed: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        {alert && (
          <Alert
            variant="destructive"
            className="mb-3 w-full text-center whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {alert}
          </Alert>
        )}

        {success && (
          <Alert
            variant="success"
            className="mb-3 w-full text-center whitespace-nowrap overflow-hidden text-ellipsis"
          >
            Successfully logged in!
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
