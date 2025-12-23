import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import {
  UserCircleIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilSquareIcon, // ✅ Edit Icon
  CheckIcon, // ✅ Save Icon
  XMarkIcon, // ✅ Cancel Icon
} from "@heroicons/react/24/outline";

const UserProfile = () => {
  // State for Viewing
  const [user, setUser] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });

  // State for Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", phoneNumber: "" });

  // State for Password
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);

  // ✅ FETCH PROFILE
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/auth/profile");
      if (response.data) {
        setUser(response.data);
        // Initialize edit form with current data
        setEditData({
          name: response.data.name,
          phoneNumber: response.data.phoneNumber || "",
        });
      }
    } catch (error) {
      console.error("Profile load failed", error);
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ TOGGLE EDIT MODE
  const handleEditClick = () => {
    setEditData({ name: user.name, phoneNumber: user.phoneNumber || "" });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // ✅ SAVE PROFILE CHANGES
  const handleSaveProfile = async () => {
    try {
      const res = await api.put("/auth/profile", editData);
      if (res.data.isSuccess) {
        toast.success("Profile Updated!");
        setIsEditing(false);
        fetchProfile(); // Refresh data to be sure
      } else {
        toast.error(res.data.displayMessage);
      }
    } catch (error) {
      toast.error("Update failed.");
    }
  };

  // ... (Keep existing Password Change Logic here) ...
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    try {
      const payload = {
        email: user.email,
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      };
      const res = await api.post("/auth/change-password", payload);
      if (res.data.isSuccess) {
        toast.success("Password Updated Successfully!");
        setPassData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(res.data.displayMessage);
      }
    } catch (error) {
      toast.error("Failed to change password.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* --- 1. PROFILE DETAILS CARD --- */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit relative">
          {/* Header with Edit Button */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <UserCircleIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Account Details
                </h2>
                <p className="text-sm text-gray-500">
                  Your personal information
                </p>
              </div>
            </div>

            {/* Edit Controls */}
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                className="text-gray-500 hover:text-black p-2 hover:bg-gray-100 rounded-lg transition"
                title="Edit Profile"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="text-green-600 hover:bg-green-50 p-2 rounded-lg"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* NAME FIELD */}
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1">
                  <UserCircleIcon className="h-4 w-4" /> Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full border-b-2 border-blue-500 bg-blue-50 px-2 py-1 outline-none text-lg font-medium text-gray-900"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900 pl-1">
                    {user.name}
                  </p>
                )}
              </div>

              {/* EMAIL FIELD (Read Only) */}
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1">
                  <EnvelopeIcon className="h-4 w-4" /> Email Address
                </label>
                <p
                  className="text-lg font-medium text-gray-400 pl-1 cursor-not-allowed"
                  title="Email cannot be changed"
                >
                  {user.email}
                </p>
              </div>

              {/* PHONE FIELD */}
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1">
                  <PhoneIcon className="h-4 w-4" /> Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full border-b-2 border-blue-500 bg-blue-50 px-2 py-1 outline-none text-lg font-medium text-gray-900"
                    value={editData.phoneNumber}
                    onChange={(e) =>
                      setEditData({ ...editData, phoneNumber: e.target.value })
                    }
                    placeholder="Add phone number..."
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900 pl-1">
                    {user.phoneNumber || "N/A"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- 2. CHANGE PASSWORD CARD (Unchanged) --- */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
            <div className="p-3 bg-orange-50 rounded-full text-orange-600">
              <KeyIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Security</h2>
              <p className="text-sm text-gray-500">Update your password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-black outline-none"
                value={passData.currentPassword}
                onChange={(e) =>
                  setPassData({ ...passData, currentPassword: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-black outline-none"
                value={passData.newPassword}
                onChange={(e) =>
                  setPassData({ ...passData, newPassword: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-black outline-none ${
                  passData.confirmPassword &&
                  passData.newPassword !== passData.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                value={passData.confirmPassword}
                onChange={(e) =>
                  setPassData({ ...passData, confirmPassword: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-3.5 rounded-lg hover:bg-gray-800 transition"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
