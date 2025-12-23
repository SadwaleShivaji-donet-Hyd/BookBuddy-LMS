import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // This endpoint needs to be added to Ocelot & Identity Service
        const response = await api.get("/auth/users");
        if (response.data.isSuccess) {
          setUsers(response.data.result);
        }
      } catch (error) {
        console.error("Failed to load users", error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Registered Users</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Registered On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-500">{user.id}</td>
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-gray-500">{user.email}</td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-xs font-bold">
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {new Date(
                    user.registeredOn || Date.now()
                  ).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
