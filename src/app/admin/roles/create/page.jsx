"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";

export default function CreateRole() {
  const router = useRouter();
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "permissions"));
        const permsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPermissions(permsData);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };
    fetchPermissions();
  }, []);

  const handlePermissionToggle = (permId) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      alert("Role name is required!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "roles"), {
        name: roleName,
        description: description || "",
        permissions: selectedPermissions,
        created_at: new Date(),
      });
      alert("Role created successfully!");
      router.push("/firebase/roles");
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Error creating role: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Create New Role</h3>
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
              placeholder="Enter role name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Description</label>
            <textarea
              className="form-control"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            disabled={loading}
          >
            {loading ? "Saving..." : "Create Role"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
