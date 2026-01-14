import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

// --- PUBLIC PAGES ---
import Home from "./pages/Home"; // ✅ NEW IMPORT

// --- AUTH PAGES ---
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// --- LAYOUTS ---
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

// --- ADMIN PAGES ---
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminCirculation from "./pages/admin/AdminCirculation";
import AdminUsers from "./pages/admin/AdminUsers";

// --- USER PAGES ---
import UserDashboard from "./pages/UserDashboard";
import UserBooks from "./pages/UserBooks";
import MyBooks from "./pages/MyBooks";
import UserProfile from "./pages/UserProfile";

// =========================================================================
// 🔒 PROTECTED ROUTE COMPONENT
// =========================================================================
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }

    const userRole =
      decoded.role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (requiredRole && userRole !== requiredRole) {
      return userRole === "Admin" ? (
        <Navigate to="/admin/dashboard" replace />
      ) : (
        <Navigate to="/user-dashboard" replace />
      );
    }

    return children;
  } catch (error) {
    console.error("Token invalid:", error);
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
};

// =========================================================================
// 🚀 MAIN APP COMPONENT
// =========================================================================
function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      <Routes>
        {/* --- 🏠 PUBLIC LANDING PAGE --- */}
        {/* ✅ This is the main change: "/" now goes to Home */}
        <Route path="/" element={<Home />} />

        {/* --- AUTH ROUTES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* --- 👮 ADMIN ROUTES --- */}
        <Route
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<AdminBooks />} />
          <Route path="/admin/circulation" element={<AdminCirculation />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        {/* --- 👤 USER ROUTES --- */}
        <Route
          element={
            <ProtectedRoute requiredRole="User">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/books" element={<UserBooks />} />
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* --- FALLBACK --- */}
        {/* Redirect unknown routes to Home instead of Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
