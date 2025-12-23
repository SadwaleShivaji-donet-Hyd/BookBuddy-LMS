import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  UsersIcon,
  BookOpenIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// Import Solid icons for the leaderboard headers
import { TrophyIcon, UserCircleIcon } from "@heroicons/react/24/solid";

const AdminDashboard = () => {
  // 1. STATE MANAGEMENT
  const [stats, setStats] = useState({
    borrowed: 0,
    returned: 0,
    requested: 0,
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. FETCH DATA
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Execute all 4 API calls in parallel for speed
      const [statsRes, weeklyRes, booksRes, usersRes] = await Promise.all([
        api.get("/circulation/stats"),
        api.get("/circulation/stats/weekly"),
        api.get("/circulation/stats/top-books"),
        api.get("/circulation/stats/top-users"),
      ]);

      if (statsRes.data.isSuccess) setStats(statsRes.data.result);
      if (weeklyRes.data.isSuccess) setWeeklyData(weeklyRes.data.result);
      if (booksRes.data.isSuccess) setTopBooks(booksRes.data.result);
      if (usersRes.data.isSuccess) setTopUsers(usersRes.data.result);
    } catch (error) {
      console.error("Dashboard load failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. CHART CONFIG
  const pieData = [
    { name: "Active Loans", value: stats.borrowed },
    { name: "Returned", value: stats.returned },
    { name: "Pending Requests", value: stats.requested },
  ];
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B"]; // Blue, Green, Yellow

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 animate-pulse font-medium">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Library Insights</h1>
        <button
          onClick={fetchData}
          className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition"
          title="Refresh Data"
        >
          <ArrowPathIcon className="h-6 w-6" />
        </button>
      </div>

      {/* SECTION 1: KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex items-center transition hover:shadow-md">
          <div className="p-4 bg-blue-50 rounded-full text-blue-600 mr-4">
            <BookOpenIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Currently Issued
            </p>
            <p className="text-3xl font-bold text-gray-900">{stats.borrowed}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex items-center transition hover:shadow-md">
          <div className="p-4 bg-green-50 rounded-full text-green-600 mr-4">
            <CheckBadgeIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Returned</p>
            <p className="text-3xl font-bold text-gray-900">{stats.returned}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-100 flex items-center transition hover:shadow-md">
          <div className="p-4 bg-yellow-50 rounded-full text-yellow-600 mr-4">
            <UsersIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Pending Requests
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.requested}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Activity (Last 7 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="requests"
                  fill="#111827"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Status Overview
          </h3>
          <div className="h-80 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 3: LEADERBOARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Books List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrophyIcon className="h-6 w-6 text-yellow-500" /> Most Popular
            Books
          </h3>
          <div className="space-y-4">
            {topBooks.length === 0 ? (
              <p className="text-gray-400 text-sm">No data recorded yet.</p>
            ) : (
              topBooks.map((book, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-gray-300 w-6">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-gray-800 line-clamp-1">
                      {book.title}
                    </span>
                  </div>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                    {book.count} Requests
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Users List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <UserCircleIcon className="h-6 w-6 text-purple-600" /> Power Readers
          </h3>
          <div className="space-y-4">
            {topUsers.length === 0 ? (
              <p className="text-gray-400 text-sm">No user activity yet.</p>
            ) : (
              topUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {user.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-400">Rank #{index + 1}</p>
                    </div>
                  </div>
                  <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                    {user.count} Books
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
