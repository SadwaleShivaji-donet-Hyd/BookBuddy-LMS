import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import api from "../../api/axiosConfig";

const Dashboard = () => {
  // 1. Get User from Redux with Safe Fallback
  const { user } = useSelector((state) => state.auth);
  // Ensure adminName is always a string, falling back to "Admin"
  const adminName = user?.name ? String(user.name) : "Admin User";

  // Stats State
  const [stats, setStats] = useState({
    userCount: 0,
    bookCount: 0,
    adminCount: 0,
    borrowed: 0,
    returned: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // 2. Fetch Real Data
        const [authRes, circRes, bookRes] = await Promise.all([
          api.get("/auth/stats"),
          api.get("/circulation/admin/stats"),
          api.get("/Books?page=1&pageSize=1"),
        ]);

        setStats({
          userCount: authRes.data.result?.userCount || 0,
          adminCount: authRes.data.result?.adminCount || 0,
          bookCount: bookRes.data.result?.totalCount || 0,
          borrowed: circRes.data.result?.borrowed || 0,
          returned: circRes.data.result?.returned || 0,
        });
      } catch (e) {
        console.error("Stats load failed. Using defaults.", e);
      }
    };
    // Uncomment this to enable real data fetching
    loadStats();
  }, []);

  // Chart Data
  const data = [
    { name: "Borrowed", value: stats.borrowed },
    { name: "Returned", value: stats.returned },
  ];

  const isDataEmpty = stats.borrowed === 0 && stats.returned === 0;
  const finalData = isDataEmpty ? [{ name: "No Data", value: 1 }] : data;
  const COLORS = isDataEmpty ? ["#e5e7eb"] : ["#1f2937", "#9ca3af"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Pie Chart Section */}
      {/* FIX: Added explicit style height to prevent Recharts error */}
      <div
        className="bg-white p-6 rounded-xl shadow-sm lg:col-span-1 flex flex-col justify-center items-center relative"
        style={{ height: 400 }}
      >
        <h3 className="absolute top-6 left-6 font-bold text-gray-700">
          Transaction Overview
        </h3>
        {/* ResponsiveContainer needs a parent with definite height */}
        <div style={{ width: "100%", height: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={finalData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={isDataEmpty ? 0 : 2}
                dataKey="value"
              >
                {finalData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {isDataEmpty && (
          <p className="text-xs text-gray-400 absolute bottom-12">
            No transactions yet
          </p>
        )}
      </div>

      {/* 2. Stats Cards & Profile */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon="👥" count={stats.userCount} label="Total User Base" />
          <StatCard
            icon="📚"
            count={stats.bookCount}
            label="Total Book Count"
          />
          <StatCard
            icon="🛡️"
            count={stats.adminCount}
            label="Total Admin Count"
          />
        </div>

        {/* Profile Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gray-900 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-3">
              {/* FIX: Bulletproof charAt check */}
              {(adminName || "A").charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-lg">{adminName}</h3>
            <p className="text-xs text-gray-500">
              Welcome to your admin dashboard.
            
            </p>
          </div>
          <div className="flex-1 bg-gray-50 p-6 rounded-lg border-l-4 border-black">
            <h2 className="text-xl font-bold text-gray-800 italic leading-relaxed">
              "Embarking on the journey of reading fosters personal growth,
              nurturing a path towards excellence."
            </h2>
            <p className="text-right mt-3 text-xs text-gray-500 font-bold">
              ~ BookWorm Team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, count, label }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between border border-gray-100 hover:shadow-md transition">
    <div className="bg-gray-50 p-3 rounded-lg text-2xl">{icon}</div>
    <div className="text-right">
      <h4 className="text-3xl font-bold text-gray-900">{count}</h4>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
        {label}
      </p>
    </div>
  </div>
);

export default Dashboard;
