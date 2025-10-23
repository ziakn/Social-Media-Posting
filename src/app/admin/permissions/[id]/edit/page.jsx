"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../components/Layout";

export default function EditPermission() {
  const router = useRouter();
  const { id } = useParams();
  const [permission, setPermission] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermission = async () => {
      try {
        const docRef = doc(db, "permissions", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPermission({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert("Permission not found!");
          router.push("/firebase/permissions");
        }
      } catch (error) {
        alert("Error loading permission: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPermission();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!permission.name.trim()) {
      alert("Permission name is required!");
      return;
    }

    setSaving(true);
    try {
      const ref = doc(db, "permissions", id);
      await updateDoc(ref, {
        name: permission.name,
        description: permission.description || "",
        updated_at: new Date(),
      });
      alert("Permission updated successfully!");
      router.push("/firebase/permissions");
    } catch (error) {
      alert("Error updating permission: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading permission...</p>;
  if (!permission) return null;

  return (
    <Layout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Edit Permission</h3>
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
              value={permission.name}
              onChange={(e) =>
                setPermission({ ...permission, name: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Description</label>
            <textarea
              className="form-control"
              value={permission.description || ""}
              onChange={(e) =>
                setPermission({ ...permission, description: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mt-3"
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Permission"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
