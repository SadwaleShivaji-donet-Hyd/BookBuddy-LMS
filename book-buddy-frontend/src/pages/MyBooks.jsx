import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import {
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilSquareIcon,
  BellIcon, // ✅ Import Bell Icon
} from "@heroicons/react/24/outline";
import BookDetailsModal from "../components/BookDetailsModal";

const MyBooks = () => {
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]); // ✅ State for Notifications
  const [loading, setLoading] = useState(true);

  // State for Review Modal
  const [selectedBookForReview, setSelectedBookForReview] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // ✅ Fetch History AND Notifications in parallel
      const [historyRes, notifRes] = await Promise.all([
        api.get("/circulation/my-history"),
        api.get("/circulation/notifications"),
      ]);

      if (historyRes.data.isSuccess) {
        setTransactions(historyRes.data.result);
      }
      if (notifRes.data.isSuccess) {
        setNotifications(notifRes.data.result);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIC 1: FETCH FULL DETAILS FOR REVIEW
  const handleWriteReview = async (transaction) => {
    try {
      const res = await api.get(`/books/${transaction.bookId}`);
      if (res.data.isSuccess) {
        setSelectedBookForReview(res.data.result);
      } else {
        setSelectedBookForReview(transaction);
      }
    } catch (error) {
      console.error("Could not fetch details", error);
      setSelectedBookForReview({
        bookId: transaction.bookId,
        title: transaction.bookTitle,
        imageUrl: transaction.imageUrl,
      });
    }
  };

  // ✅ LOGIC 2: Cancel Request
  const handleCancelRequest = async (transactionId) => {
    if (!window.confirm("Are you sure you want to cancel this request?"))
      return;

    try {
      const response = await api.delete(`/circulation/cancel/${transactionId}`);
      if (response.data.isSuccess) {
        toast.success("Request cancelled.");
        fetchData(); // Refresh all data
      } else {
        toast.error(response.data.displayMessage);
      }
    } catch (error) {
      toast.error("Failed to cancel request.");
    }
  };

  // ✅ LOGIC 3: Return Book
  const handleReturn = async (transaction) => {
    if (!window.confirm(`Return "${transaction.bookTitle}"?`)) return;

    try {
      const res = await api.post("/circulation/return-request", {
        bookId: transaction.bookId,
      });

      if (res.data.isSuccess) {
        toast.success("Return Request Sent!");
        fetchData(); // Refresh all data
        handleWriteReview(transaction);
      } else {
        toast.error(res.data.displayMessage);
      }
    } catch (error) {
      toast.error("Failed to request return.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Issued":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
            Active Loan
          </span>
        );
      case "Requested":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3" /> Pending Approval
          </span>
        );
      case "ReturnPending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
            <ClockIcon className="h-3 w-3" /> Return Processing
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case "Returned":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <CheckCircleIcon className="h-3 w-3" /> Returned
          </span>
        );
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ NOTIFICATION BANNER */}
      {notifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-pulse">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            <BellIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 text-sm uppercase tracking-wide">
              Waitlist Alerts
            </h3>
            <div className="space-y-2 mt-1">
              {notifications.map((n, index) => (
                <div
                  key={index}
                  className="text-blue-800 text-sm flex items-center gap-2"
                >
                  <span>• {n.message}</span>
                  <a
                    href="/books"
                    className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 transition"
                  >
                    Go Borrow
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900">My Library Activity</h2>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading history...
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Book Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Due / Fine
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500 text-sm"
                  >
                    You haven't requested any books yet. <br />
                    <a
                      href="/books"
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Go request one!
                    </a>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr
                    key={t.transactionId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {t.bookTitle}
                      </div>
                      <div className="text-xs text-gray-400">
                        Ref: #{t.transactionId}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(t.requestedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {t.status === "Issued" ? (
                        <span className="text-orange-600 font-medium">
                          Due: {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      ) : t.status === "Returned" && t.fineAmount > 0 ? (
                        <span className="text-red-600 font-bold">
                          Fine: ${t.fineAmount}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* --- ACTION BUTTONS --- */}

                      {t.status === "Requested" && (
                        <button
                          onClick={() => handleCancelRequest(t.transactionId)}
                          className="text-red-500 hover:text-red-700 transition flex items-center justify-end gap-1 ml-auto text-xs font-bold uppercase"
                        >
                          <TrashIcon className="h-4 w-4" /> Cancel
                        </button>
                      )}

                      {t.status === "Issued" && (
                        <button
                          onClick={() => handleReturn(t)}
                          className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-gray-800 transition flex items-center gap-1 ml-auto"
                        >
                          <ArrowPathIcon className="h-4 w-4" /> Return
                        </button>
                      )}

                      {t.status === "Returned" && (
                        <button
                          onClick={() => handleWriteReview(t)}
                          className="text-blue-600 hover:text-blue-800 transition flex items-center justify-end gap-1 ml-auto text-xs font-bold"
                        >
                          <PencilSquareIcon className="h-4 w-4" /> Write Review
                        </button>
                      )}

                      {t.status === "ReturnPending" && (
                        <span className="text-xs text-gray-400 italic">
                          Wait for approval
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* RENDER REVIEW MODAL */}
      {selectedBookForReview && (
        <BookDetailsModal
          book={selectedBookForReview}
          onClose={() => setSelectedBookForReview(null)}
        />
      )}
    </div>
  );
};

export default MyBooks;
