"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Layout from "@/app/portal/components/Layout";

export default function EditTask() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [priority, setPriority] = useState("Normal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const router = useRouter();
  const params = useParams();
  const taskId = params.id;

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const docRef = doc(db, "tasks", taskId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title);
          setDescription(data.description);
          setStatus(data.status || "Pending");
          setPriority(data.priority || "Normal");
        } else {
          alert("Task not found!");
          router.push("/firebase/tasks");
        }
      } catch (error) {
        console.error(error);
        alert("Error fetching task: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      setAlert({ type: "danger", message: "Title and description are required." });
      return;
    }

    setSaving(true);
    setAlert({ type: "", message: "" });

    try {
      const docRef = doc(db, "tasks", taskId);
      await updateDoc(docRef, {
        title,
        description,
        status,
        priority,
      });

      setAlert({ type: "success", message: "Task updated successfully!" });

      setTimeout(() => router.push("/firebase/tasks"), 1500);
    } catch (error) {
      console.error(error);
      setAlert({ type: "danger", message: "Error updating task: " + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading task...</p>;

  return (
    <Layout>

    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Edit Task</h2>

              {alert.message && (
                <div className={`alert alert-${alert.type}`} role="alert">
                  {alert.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Update Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>);
}
