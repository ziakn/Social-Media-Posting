"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

export default function EditRole() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [role, setRole] = useState({
    name: "",
    description: "",
  });
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch role and permissions
  useEffect(() => {
    const fetchRoleAndPermissions = async () => {
      try {
        // Fetch permissions list
        const permSnapshot = await getDocs(collection(db, "permissions"));
        const permsData = permSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPermissions(permsData);

        // Fetch role data
        const roleRef = doc(db, "roles", id);
        const roleSnap = await getDoc(roleRef);

        if (roleSnap.exists()) {
          const roleData = { id: roleSnap.id, ...roleSnap.data() };
          setRole({
            name: roleData.name || "",
            description: roleData.description || "",
          });
          setSelectedPermissions(roleData.permissions || []);
        } else {
          toast.error("Role not found!");
          router.push(ROUTES.PORTAL_ROLE);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading role");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoleAndPermissions();
  }, [id, router]);

  const handlePermissionToggle = (permId) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role.name.trim()) {
      toast.warning("Role name is required!");
      return;
    }

    setSaving(true);
    try {
      const roleRef = doc(db, "roles", id);
      await updateDoc(roleRef, {
        name: role.name,
        description: role.description || "",
        permissions: selectedPermissions,
        updated_at: new Date(),
      });
      toast.success("Role updated successfully!");
      router.push(ROUTES.PORTAL_ROLE);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error updating role");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-6 flex justify-center items-center min-h-[200px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading role...</p>
      </div>
    </div>
  );

  if (!role) return null;

  return (
    <div className="p-6">
      <Card className="shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Edit Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="roleName" className="text-base font-semibold">
                Role Name
              </Label>
              <Input
                id="roleName"
                placeholder="Enter role name"
                value={role.name}
                onChange={(e) => setRole({ ...role, name: e.target.value })}
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
                value={role.description}
                onChange={(e) => setRole({ ...role, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Permissions</Label>
              <Card className="border">
                <CardContent className="p-4">
                  {permissions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No permissions available.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`perm-${perm.id}`}
                            checked={selectedPermissions.includes(perm.id)}
                            onCheckedChange={() => handlePermissionToggle(perm.id)}
                          />
                          <Label
                            htmlFor={`perm-${perm.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {perm.name || perm.id}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
        
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}