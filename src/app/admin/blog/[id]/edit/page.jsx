"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getBlog, updateBlog } from "@/app/actions/blog/blogActions";
import SocialCaptionEditor from "@/components/social/SocialCaptionEditor";
import GalleryModal from "@/components/gallery/GalleryModal";
import { ImageIcon, X } from "lucide-react";

export default function EditBlog() {
    const params = useParams();
    const router = useRouter();
    const [form, setForm] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        author: "",
        date: "",
        readTime: "",
        image: "",
        featured: false,
        status: "draft"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);

    const handleGallerySelect = (selected) => {
        const item = Array.isArray(selected) ? selected[0] : selected;
        if (item?.fileUrl) {
            setForm({ ...form, image: item.fileUrl });
            setGalleryOpen(false);
        }
    };

    const categories = [
        "Platform Guides",
        "Strategy & Insights",
        "Creator Growth",
        "Agency Workflows",
        "News & Updates",
    ];

    useEffect(() => {
        if (params.id) {
            fetchBlog();
        }
    }, [params.id]);

    const fetchBlog = async () => {
        try {
            const res = await getBlog(params.id);
            if (res.success) {
                setForm(res.blog);
            } else {
                toast.error(res.error || "Failed to fetch blog post");
                router.push("/admin/blog");
            }
        } catch (error) {
            console.error("Error fetching blog:", error);
            toast.error("Failed to fetch blog post");
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setForm({
            ...form,
            title,
            slug: generateSlug(title)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.slug || !form.content) {
            toast.warning("Please fill in required fields (Title, Slug, Content)");
            return;
        }

        try {
            setSaving(true);
            const res = await updateBlog(params.id, form);

            if (!res.success) throw new Error(res.error || "Failed to update blog post");

            toast.success("Blog Post Updated Successfully");
            router.push("/admin/blog");
        } catch (error) {
            console.error("Error updating blog:", error);
            toast.error("Failed to update blog post: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="p-6">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center border-b pb-6 mb-6">
                    <CardTitle className="text-xl font-semibold text-[#0C1B33]">Edit Blog Post</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Title *</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-[8px] px-4 py-3 bg-[#F5F8FB] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] outline-none font-bold text-[#0C1B33]"
                                    value={form.title}
                                    onChange={handleTitleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Slug *</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-[8px] px-4 py-3 bg-[#F5F8FB] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] outline-none font-bold text-[#0C1B33]"
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                <select
                                    className="w-full border rounded-[8px] px-4 py-3 bg-[#F5F8FB] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] outline-none font-bold text-[#0C1B33]"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Author Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-[8px] px-4 py-3 bg-[#F5F8FB] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] outline-none font-bold text-[#0C1B33]"
                                    value={form.author}
                                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-[8px] px-4 py-3 bg-[#F5F8FB] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] outline-none font-bold text-[#0C1B33]"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Read Time</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-[8px] px-4 py-3 bg-[#F5F8FB] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] outline-none font-bold text-[#0C1B33]"
                                    value={form.readTime}
                                    onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Featured Image</label>
                                <div className="space-y-3">
                                    {form.image && (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                                            <img src={form.image} alt="Featured" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, image: "" })}
                                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setGalleryOpen(true)}
                                        className="w-full h-20 border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 flex flex-col gap-2 rounded-xl"
                                    >
                                        <ImageIcon className="h-5 w-5 text-slate-400" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Image from Gallery</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Excerpt</label>
                                <textarea
                                    className="w-full border rounded-[8px] px-4 py-3 bg-[#F5F8FB] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] outline-none font-bold text-[#0C1B33] resize-none"
                                    value={form.excerpt}
                                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Full Content</label>
                                <SocialCaptionEditor
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    minHeight="300px"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6 border-t pt-6">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={form.featured}
                                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6]"
                                />
                                <label htmlFor="featured" className="text-sm font-bold text-[#0C1B33] uppercase tracking-widest">Featured Post</label>
                            </div>

                            <div className="flex items-center gap-4 ml-auto">
                                <label className="text-sm font-bold text-[#0C1B33] uppercase tracking-widest">Status</label>
                                <select
                                    className="border rounded-[8px] px-4 py-2 bg-[#F5F8FB] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] outline-none font-bold text-[#0C1B33]"
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/admin/blog")}
                                className="h-12 px-8 border-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="h-12 px-10 bg-[#0C1B33] hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-xs rounded-[8px]"
                            >
                                {saving ? "Updating..." : "Update Post"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <GalleryModal
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                onSelect={handleGallerySelect}
                allowedTypes={["image"]}
                allowMultiple={false}
                title="Select Featured Image"
            />
        </div >
    );
}
