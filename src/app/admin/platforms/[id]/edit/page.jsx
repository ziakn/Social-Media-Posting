"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_ROUTES } from "@/constants/api";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

export default function EditPlatform() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [form, setForm] = useState({
    platform_name: "",
    description: "",
    icon_url: "",
    status: "active",
  });

  useEffect(() => {
    if (!id) return;

    const fetchPlatform = async () => {
      try {
        const res = await fetch(`${API_ROUTES.PLATFORMS_EDIT}/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setForm({
          platform_name: data.platform.platform_name,
          description: data.platform.description || "",
          icon_url: data.platform.icon_url,
          status: data.platform.status,
        });
      } catch {
        toast.error("Failed to load platform");
      } finally {
        setLoading(false);
      }
    };

    fetchPlatform();
  }, [id]);

  useEffect(() => {
    if (loading) return;
    if (!editorRef.current) return;
    if (quillRef.current) return;

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: "Enter platform description...",
    });

    quill.on("text-change", () => {
      setForm((prev) => ({
        ...prev,
        description: quill.root.innerHTML,
      }));
    });

    quill.root.innerHTML = form.description || "";
    quillRef.current = quill;

  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.platform_name || !form.description || !form.icon_url) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${API_ROUTES.PLATFORMS_EDIT}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Platform Updated Successfully");
      router.push(ROUTES.ADMIN_PLATFORMS);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Platform</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="block text-sm mb-1">Description</label>
              <div
                ref={editorRef}
                className="bg-white border rounded"
                style={{ height: "200px" }}
              />
            </div>

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
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Update Platform"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
