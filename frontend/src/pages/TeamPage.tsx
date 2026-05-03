import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getStoredUser } from "../api/api";
import { listUsers } from "../services/userService";
import type { UserRecord } from "../services/userService";

type Role = "admin" | "agm" | "rm" | "bdm";

export function TeamPage() {
  const storedUser = getStoredUser() as { role?: Role } | null;
  const role = storedUser?.role;
  const isAdmin = role === "admin";

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      if (!isAdmin) {
        setUsers([]);
        return;
      }
      const data = await listUsers();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 pb-12">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-700">
          Team management is available to Admin users only.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500">User directory.</p>
        </div>
        <button
          type="button"
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-bold">Name</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Active</th>
                <th className="px-6 py-4 font-bold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{u.full_name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.role.toUpperCase()}</td>
                    <td className="px-6 py-4">{u.is_active ? "Yes" : "No"}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

