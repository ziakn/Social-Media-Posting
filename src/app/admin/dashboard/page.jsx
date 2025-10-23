"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // ✅ Load logged-in user from localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      router.replace("/firebase/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/firebase/login");
  };

  if (!user)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  return (
    <Layout>
      <div className="container mt-5">
        <div className="text-center mb-5">
          <h1 className="display-5">Welcome, {user.name}</h1>
          <p className="lead">You are successfully logged in to your dashboard.</p>
        </div>

        <div className="row g-4">
          {/* Card 1: Add New Idea */}
          <div className="col-md-4">
            <div
              className="card text-center shadow-sm h-100 border-primary cursor-pointer"
              onClick={() => router.push("/firebase/ideas/create")}
            >
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <i className="bi bi-plus-circle-fill display-4 text-primary mb-3"></i>
                <h5 className="card-title">Add New Idea</h5>
                <p className="card-text">
                  Create a new idea to track and manage your projects.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: View Ideas */}
          <div className="col-md-4">
            <div
              className="card text-center shadow-sm h-100 border-success cursor-pointer"
              onClick={() => router.push("/firebase/ideas")}
            >
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <i className="bi bi-card-list display-4 text-success mb-3"></i>
                <h5 className="card-title">View Ideas</h5>
                <p className="card-text">
                  See all your ideas in one place and manage them efficiently.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Logout */}
          <div className="col-md-4">
            <div
              className="card text-center shadow-sm h-100 border-danger cursor-pointer"
              onClick={handleLogout}
            >
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <i className="bi bi-box-arrow-right display-4 text-danger mb-3"></i>
                <h5 className="card-title">Logout</h5>
                <p className="card-text">Sign out from your account securely.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
