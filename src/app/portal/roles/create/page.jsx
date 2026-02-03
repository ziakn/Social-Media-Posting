"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";


export default function CreateRole() {
  const router = useRouter();
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "permissions"));
        const permsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPermissions(permsData);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };
    fetchPermissions();
  }, []);

  const handlePermissionToggle = (permId) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.warning("Fill The Form Correctly");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "roles"), {
        name: roleName,
        description: description || "",
        permissions: selectedPermissions,
        created_at: new Date(),
        updated_at: new Date(),
      });
       toast.success("Role Created Successfully");
      router.push(ROUTES.PORTAL_ROLE);
    } catch (error) {
      console.error("Error creating role:", error);
       toast.error("Some Thing went Wrong !");
    } finally {
      setLoading(false);
    }
  };

  return (
 <div className="p-6">
      <Card className="shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Add New User</CardTitle>
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
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
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
        
            <div className="md:col-span-2 flex justify-end">
              <Button variant="secondary" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Role"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}