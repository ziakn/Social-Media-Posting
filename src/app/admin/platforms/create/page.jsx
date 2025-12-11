"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_ROUTES } from "@/constants/api";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

export default function CreatePlatform() {
  const [form, setForm] = useState({
    platform_name: "",
    platform_type: "",
    client_id: "",
    client_secret: "",
    icon_url: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRoles();
  }, []);


  const fetchRoles = async () => {
    try {
    setLoading(true);

      const res = await fetch(API_ROUTES.ROLES, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setRoles(data.roles);
    } catch (error) {
      toast.error("Some Thing went Wrong !");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form)
    if (!form.platform_name || !form.platform_type || !form.client_id || !form.client_secret || !form.icon_url || !form.status) {
      toast.warning("Fill The Form Correctly");
      return;
    }
    try {
      const res = await fetch(API_ROUTES.PLATFORMS_CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create platform");

      toast.success("Platform Created Successfully");
      router.push(ROUTES.ADMIN_PLATFORMS);
    } catch (error) {
      console.error("Error adding platform:", error);
      toast.error("Some Thing went Wrong !");
    } 
  };


  if (loading) return <Spinner />;

  return (
    <div className="p-6">
      <Card className="shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Add New Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Platform Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.platform_name}
                onChange={(e) => setForm({ ...form, platform_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Platform Type</label>
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.platform_type}
                onChange={(e) => setForm({ ...form, platform_type: e.target.value })}
              >
                <option value="">Select Platform Type</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Client ID</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Client Secret</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.client_secret}
                onChange={(e) => setForm({ ...form, client_secret: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Icon URL </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.icon_url}
                onChange={(e) => setForm({ ...form, icon_url: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.status}
                 onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

    

            <div className="md:col-span-2 flex justify-end">
              <Button variant="secondary" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Platform"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
