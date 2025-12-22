"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { usePermissions } from '@/hooks/usePermissions';

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
import Link from "next/link";

export default function UsersList() {
  const { user, permissions, hasPermission } = usePermissions();
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const res = await fetch(API_ROUTES.PLATFORMS, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setPlatforms(data.platforms);
    } catch (error) {
      console.error("Error fetching platforms:", error);
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
            const res = await fetch(`${API_ROUTES.PLATFORMS}/${id}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete user");

            setPlatforms((prev) => prev.filter((p) => p.id !== id));
            toast.success("Platform deleted successfully!");
          } catch (error) {
            console.error("Error deleting platform:", error);
            toast.error("❌ Error deleting platform: " + error.message);
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
          <CardTitle className="text-xl font-semibold">Platforms</CardTitle>
          {hasPermission('create_plateforms') &&
            <Button
              variant="secondary"
              onClick={() => router.push(ROUTES.ADMIN_PLATFORM_CREATE)}
            >
              + Add Platform
            </Button>
          }
        </CardHeader>
        <CardContent>
          {platforms.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="mb-4">No platforms found.</p>
              {hasPermission('create_plateforms') &&
                <Button
                  size="sm"
                  onClick={() => router.push(ROUTES.ADMIN_PLATFORM_CREATE)}
                >
                  + Add your first platform
                </Button>
              }
            </div>
          ) : (
            <Table>
              <TableCaption>A list of all registered platforms.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Icon URL</TableHead>
                  <TableHead>Sort</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platforms.map((platform) => (
                  <TableRow key={platform.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{platform.platform_name}</TableCell>
                    <TableCell className="text-wrap"><div dangerouslySetInnerHTML={{ __html: platform.description }} /></TableCell>
                    <TableCell> <Link href={platform.icon_url}>{platform.icon_url}</Link></TableCell>
                    <TableCell>{platform.sorting_number || 0}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {hasPermission('edit_plateforms') &&
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `${ROUTES.ADMIN_PLATFORM_EDIT}/${platform.id}/edit`
                            )
                          }
                        >
                          Edit
                        </Button>}
                      {hasPermission('delete_plateforms') &&
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(platform.id)}
                        >
                          Delete
                        </Button>
                      }
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
