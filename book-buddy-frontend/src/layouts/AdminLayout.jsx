import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import {
  HomeIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// Import the new components
import ChangePasswordModal from "../components/ChangePasswordModal";
import AddNewAdminModal from "../components/AddNewAdminModal"; // <--- IMPORT THIS

const AdminLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State for Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false); // <--- NEW STATE

  // 1. Get Real User Data
  const { user } = useSelector((state) => state.auth);
  const adminName = user?.name ? String(user.name) : "Admin User";
  const adminRole = user?.role || "Administrator";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-4 px-6 py-3 transition-colors ${
      isActive
        ? "text-white font-bold border-l-4 border-white bg-gray-900"
        : "text-gray-400 hover:text-white hover:bg-gray-900"
    }`;
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-black text-white flex flex-col fixed h-full z-20">
        <div className="p-8">
          <h1 className="text-2xl font-bold tracking-wider flex items-center gap-2">
            <span className="text-3xl">🤖</span>
            <div>
              BookBuddy
              <span className="text-[10px] block text-gray-400 font-normal tracking-widest">
                LIBRARY
              </span>
            </div>
          </h1>
        </div>

        <nav className="flex-1 mt-6">
          <Link
            to="/admin/dashboard"
            className={getLinkClass("/admin/dashboard")}
          >
            <HomeIcon className="h-5 w-5" /> Dashboard
          </Link>
          <Link to="/admin/books" className={getLinkClass("/admin/books")}>
            <BookOpenIcon className="h-5 w-5" /> Books
          </Link>
          {/* ✅ CORRECTED LINK: Points to "circulation" to match App.jsx */}
          <Link
            to="/admin/circulation"
            className={getLinkClass("/admin/circulation")}
          >
            <ClipboardDocumentListIcon className="h-5 w-5" /> Circulation
          </Link>
          <Link to="/admin/users" className={getLinkClass("/admin/users")}>
            <UsersIcon className="h-5 w-5" /> Users
          </Link>

          {/* ADD NEW ADMIN BUTTON */}
          <button
            onClick={() => setIsAddAdminOpen(true)} // <--- TRIGGER MODAL
            className="w-full text-left px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-900 cursor-pointer flex items-center gap-4 transition-colors"
          >
            <span className="h-5 w-5 font-bold text-lg text-center leading-5">
              +
            </span>{" "}
            Add New Admin
          </button>
        </nav>

        <div className="p-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors w-full"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" /> Log Out
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 ml-64 flex flex-col">
        <header className="bg-white h-16 flex justify-between items-center px-8 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500 font-bold border border-gray-300">
              {(adminName || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{adminName}</p>
              <p className="text-xs text-gray-500">{adminRole}</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Cog6ToothIcon className="h-6 w-6" />
          </button>
        </header>

        <main className="p-8 bg-gray-100 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* RENDER MODALS CONDITIONALLY */}
      {isSettingsOpen && (
        <ChangePasswordModal onClose={() => setIsSettingsOpen(false)} />
      )}
      {isAddAdminOpen && (
        <AddNewAdminModal onClose={() => setIsAddAdminOpen(false)} />
      )}
    </div>
  );
};

export default AdminLayout;
