"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role_id: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role_id) {
      return alert("Please fill all fields!");
    }

    setLoading(true);
    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const userId = userCredential.user.uid;

      // 2️⃣ Save user in Firestore
      await addDoc(collection(db, "users"), {
        id: userId,
        name: form.name,
        email: form.email,
        role_id: form.role_id,
        role_name: "", // optional, you can fetch role name from roles collection if needed
        coinBalance: 100, // Initial free coins
        created_at: new Date(),
      });

      alert("User registered successfully!");
      router.push("/firebase/auth/login");
    } catch (error) {
      console.error("Error registering user:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="mt-4 card p-4 shadow-sm">
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
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Role ID</label>
          <input
            type="text"
            className="form-control"
            placeholder="Assign role id"
            value={form.role_id}
            onChange={(e) => setForm({ ...form, role_id: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
