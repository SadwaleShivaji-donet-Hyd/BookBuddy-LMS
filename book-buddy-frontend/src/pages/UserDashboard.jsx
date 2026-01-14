import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Link } from "react-router-dom";
import {
  BookOpenIcon,
  ClockIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const UserDashboard = () => {
  const [stats, setStats] = useState({ issued: 0, returned: 0, fines: 0 });
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user name from local storage if available
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch User Stats
      const statsRes = await api.get("/circulation/my-stats");
      if (statsRes.data.isSuccess) setStats(statsRes.data.result);

      // 2. Fetch Notifications (Waitlist alerts)
      const notifRes = await api.get("/circulation/notifications");
      if (notifRes.data.isSuccess) setNotifications(notifRes.data.result);
    } catch (error) {
      console.error("Dashboard load failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {userName}
          </h1>
          <p className="text-gray-500 mt-1">
            Here is your library activity overview.
          </p>
        </div>
        <div className="hidden md:block">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Member
          </span>
        </div>
      </div>

      {/* --- 🔔 NEW ATTRACTIVE NOTIFICATIONS --- */}
      {notifications.length > 0 && (
        <div className="transform transition-all hover:scale-[1.01] duration-300">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {/* Decorative Background Blob */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            {/* Notification Header */}
            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="p-2 bg-white rounded-lg shadow-sm text-orange-600">
                <BellAlertIcon className="h-6 w-6 animate-bounce-slow" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Good News! Stock Arrived
                </h2>
                <p className="text-sm text-gray-500">
                  Books you were waiting for are now available.
                </p>
              </div>
            </div>

            {/* Notification Cards Grid */}
            <div className="grid gap-3 relative z-10">
              {notifications.map((note) => (
                <div
                  key={note.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* Book Icon */}
                    <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                      <BookOpenIcon className="h-6 w-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-md">
                          {note.bookTitle}
                        </h3>
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Back in stock just now
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/books?search=${note.bookTitle}`}
                    className="mt-3 sm:mt-0 inline-flex items-center justify-center px-5 py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  >
                    Claim Now <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- 📊 STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex items-center transition hover:shadow-md">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600 mr-4">
            <BookOpenIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Books Borrowed</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.issued || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex items-center transition hover:shadow-md">
          <div className="p-3 bg-green-50 rounded-full text-green-600 mr-4">
            <CheckCircleIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Books Returned</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.returned || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex items-center transition hover:shadow-md">
          <div className="p-3 bg-red-50 rounded-full text-red-600 mr-4">
            <ClockIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Unpaid Fines</p>
            <p className="text-3xl font-bold text-gray-900">
              ${stats.fines || 0}
            </p>
          </div>
        </div>
      </div>

      {/* --- 🚀 QUICK ACTIONS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/books"
          className="group relative block bg-gray-900 rounded-2xl p-8 text-white shadow-lg overflow-hidden transition-transform hover:-translate-y-1"
        >
          {/* Abstract Decoration */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gray-800 rounded-full opacity-50"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="h-5 w-5 text-yellow-400" />
              <h3 className="text-xl font-bold">Browse Library</h3>
            </div>
            <p className="text-gray-300 text-sm max-w-xs">
              Explore our vast collection of books. Find your next favorite read
              and request it instantly.
            </p>
            <div className="mt-6 inline-flex items-center text-sm font-bold text-white group-hover:underline">
              Start Browsing <ArrowRightIcon className="ml-2 h-4 w-4" />
            </div>
          </div>
        </Link>

        <Link
          to="/my-books"
          className="group block bg-white border border-gray-200 rounded-2xl p-8 text-gray-900 shadow-sm hover:border-gray-300 transition-transform hover:-translate-y-1"
        >
          <h3 className="text-xl font-bold mb-3">View My History</h3>
          <p className="text-gray-500 text-sm mb-6">
            Check your due dates, pay fines, and review your past reading
            history.
          </p>
          <div className="inline-flex items-center text-sm font-bold text-black group-hover:underline">
            Go to History <ArrowRightIcon className="ml-2 h-4 w-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;
