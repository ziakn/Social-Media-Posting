"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../../lib/firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";

export default function TasksDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    const q = query(collection(db, "tasks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

 

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteDoc(doc(db, "tasks", id));
      alert("Task deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Error deleting task: " + error.message);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading tasks...</p>;

  return (
    <Layout>

    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Tasks</h2>
        <button className="btn btn-success" onClick={() => router.push("/firebase/tasks/create")}>
          + Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <p>No tasks found. Click "Add Task" to create your first task.</p>
      ) : (
        <div className="row">
          {tasks.map((task) => (
            <div className="col-md-6 mb-3" key={task.id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{task.title}</h5>
                  <p className="card-text">{task.description}</p>
                  <p>
                    <span className={`badge ${
                      task.status === "Pending"
                        ? "bg-warning text-dark"
                        : task.status === "In Progress"
                        ? "bg-primary"
                        : "bg-success"
                    }`}>
                      {task.status}
                    </span>{" "}
                    <span className="badge bg-secondary">{task.priority}</span>
                  </p>
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => router.push(`/firebase/tasks/${task.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </Layout>
  );
}
