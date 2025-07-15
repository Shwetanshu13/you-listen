// app/(main)/admin/page.tsx
"use client";

import { useState } from "react";
import RequireAdminAuth from "@/components/RequireAdminAuth";
import AdminUploadForm from "@/components/AdminUploadForm";
import CreateUserForm from "@/components/CreateUserForm";
import YouTubeIngestForm from "@/components/YTIngest";

const tabs = [
  { name: "Upload Song", key: "upload" },
  { name: "Ingest from YouTube", key: "youtube" },
  { name: "Create User", key: "user" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <RequireAdminAuth>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

        <div className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded ${
                activeTab === tab.key
                  ? "bg-pink-600 text-white"
                  : "bg-neutral-800 text-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === "upload" && <AdminUploadForm />}
          {activeTab === "youtube" && <YouTubeIngestForm />}
          {activeTab === "user" && <CreateUserForm />}
        </div>
      </div>
    </RequireAdminAuth>
  );
}
