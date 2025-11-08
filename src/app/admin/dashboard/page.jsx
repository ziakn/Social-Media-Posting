"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  if (!loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Welcome, </h1>
        <p className="text-gray-600 text-lg">
          You are successfully logged in to your dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add New Idea */}
        <div
          onClick={() => router.push("/firebase/ideas/create")}
          className="cursor-pointer border-2 border-blue-500 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 p-6 flex flex-col items-center text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Add New Idea</h2>
          <p className="text-gray-600">
            Create a new idea to track and manage your projects.
          </p>
        </div>

        {/* View Ideas */}
        <div
          onClick={() => router.push("/firebase/ideas")}
          className="cursor-pointer border-2 border-green-500 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 p-6 flex flex-col items-center text-center"
        >
          <h2 className="text-xl font-semibold mb-2">View Ideas</h2>
          <p className="text-gray-600">
            See all your ideas in one place and manage them efficiently.
          </p>
        </div>

        {/* Logout */}
        <div
          className="cursor-pointer border-2 border-red-500 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 p-6 flex flex-col items-center text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Logout</h2>
          <p className="text-gray-600">Sign out from your account securely.</p>
        </div>
      </div>
    </div>
  );
}
