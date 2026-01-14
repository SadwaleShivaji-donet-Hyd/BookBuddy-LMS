import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { loginSuccess } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  // Simple state: just email and password
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Clear any old session data
      localStorage.clear();

      // 2. Direct API Call (No OTP step)
      const response = await api.post("/auth/login", formData);

      if (response.data.isSuccess) {
        const token = response.data.result.token;

        // 3. Save Token & Update Redux
        dispatch(loginSuccess(token));

        // 4. Decode Token to check Role for Redirect
        const decoded = jwtDecode(token);
        // Handle both standard Role claim and Microsoft's long URL claim
        const userRole =
          decoded.role ||
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        toast.success(`Welcome back!`);

        // 5. Redirect based on Role
        if (userRole === "Admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        // Handle business logic errors (e.g. "Invalid Password")
        toast.error(response.data.displayMessage || "Invalid Credentials");
      }
    } catch (error) {
      // Handle network/server errors
      const errorMessage =
        error.response?.data?.displayMessage || "Login Failed. Server Error?";
      toast.error(errorMessage);
      console.error("Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <span className="text-4xl">📚</span>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your credentials to login
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="sr-only">Email address</label>
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="sr-only">Password</label>
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-gray-600 hover:text-black"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-black hover:bg-gray-800 transition-all ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Processing..." : "LOGIN"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            New to BookWorm?{" "}
            <Link
              to="/register"
              className="font-bold text-black hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
