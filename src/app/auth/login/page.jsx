"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { API_ROUTES } from "@/constants/api";
import { ROUTES } from "@/constants/routes";

export default function Login() {
  const [email, setEmail] = useState("zia@gmail.com");
  const [password, setPassword] = useState("asdasdasd");
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setAlert("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(API_ROUTES.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setAlert(data.error || "Invalid credentials. Please try again.");
        return;
      }

      console.log(data.user)

      // return;

      // localStorage.setItem("currentUser", JSON.stringify(data.user));
      setSuccess(true);

      // Brief success message before redirect
      setTimeout(() => router.push(ROUTES.ADMIN_DASHBOARD), 800);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setAlert("Login failed: " + (error.message || "Unexpected error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Card className="w-full max-w-md shadow-xl border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-gray-800 tracking-tight">
            Welcome Back 👋
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue to your dashboard</p>
        </CardHeader>

        <CardContent>
          {alert && (
            <Alert variant="destructive" className="mb-3">
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="mb-3 bg-green-50 border-green-200 text-green-800">
              <AlertDescription>Successfully logged in!</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </CardFooter>
      </Card>
    </div>
  );
}
