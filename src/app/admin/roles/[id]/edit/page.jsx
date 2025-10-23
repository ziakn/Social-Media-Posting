"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../components/Layout";

export default function EditRole() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch role and permissions
  useEffect(() => {
    const fetchRoleAndPermissions = async () => {
      try {
        // Fetch permissions list
        const permSnapshot = await getDocs(collection(db, "permissions"));
        const permsData = permSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPermissions(permsData);

        // Fetch role data
        const roleRef = doc(db, "roles", id);
        const roleSnap = await getDoc(roleRef);

        if (roleSnap.exists()) {
          const roleData = { id: roleSnap.id, ...roleSnap.data() };
          setRole(roleData);
          setSelectedPermissions(roleData.permissions || []);
        } else {
          alert("Role not found!");
          router.push("/firebase/roles");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error loading role: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoleAndPermissions();
  }, [id, router]);

  const handlePermissionToggle = (permId) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role.name.trim()) {
      alert("Role name is required!");
      return;
    }

    setSaving(true);
    try {
      const roleRef = doc(db, "roles", id);
      await updateDoc(roleRef, {
        name: role.name,
        description: role.description || "",
        permissions: selectedPermissions,
        updated_at: new Date(),
      });
      alert("Role updated successfully!");
      router.push("/firebase/roles");
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error updating role: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading role...</p>;
  if (!role) return null;

  return (
    <Layout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Edit Role</h3>
          <button className="btn btn-secondary" onClick={() => router.back()}>
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
          <div className="mb-3">
            <label className="form-label fw-bold">Role Name</label>
            <input
              type="text"
              className="form-control"
              value={role.name}
              onChange={(e) => setRole({ ...role, name: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Description</label>
            <textarea
              className="form-control"
              value={role.description || ""}
              onChange={(e) =>
                setRole({ ...role, description: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Permissions</label>
            <div className="border rounded p-3">
              {permissions.length === 0 ? (
                <p className="text-muted">No permissions available.</p>
              ) : (
                <div className="row">
                  {permissions.map((perm) => (
                    <div className="col-md-6 mb-2" key={perm.id}>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`perm-${perm.id}`}
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`perm-${perm.id}`}
                        >
                          {perm.name || perm.id}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mt-3"
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Role"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
