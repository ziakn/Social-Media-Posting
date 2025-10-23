"use client";

import { useEffect, useState } from "react";
import { db, auth, storage } from "../../../lib/firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "../components/Layout";

export default function IdeasDashboard() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/firebase/login");
      } else {
        setUser(currentUser);

        const q = query(collection(db, "ideas"), where("userId", "==", currentUser.uid));
        const unsubscribeIdeas = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setIdeas(data);
          setLoading(false);
        });

        return () => unsubscribeIdeas();
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleDelete = async (id, imageUrl) => {
    if (!confirm("Are you sure you want to delete this idea?")) return;

    try {
      await deleteDoc(doc(db, "ideas", id));

      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef).catch((err) => console.log("Image delete error:", err));
      }

      alert("Idea deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Error deleting idea: " + error.message);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (!user) return null;

  return (
    <Layout>
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Your Ideas</h2>
        <button
          className="btn btn-success"
          onClick={() => router.push("/firebase/ideas/create")}
        >
          + Add Idea
        </button>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center mt-5">
          <i className="bi bi-lightbulb display-1 text-warning mb-3"></i>
          <p className="fs-5">No ideas found. Click "Add Idea" to create your first idea.</p>
        </div>
      ) : (
        <div className="row g-4">
          {ideas.map((idea) => (
            <div className="col-md-6 col-lg-4" key={idea.id}>
              <div className="card h-100 shadow-sm border-0">
                {idea.imageUrl ? (
                  <img
                    src={idea.imageUrl}
                    className="card-img-top"
                    alt={idea.title}
                    style={{ objectFit: "cover", height: "200px" }}
                  />
                ) : (
                  <div
                    className="d-flex justify-content-center align-items-center bg-light"
                    style={{ height: "200px" }}
                  >
                    <i className="bi bi-card-image text-muted display-1"></i>
                  </div>
                )}

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold">{idea.title}</h5>
                  <p className="card-text flex-grow-1">
                    {idea.description.length > 100
                      ? idea.description.substring(0, 100) + "..."
                      : idea.description}
                  </p>

                  <span
                    className={`badge mb-3 ${
                      idea.status === "New"
                        ? "bg-primary"
                        : idea.status === "In Progress"
                        ? "bg-warning text-dark"
                        : "bg-success"
                    }`}
                  >
                    {idea.status}
                  </span>

                  <div className="mt-auto d-flex justify-content-between">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => router.push(`/firebase/ideas/${idea.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(idea.id, idea.imageUrl)}
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
    </Layout> );
}
