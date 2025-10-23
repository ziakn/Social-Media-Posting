"use client";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import Layout from "../components/Layout";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const querySnapshot = await getDocs(collection(db, "roles"));
      const rolesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoles(rolesData);
    };
    fetchRoles();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "roles", id));
    setRoles(roles.filter((r) => r.id !== id));
  };

  return (
    <Layout>
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Roles</h2>
        <Link href="/firebase/roles/create" className="btn btn-primary">
          + Add Role
        </Link>
      </div>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>{role.description}</td>
              <td>{(role.permissions || []).join(", ")}</td>
              <td>
                <Link
                  href={`/firebase/roles/${role.id}/edit`}
                  className="btn btn-sm btn-warning me-2"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(role.id)}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </Layout>
  );
}
