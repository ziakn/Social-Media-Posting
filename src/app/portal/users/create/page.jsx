"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_ROUTES } from "@/constants/api";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { db } from "@/lib/firebase";

const creatorTypes = [
  "Influencer", "Content Creator", "Agency", "Digital Artist", "Social Marketer"
];

const allCountries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
  "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic",
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti",
  "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland",
  "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan",
  "Palestine", "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Singapore", "Slovakia",
  "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Vietnam"
].sort();

export default function CreateUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
    creatorType: "Content Creator",
    country: "United Arab Emirates",
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRoles();
  }, []);


  const fetchRoles = async () => {
    try {
      setLoading(true);

      const res = await fetch(API_ROUTES.ROLES, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setRoles(data.roles);
    } catch (error) {
      toast.error("Some Thing went Wrong !");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role_id) {
      toast.warning("Fill The Form Correctly");
      return;
    }
    try {
      const res = await fetch(API_ROUTES.USERS_CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create user");

      toast.success("User Created Successfully");
      router.push(ROUTES.PORTAL_USER);
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Some Thing went Wrong !");
    }
  };


  if (loading) return <Spinner />;

  return (
    <div className="p-6">
      <Card className="shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Add New User</CardTitle>
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
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Identity (Creator Type)</label>
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                value={form.creatorType}
                onChange={(e) => setForm({ ...form, creatorType: e.target.value })}
              >
                {creatorTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Origin (Country)</label>
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              >
                {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
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

            <div className="md:col-span-2 flex justify-end">
              <Button variant="secondary" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
