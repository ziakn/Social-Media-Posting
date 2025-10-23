"use client";

import { useState } from "react";
import { db } from "../../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";

export default function CreatePermission() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Permission name is required!");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "permissions"), {
        name,
        description: description || "",
        created_at: new Date(),
      });
      alert("Permission created successfully!");
      router.push("/firebase/permissions");
    } catch (error) {
      alert("Error adding permission: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Create Permission</h3>
          <button className="btn btn-secondary" onClick={() => router.back()}>
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
          <div className="mb-3">
            <label className="form-label fw-bold">Permission Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. create_user"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Description</label>
            <textarea
              className="form-control"
              placeholder="Describe this permission..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mt-3"
            disabled={saving}
          >
            {saving ? "Saving..." : "Create Permission"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
