import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/auth/users");
      if (response.data.isSuccess) {
        // Debug log to check property names if needed
        // console.log("Users loaded:", response.data.result);
        setUsers(response.data.result);
      }
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic: Search by Name, Email, or Role
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();

    // Robust checking for properties (handles lowercase/uppercase differences)
    const name = (user.name || user.Name || user.userName || "").toLowerCase();
    const email = (user.email || user.Email || "").toLowerCase();
    const role = (user.role || user.Role || "").toLowerCase();

    return name.includes(term) || email.includes(term) || role.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>

        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-64 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                User ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  No users found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => {
                // Determine the ID and Name safely
                const userId = user.userId || user.id || user.Id || index;
                const userName =
                  user.name || user.Name || user.userName || "Unknown";
                const userEmail = user.email || user.Email;
                const userRole = user.role || user.Role || "User";

                return (
                  <tr key={userId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <UserCircleIcon className="h-6 w-6" />
                      </div>
                      <span className="font-bold text-gray-900">
                        {userName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        {userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide
                                                ${
                                                  userRole.toLowerCase() ===
                                                  "admin"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : "bg-blue-100 text-blue-800"
                                                }`}
                      >
                        {userRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-400 font-mono">
                      #{userId}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="text-right text-xs text-gray-400 mt-2">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
};

export default AdminUsers;
