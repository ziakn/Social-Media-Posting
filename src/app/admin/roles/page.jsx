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

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchRoles = async () => {
      const querySnapshot = await getDocs(collection(db, "roles"));
      const rolesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoles(rolesData);
      setLoading(false);

    };
    fetchRoles();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "roles", id));
    setRoles((prev) => prev.filter((r) => r.id !== id));
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
                    {(role.permissions || []).join(", ")}
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
