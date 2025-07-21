// app/(main)/admin/page.tsx
"use client";

import { useState } from "react";
import RequireAdminAuth from "@/components/RequireAdminAuth";
import AdminUploadForm from "@/components/AdminUploadForm";
import CreateUserForm from "@/components/CreateUserForm";
import YouTubeIngestForm from "@/components/YTIngest";
import { Upload, Youtube, UserPlus, Shield } from "lucide-react";

const tabs = [
  { name: "Upload Song", key: "upload", icon: Upload },
  { name: "Ingest from YouTube", key: "youtube", icon: Youtube },
  { name: "Create User", key: "user", icon: UserPlus },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <RequireAdminAuth>
      <div className="space-y-8">
        {/* Admin Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl" />
          <div className="relative glass rounded-3xl p-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-400 text-lg">
                  Manage your music platform with powerful admin tools
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl blur-xl -z-10" />
          <div className="glass rounded-3xl p-8">
            {activeTab === "upload" && <AdminUploadForm />}
            {activeTab === "youtube" && <YouTubeIngestForm />}
            {activeTab === "user" && <CreateUserForm />}
          </div>
        </div>
      </div>
    </RequireAdminAuth>
  );
}
