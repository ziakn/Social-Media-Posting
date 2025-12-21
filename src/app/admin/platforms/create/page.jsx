"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { API_ROUTES } from "@/constants/api";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function CreatePlatform() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    platform_name: "",
    description: "",
    icon_url: "",
    status: "active",
  });

  const editorRef = useRef(null);
  const quillRef = useRef(null); // 🔑 important

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: "Enter platform description...",
    });

    quillRef.current.on("text-change", () => {
      setForm((prev) => ({
        ...prev,
        description: quillRef.current.root.innerHTML,
      }));
    });
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.platform_name || !form.description || !form.icon_url || !form.status) {
      toast.warning("Fill the form correctly");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch(API_ROUTES.PLATFORMS_CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Platform Created Successfully");
      router.push(ROUTES.ADMIN_PLATFORMS);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Platform</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Platform Name */}
            <div>
              <label className="block text-sm mb-1">Platform Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={form.platform_name}
                onChange={(e) =>
                  setForm({ ...form, platform_name: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm mb-1">Description</label>
              <div
                ref={editorRef}
                className="bg-white"
                style={{ height: "200px" }}
              />
            </div>

            {/* Icon URL */}
            <div>
              <label className="block text-sm mb-1">Icon URL</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={form.icon_url}
                onChange={(e) =>
                  setForm({ ...form, icon_url: e.target.value })
                }
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm mb-1">Status</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Platform"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
