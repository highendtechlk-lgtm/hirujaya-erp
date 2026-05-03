import React from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getStoredUser } from "../api/api";

type Role = "admin" | "agm" | "rm" | "bdm";

export function SettingsPage() {
  const navigate = useNavigate();
  const storedUser = getStoredUser() as { full_name?: string; email?: string; role?: Role } | null;

  const onLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Account and session.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
        <div className="text-sm text-gray-500">Signed in as</div>
        <div className="text-lg font-bold text-gray-900">{storedUser?.full_name || "—"}</div>
        <div className="text-sm text-gray-700">{storedUser?.email || "—"}</div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Role: {storedUser?.role?.toUpperCase() || "—"}
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="px-5 py-3 bg-brand-navy hover:bg-brand-navy-light text-white rounded-lg font-semibold"
      >
        Log out
      </button>
    </div>
  );
}

