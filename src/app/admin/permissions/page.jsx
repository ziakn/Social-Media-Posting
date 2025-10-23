"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";

export default function PermissionsList() {
  const router = useRouter();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "permissions"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPermissions(data);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;
    try {
      await deleteDoc(doc(db, "permissions", id));
      setPermissions(permissions.filter((p) => p.id !== id));
      alert("Permission deleted successfully!");
    } catch (error) {
      alert("Error deleting permission: " + error.message);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading permissions...</p>;

  return (
    <Layout>
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Permissions</h2>
          <button
            className="btn btn-success"
            onClick={() => router.push("/firebase/permissions/create")}
          >
            + Add Permission
          </button>
        </div>

        {permissions.length === 0 ? (
          <p>No permissions found.</p>
        ) : (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm) => (
                <tr key={perm.id}>
                  <td>{perm.name}</td>
                  <td>{perm.description || "—"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() =>
                        router.push(`/firebase/permissions/${perm.id}/edit`)
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(perm.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
