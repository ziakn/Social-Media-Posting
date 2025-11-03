"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";


export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(true);


 useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      const [rolesSnap, permsSnap] = await Promise.all([
        getDocs(collection(db, "roles")),
        getDocs(collection(db, "permissions")),
      ]);

      const rolesData = rolesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const permsData = permsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRoles(rolesData);
      setPermissions(permsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(`❌ Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


const handleDelete = async (id) => {
  toast("Are you sure you want to delete this role?", {
    action: {
      label: "Delete",
      onClick: async () => {
        try {
          await deleteDoc(doc(db, "roles", id));
          setRoles((prev) => prev.filter((r) => r.id !== id));
          toast.success(" Role deleted successfully!");
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
          <CardTitle>Roles</CardTitle>
          <Link href={ROUTES.ADMIN_ROLE_CREATE}>
            <Button>+ Add Role</Button>
          </Link>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                      {permissions &&permissions.map((perm) => {
                      const matched = role.permissions.find((selected) => selected === perm.id);
                      return matched ? perm.name + " |" : null;
                    })}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={ROUTES.ADMIN_ROLE_EDIT+'/'+role.id+'/edit'}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(role.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
