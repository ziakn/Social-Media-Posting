"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";



export default function PermissionsList() {
  const router = useRouter();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "permissions"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPermissions(data);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast.error("Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const handleDelete = async (id) => {
  toast("Are you sure you want to delete this role?", {
    action: {
      label: "Delete",
      onClick: async () => {
        try {
          await deleteDoc(doc(db, "permissions", id));
      setPermissions(permissions.filter((p) => p.id !== id));
      toast.success("Permission deleted successfully!");
        } catch (error) {
          console.error("Error deleting role:", error);
          toast.error(`Failed to delete role: ${error.message}`);
        }
      },
    },
  });
};


   if (loading) return <Spinner />;

  return (
     <div className="p-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Permission</CardTitle>
          <Link href={ROUTES.PORTAL_PERMISSION_CREATE}>
            <Button>+ Add Permission</Button>
          </Link>
        </CardHeader>
        
        <CardContent>
          {permissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No permissions found.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push(ROUTES.PORTAL_PERMISSION_CREATE)}
              >
                Create Your First Permission
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {perm.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {perm.description || "No description"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {perm.created_at?.toDate?.().toLocaleDateString() || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`${ROUTES.PORTAL_PERMISSION_EDIT}/${perm.id}/edit`)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(perm.id)}
                          disabled={deletingId === perm.id}
                          className="flex items-center gap-2"
                        >
                          {deletingId === perm.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}