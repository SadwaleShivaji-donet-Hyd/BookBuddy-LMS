import React, { useState } from "react";
import { XMarkIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";

const ChangePasswordModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      // Assuming you have an endpoint for this in Identity Service
      const response = await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.data.isSuccess) {
        toast.success("Password updated successfully");
        onClose();
      } else {
        toast.error(
          response.data.displayMessage || "Failed to update password"
        );
      }
    } catch (error) {
      toast.error("Error updating password");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Cog6ToothIcon className="h-5 w-5 text-gray-700" />
            </div>
            <h3 className="font-bold text-lg text-gray-800">
              Change Credentials
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <input
              type="password"
              name="currentPassword"
              placeholder="Enter Current Password"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter New Password"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition"
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 transition"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-black hover:bg-gray-800 transition shadow-lg"
            >
              CONFIRM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
