"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";

export default function CreateUser() {
  const [form, setForm] = useState({ name: "", email: "", role_id: "" });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRoles = async () => {
      const rolesSnap = await getDocs(collection(db, "roles"));
      const rolesData = rolesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoles(rolesData);
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role_id)
      return alert("Please fill all fields!");

    setLoading(true);
    try {
      const role = roles.find((r) => r.id === form.role_id);
      await addDoc(collection(db, "users"), {
        ...form,
        role_name: role?.name || "",
        created_at: new Date(),
      });
      alert("User created successfully!");
      router.push("/firebase/users");
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mt-5">
        <h2>Add User</h2>
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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Create User"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
