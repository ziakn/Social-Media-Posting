"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

export default function EditPermission() {
  const router = useRouter();
  const { id } = useParams();
  const [permission, setPermission] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPermission = async () => {
      try {
        const docRef = doc(db, "permissions", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const permissionData = { id: docSnap.id, ...docSnap.data() };
          setPermission({
            name: permissionData.name || "",
            description: permissionData.description || "",
          });
        } else {
          toast.error("Permission not found!");
          router.push(ROUTES.PORTAL_PERMISSION);
        }
      } catch (error) {
        console.error("Error loading permission:", error);
        toast.error("Error loading permission");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPermission();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!permission.name.trim()) {
      toast.warning("Fill The Form Correctly");
      return;
    }

    setSaving(true);
    try {
      const ref = doc(db, "permissions", id);
      await updateDoc(ref, {
        name: permission.name,
        description: permission.description || "",
        updated_at: new Date(),
      });
      toast.success("Permission Updated Successfully");
      router.push(ROUTES.PORTAL_PERMISSION);
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error("Some Thing went Wrong !");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-6 flex justify-center items-center min-h-[200px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading permission...</p>
      </div>
    </div>
  );

  if (!permission) return null;

  return (
    <div className="p-6">
      <Card className="shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Edit Permission</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Permission Name
              </Label>
              <Input
                id="name"
                placeholder="Enter permission name"
                value={permission.name}
                onChange={(e) => setPermission({ ...permission, name: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                value={permission.description}
                onChange={(e) => setPermission({ ...permission, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
        
            <div className="flex justify-end">
              <Button variant="secondary" type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update Permission"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}