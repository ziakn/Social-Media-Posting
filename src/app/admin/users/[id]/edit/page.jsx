"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function EditUser() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", role_id: "" });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
       try {
           const res = await fetch(API_ROUTES.USERS_EDIT, {
             method: "GET",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ email, password }),
           });
     
           const data = await res.json();
           setLoading(false);
     
           if (!res.ok) {
             setAlert(data.error || "Login failed!");
             return;
           }
     
           localStorage.setItem("currentUser", JSON.stringify(data.user));
           setSuccess(true); // Show success notification
     
           // Redirect after a short delay to show the success alert
           setTimeout(() => router.push(ROUTES.ADMIN_DASHBOARD), 1000);
         } catch (error) {
           console.error(error);
           setLoading(false);
           setAlert("Login failed: " + error.message);
         }
      setRoles(rolesData);
      if (userSnap.exists()) {
        setForm(userSnap.data());
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role_id)
      return alert("Please fill all fields!");
    try {
      const role = roles.find((r) => r.id === form.role_id);
      await updateDoc(doc(db, "users", id), {
        ...form,
        role_name: role?.name || "",
      });
      alert("User updated successfully!");
      router.push("/firebase/users");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user: " + error.message);
    }
  };

   if (loading)return <Spinner/>;

  return (
      <div className="container mt-5">
        <h2>Edit User</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              className="form-select"
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

          <button type="submit" className="btn btn-primary">
            Update User
          </button>
        </form>
      </div>
  );
}
