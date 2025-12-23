import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import api from "../api/axiosConfig"; // ✅ Import API
import {
  HomeIcon,
  BookOpenIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  BellIcon, // ✅ Import Bell Icon
} from "@heroicons/react/24/outline";

const UserLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get User Info from Redux
  const { user } = useSelector((state) => state.auth);
  const userName = user?.name || "Member";

  // ✅ STATE: Notification Count
  const [notifyCount, setNotifyCount] = useState(0);

  // ✅ EFFECT: Fetch Notifications on Load
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/circulation/notifications");
        if (res.data.isSuccess) {
          setNotifyCount(res.data.result.length);
        }
      } catch (err) {
        console.error("Failed to load notifications");
      }
    };

    fetchNotifications();

    // Optional: Poll every 60 seconds to keep it fresh
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

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
            <span className="text-3xl">📚</span>
            <div>
              BookBuddy
              <span className="text-[10px] block text-gray-400 font-normal tracking-widest">
                MEMBER
              </span>
            </div>
          </h1>
        </div>

        <nav className="flex-1 mt-6">
          <Link
            to="/user-dashboard"
            className={getLinkClass("/user-dashboard")}
          >
            <HomeIcon className="h-5 w-5" /> Dashboard
          </Link>
          <Link to="/books" className={getLinkClass("/books")}>
            <BookOpenIcon className="h-5 w-5" /> Browse Books
          </Link>
          <Link to="/my-books" className={getLinkClass("/my-books")}>
            <ClockIcon className="h-5 w-5" /> My History
          </Link>
          <Link to="/profile" className={getLinkClass("/profile")}>
            <UserCircleIcon className="h-5 w-5" /> My Profile
          </Link>
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
          <h2 className="text-xl font-bold text-gray-800">
            Welcome, {userName}
          </h2>

          <div className="flex items-center gap-4">
            {/* ✅ NOTIFICATION BELL */}
            <button
              onClick={() => navigate("/my-books")} // Go to history to see the details
              className="relative text-gray-500 hover:text-blue-600 transition-colors p-1"
              title="View Waitlist Alerts"
            >
              <BellIcon className="h-6 w-6" />
              {notifyCount > 0 && (
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500 transform translate-x-1/4 -translate-y-1/4"></span>
              )}
            </button>

            {/* Header Profile Circle */}
            <Link to="/profile">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 border border-gray-300 hover:border-black transition">
                {userName.charAt(0).toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        <main className="p-8 bg-gray-50 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
