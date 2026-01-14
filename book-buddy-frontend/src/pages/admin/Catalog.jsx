import React, { useState } from "react";

const Catalog = () => {
  const [activeTab, setActiveTab] = useState("borrowed"); // 'borrowed' | 'overdue'

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("borrowed")}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${
            activeTab === "borrowed"
              ? "bg-black text-white"
              : "bg-white text-gray-500"
          }`}
        >
          Borrowed Books
        </button>
        <button
          onClick={() => setActiveTab("overdue")}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${
            activeTab === "overdue"
              ? "bg-black text-white"
              : "bg-white text-gray-500"
          }`}
        >
          Overdue Borrowers
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase font-bold text-xs">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Username</th>
              <th className="p-4">Email</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4 text-center">Return</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* Map your transaction data here */}
            <tr className="hover:bg-gray-50">
              <td className="p-4 text-gray-500">1</td>
              <td className="p-4 font-medium">John Doe</td>
              <td className="p-4 text-gray-500">jhon@gmail.com</td>
              <td className="p-4">28-02-2025</td>
              <td className="p-4 text-gray-400">21-02-2025 11:06</td>
              <td className="p-4 text-center">
                <button className="bg-black text-white p-1 rounded hover:bg-gray-800">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Catalog;
