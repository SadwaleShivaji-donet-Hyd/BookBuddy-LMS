// ✅ REMOVED UNUSED useEffect
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import { LockClosedIcon } from "@heroicons/react/24/outline";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-fill email if passed from previous page
  const initialEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      const payload = {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      };

      const response = await api.post("/auth/reset-password", payload);

      if (response.data.isSuccess) {
        toast.success("Password Reset Successful! Please Login.");
        navigate("/login");
      } else {
        toast.error(response.data.displayMessage || "Reset Failed");
      }
    } catch (error) {
      toast.error("Error resetting password. Invalid OTP?");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <LockClosedIcon className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Check your email for the OTP code.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email Input */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* OTP Input */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                OTP Code
              </label>
              <input
                name="otp"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm tracking-widest"
                placeholder="123456"
                maxLength={6}
                value={formData.otp}
                onChange={handleChange}
              />
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                New Password
              </label>
              <input
                name="newPassword"
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
