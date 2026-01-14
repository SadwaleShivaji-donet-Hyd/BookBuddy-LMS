import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const MyHistory = ({ myHistory, books, onReturn }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <ArrowPathIcon className="h-7 w-7 text-indigo-500" /> My Transactions
      </h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4">Book Details</th>
              <th className="p-4">Dates</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {myHistory.length > 0 ? (
              myHistory.map((txn) => {
                // Find book details for this transaction
                const bookDetails = books.find((b) => b.bookId === txn.bookId);

                return (
                  <tr
                    key={txn.id || txn.transactionId}
                    className="hover:bg-gray-50"
                  >
                    <td className="p-4">
                      {bookDetails ? (
                        <div>
                          <div className="font-bold text-gray-900 text-base">
                            {bookDetails.title}
                          </div>
                          <div className="text-gray-500">
                            {bookDetails.author}
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {bookDetails.genre}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">
                          Book #{txn.bookId}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-gray-900">
                        <span className="text-gray-400 text-xs uppercase mr-1">
                          Issued:
                        </span>
                        {new Date(txn.issueDate).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">
                        <span className="text-gray-400 text-xs uppercase mr-1">
                          Due:
                        </span>
                        {new Date(txn.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold 
                                            ${
                                              txn.status === "Issued"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : txn.status === "Returned"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {txn.status === "Issued" && (
                        <button
                          onClick={() => onReturn(txn.bookId)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50 transition"
                        >
                          Return Book
                        </button>
                      )}
                      {txn.status === "Returned" && (
                        <span className="text-gray-400 text-xs">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  You haven't borrowed any books yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyHistory;
