"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_ROUTES } from "@/constants/api";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";


export default function EditUser() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
    subscription: null
  });
  const [roles, setRoles] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchPackages();
    fetchData();
  }, [id, router]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_ROUTES.USERS_EDIT}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch user");

      setForm({
        ...data.user,
        password: "",
        subscription: data.user.subscription || { packageName: "Free", status: "active", packageId: "XX7Bf4wU3MkJAHu6Ohzm" }
      });
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    const querySnapshot = await getDocs(collection(db, "roles"));
    const rolesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRoles(rolesData);
  };

  const fetchPackages = async () => {
    const querySnapshot = await getDocs(collection(db, "packages"));
    const pkgData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPackages(pkgData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role_id)
      return alert("Please fill all fields!");

    try {
      setSubmitting(true);

      const payload = { ...form };
      if (!form.password) delete payload.password; // Only send password if entered

      const res = await fetch(`${API_ROUTES.USERS_EDIT}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      toast.success("User Updated Successfully");
      router.push(ROUTES.ADMIN_USER);
    } catch (err) {
      console.log(err)
      toast.error("Some Thing went Wrong !");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-6">
      <Card className="shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password (Leave blank to keep)
              </label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.password || ""}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: e.target.value })}
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <hr className="my-6 border-slate-100" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-slate-200"></span> Membership & Plan Protocols
              </h3>
            </div>

            <div className="md:col-span-1">
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Assigned Plan</label>
              <select
                className="w-full border rounded-[6px] px-3 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50/50"
                value={form.subscription?.packageId || ""}
                onChange={(e) => {
                  const pkg = packages.find(p => p.id === e.target.value);
                  if (pkg) {
                    setForm({
                      ...form,
                      subscription: {
                        ...form.subscription,
                        packageId: pkg.id,
                        packageName: pkg.name,
                        limits: pkg.limits || {}
                      }
                    });
                  }
                }}
              >
                <option value="">Select Package</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.billingCycle})</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Subscription Status</label>
              <select
                className="w-full border rounded-[6px] px-3 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50/50"
                value={form.subscription?.status || "active"}
                onChange={(e) => setForm({
                  ...form,
                  subscription: { ...form.subscription, status: e.target.value }
                })}
              >
                <option value="active">Active (Standard)</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="canceled">Canceled</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-wrap gap-6 items-center">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Social Accounts</p>
                <p className="text-sm font-black text-slate-700">{form.subscription?.limits?.socialAccounts === -1 ? "Unlimited" : form.subscription?.limits?.socialAccounts || 0}</p>
              </div>
              <div className="w-[1px] h-8 bg-slate-200" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Monthly Posts</p>
                <p className="text-sm font-black text-slate-700">{form.subscription?.limits?.scheduledPosts === -1 ? "Unlimited" : form.subscription?.limits?.scheduledPosts || 0}</p>
              </div>
              <div className="w-[1px] h-8 bg-slate-200" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">User Seats</p>
                <p className="text-sm font-black text-slate-700">{form.subscription?.limits?.userSeats || 1}</p>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-4">
              <Button variant="secondary" type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Update User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
