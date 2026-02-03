"use client";

import { useState } from "react";
import { db } from "../../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

export default function CreatePermission() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("Fill The Form Correctly");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "permissions"), {
        name,
        description: description || "",
        created_at: new Date(),
        updated_at: new Date(),
      });
      toast.success("Permission Created Successfully");
      router.push(ROUTES.PORTAL_PERMISSION);
    } catch (error) {
      console.error("Error creating permission:", error);
      toast.error("Some Thing went Wrong !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Add New Permission</CardTitle>
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
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
        
            <div className="flex justify-end">
              <Button variant="secondary" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Permission"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}