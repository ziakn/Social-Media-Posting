"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { API_ROUTES } from "@/constants/api";
import { toast } from "sonner";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_ROUTES.USERS, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async (id) => {
  toast("Are you sure you want to delete this user?", {
    action: {
      label: "Delete",
      onClick: async () => {
        try {
          const res = await fetch(`${API_ROUTES.USERS}/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to delete user");

          setUsers((prev) => prev.filter((u) => u.id !== id));
          toast.success("User deleted successfully!");
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("❌ Error deleting user: " + error.message);
        }
      },
    },
  });
};


  if (loading) return <Spinner />;

  return (
    <div className="p-6">
      <Card className="shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Users</CardTitle>
          <Button
            variant="secondary"
            onClick={() => router.push(ROUTES.ADMIN_USER_CREATE)}
          >
            + Add User
          </Button>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="mb-4">No users found.</p>
              <Button
                size="sm"
                onClick={() => router.push(ROUTES.ADMIN_USER_CREATE)}
              >
                + Add your first user
              </Button>
            </div>
          ) : (
            <Table>
              <TableCaption>A list of all registered users.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role.name || "—"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `${ROUTES.ADMIN_USER_EDIT}/${user.id}/edit`
                          )
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </Button>
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
