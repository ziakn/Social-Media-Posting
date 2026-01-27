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
import { toast } from "sonner";
import { getBlogs, deleteBlog } from "@/app/actions/blog/blogActions";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Plus, Eye } from "lucide-react";

export default function BlogList() {
    const { hasPermission } = usePermissions();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await getBlogs();
            if (res.success) {
                setBlogs(res.blogs);
            } else {
                toast.error(res.error || "Failed to fetch blog posts");
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Failed to fetch blog posts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        toast("Are you sure you want to delete this blog post?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        const res = await deleteBlog(id);
                        if (!res.success) throw new Error(res.error || "Failed to delete blog post");

                        setBlogs((prev) => prev.filter((blog) => blog.id !== id));
                        toast.success("Blog post deleted successfully!");
                    } catch (error) {
                        console.error("Error deleting blog:", error);
                        toast.error("❌ Error deleting blog post: " + error.message);
                    }
                },
            },
        });
    };

    if (loading) return <Spinner />;

    return (
        <div className="p-6">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-6">
                    <CardTitle className="text-xl font-semibold">Blog Posts</CardTitle>
                    {hasPermission('create_blog') &&
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-[#0C1B33] hover:bg-slate-800"
                            onClick={() => router.push("/admin/blog/create")}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Blog Post
                        </Button>
                    }
                </CardHeader>
                <CardContent>
                    {blogs.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="mb-4">No blog posts found.</p>
                            {hasPermission('create_blog') &&
                                <Button
                                    size="sm"
                                    onClick={() => router.push("/admin/blog/create")}
                                >
                                    + Create your first post
                                </Button>
                            }
                        </div>
                    ) : (
                        <Table>
                            <TableCaption>A list of all blog posts on the platform.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {blogs.map((blog) => (
                                    <TableRow key={blog.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium max-w-[300px] truncate">
                                            {blog.title}
                                            {blog.featured && (
                                                <Badge variant="secondary" className="ml-2 bg-[#F9C80E] text-[#0C1B33]">
                                                    Featured
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{blog.category}</TableCell>
                                        <TableCell>{blog.author}</TableCell>
                                        <TableCell>{blog.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={blog.status === 'published' ? "success" : "secondary"}
                                                className={blog.status === 'published' ? "bg-emerald-50 text-emerald-600" : ""}>
                                                {blog.status || 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                                                >
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                </Button>
                                                {hasPermission('edit_blog') &&
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            router.push(`/admin/blog/${blog.id}/edit`)
                                                        }
                                                    >
                                                        <Edit2 className="h-4 w-4 text-slate-400" />
                                                    </Button>}
                                                {hasPermission('delete_blog') &&
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(blog.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-rose-400" />
                                                    </Button>
                                                }
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
