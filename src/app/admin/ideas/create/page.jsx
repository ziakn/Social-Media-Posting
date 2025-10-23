"use client";

import { useState } from "react";
import { db, storage, auth } from "../../../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";

export default function AddIdea() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("New");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const router = useRouter();

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!title || !description) {
      setAlert({ type: "danger", message: "Title and description are required." });
      return;
    }
    if (title.length > 100) {
      setAlert({ type: "danger", message: "Title cannot exceed 100 characters." });
      return;
    }

    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      let imageUrl = "";
      if (image) {
        const storageRef = ref(storage, `ideas/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "ideas"), {
        title,
        description,
        category,
        status,
        imageUrl,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setAlert({ type: "success", message: "Idea added successfully!" });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setStatus("New");
      setImage(null);
      setImagePreview(null);

      // Redirect after short delay
      setTimeout(() => router.push("/firebase/ideas"), 1500);
    } catch (error) {
      console.error(error);
      setAlert({ type: "danger", message: "Error adding idea: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>

    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Add New Idea</h2>

              {alert.message && (
                <div className={`alert alert-${alert.type}`} role="alert">
                  {alert.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    type="text"
                    id="title"
                    className="form-control"
                    placeholder="Enter idea title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={100}
                  />
                  <div className="form-text">{title.length}/100 characters</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    className="form-control"
                    placeholder="Enter idea description"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category</label>
                  <input
                    type="text"
                    id="category"
                    className="form-control"
                    placeholder="Enter category (optional)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Image (optional)</label>
                  <input
                    type="file"
                    id="image"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="mb-1">Preview:</p>
                      <img src={imagePreview} alt="Preview" className="img-fluid rounded" />
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Add Idea"}
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
