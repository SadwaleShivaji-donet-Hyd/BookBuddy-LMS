import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ClockIcon, // ✅ New Icon for pending returns
} from "@heroicons/react/24/outline";

const AdminCirculation = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetches all loan history (ensure your backend returns "ReturnPending" items here too)
      const response = await api.get("/circulation");
      if (response.data.isSuccess) {
        setTransactions(response.data.result);
      }
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  // ✅ ACTION 1: Approve Loan Request (Initial Borrow)
  const handleApproveLoan = async (id) => {
    try {
      const res = await api.put(`/circulation/approve/${id}`);
      if (res.data.isSuccess) {
        toast.success("Request Approved! Book Issued.");
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.displayMessage || "Approve failed.");
    }
  };

  // ✅ ACTION 2: Reject Loan Request
  const handleRejectLoan = async (id) => {
    if (!window.confirm("Reject this loan request?")) return;
    try {
      const res = await api.put(`/circulation/reject/${id}`);
      if (res.data.isSuccess) {
        toast.info("Request Rejected.");
        fetchData();
      }
    } catch (error) {
      toast.error("Rejection failed.");
    }
  };

  // ✅ ACTION 3: Approve Return (New Logic)
  // This is called when User has requested return and status is "ReturnPending"
  const handleApproveReturn = async (id) => {
    if (!window.confirm("Confirm book has been received?")) return;
    try {
      // Calls the new endpoint we added to Ocelot
      const res = await api.post(`/circulation/admin/approve-return/${id}`);
      if (res.data.isSuccess) {
        toast.success("Return Approved! Inventory Updated.");
        fetchData();
      }
    } catch (error) {
      toast.error("Approval failed");
    }
  };

  // ✅ ACTION 4: Force Return (Manual Admin Override)
  // Used if user forgets to click return, or lost the book
  const handleForceReturn = async (id) => {
    if (!window.confirm("Force return this book? (Use only if necessary)"))
      return;
    try {
      const res = await api.put(`/circulation/return/${id}`);
      if (res.data.isSuccess) {
        toast.success("Book Returned Manually.");
        fetchData();
      }
    } catch (error) {
      toast.error("Return failed");
    }
  };

  const handlePayFine = async (id) => {
    if (!window.confirm("Confirm cash payment received?")) return;
    try {
      const res = await api.post(`/circulation/pay-fine/${id}`);
      if (res.data.isSuccess) {
        toast.success("Fine Paid!");
        fetchData();
      }
    } catch (error) {
      toast.error("Payment failed");
    }
  };

  // Filtering Logic
  const filteredTransactions = transactions.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Pending Returns") return t.status === "ReturnPending"; // ✅ New Filter
    if (filter === "Overdue") {
      return t.status === "Issued" && new Date(t.dueDate) < new Date();
    }
    return t.status === filter;
  });

  const getStatusColor = (status, isPaid, fine) => {
    if (status === "Requested") return "bg-yellow-100 text-yellow-800";
    if (status === "ReturnPending")
      return "bg-orange-100 text-orange-800 border border-orange-200"; // ✅ New Color
    if (status === "Issued") return "bg-blue-100 text-blue-800";
    if (status === "Rejected")
      return "bg-red-50 text-red-800 border border-red-200";
    if (status === "Returned") {
      if (fine > 0 && !isPaid) return "bg-red-100 text-red-800";
      return "bg-gray-100 text-gray-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Librarian Desk</h1>
        <div className="flex flex-wrap gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
          {[
            "All",
            "Requested",
            "Pending Returns", // ✅ New Button
            "Issued",
            "Returned",
            "Rejected",
            "Overdue",
          ].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-colors ${
                filter === f
                  ? "bg-black text-white"
                  : "text-gray-500 hover:text-black hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr
                  key={t.transactionId}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{t.bookTitle}</div>
                    <div className="text-xs text-gray-500">ID: {t.bookId}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">
                      {t.userName || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500">#{t.userId}</div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>REQ: {formatDate(t.requestedDate)}</div>
                    {t.dueDate && (
                      <div className="text-xs text-orange-600">
                        DUE: {formatDate(t.dueDate)}
                      </div>
                    )}
                    {t.status === "ReturnPending" && (
                      <div className="text-xs text-blue-600 font-bold">
                        RET REQ: {formatDate(t.returnRequestedDate)}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(
                        t.status,
                        t.isFinePaid,
                        t.fineAmount
                      )}`}
                    >
                      {t.status === "ReturnPending"
                        ? "Return Pending"
                        : t.status}
                    </span>
                    {!t.isFinePaid && t.fineAmount > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-red-600 font-bold animate-pulse">
                        <CurrencyDollarIcon className="h-3 w-3" /> Due: $
                        {t.fineAmount}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* 1. APPROVE/REJECT LOAN */}
                      {t.status === "Requested" && (
                        <>
                          <button
                            onClick={() => handleApproveLoan(t.transactionId)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded border border-green-200 text-xs font-bold"
                          >
                            <CheckCircleIcon className="h-4 w-4" /> Issue
                          </button>
                          <button
                            onClick={() => handleRejectLoan(t.transactionId)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded border border-red-200 text-xs font-bold"
                          >
                            <XCircleIcon className="h-4 w-4" /> Reject
                          </button>
                        </>
                      )}

                      {/* 2. APPROVE RETURN (New Action) */}
                      {t.status === "ReturnPending" && (
                        <button
                          onClick={() => handleApproveReturn(t.transactionId)}
                          className="flex items-center gap-1 text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded shadow-sm text-xs font-bold"
                        >
                          <CheckCircleIcon className="h-4 w-4" /> Accept Return
                        </button>
                      )}

                      {/* 3. FORCE RETURN (For Issued Books) */}
                      {t.status === "Issued" && (
                        <button
                          onClick={() => handleForceReturn(t.transactionId)}
                          className="flex items-center gap-1 text-gray-500 hover:text-black bg-gray-50 px-2 py-1 rounded border border-gray-200 text-xs font-bold"
                        >
                          <ArrowPathIcon className="h-4 w-4" /> Force Return
                        </button>
                      )}

                      {/* 4. COLLECT FINE */}
                      {t.status === "Returned" &&
                        !t.isFinePaid &&
                        t.fineAmount > 0 && (
                          <button
                            onClick={() => handlePayFine(t.transactionId)}
                            className="flex items-center gap-1 text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded shadow-sm text-xs font-bold"
                          >
                            <CurrencyDollarIcon className="h-4 w-4" /> Collect
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCirculation;
