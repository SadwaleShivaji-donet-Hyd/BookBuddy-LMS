import React from "react"; // removed useState
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// Receive searchTerm and onSearchChange from Parent
const BrowseBooks = ({
  books,
  myHistory,
  onIssue,
  currentPage,
  totalPages,
  onPageChange,
  searchTerm,
  onSearchChange,
}) => {
  const isBorrowedByMe = (bookId) => {
    return myHistory.some(
      (txn) => txn.bookId === bookId && txn.status === "Issued"
    );
  };

  // NOTE: We REMOVED "filteredBooks".
  // The "books" prop passed here is ALREADY filtered by the backend.

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpenIcon className="h-7 w-7 text-indigo-500" /> Available Library
          Books
        </h2>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            placeholder="Search entire library..."
            value={searchTerm}
            // Call Parent Function
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Map directly over 'books' (Backend results) */}
        {books.length > 0 ? (
          books.map((book) => {
            const alreadyHas = isBorrowedByMe(book.bookId);
            const outOfStock = book.availableCopies < 1;

            return (
              <div
                key={book.bookId}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                {/* ... SAME CARD UI AS BEFORE ... */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      className="font-bold text-lg text-gray-900 line-clamp-1"
                      title={book.title}
                    >
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500">by {book.author}</p>
                    <span className="inline-block mt-2 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                      {book.genre}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                      outOfStock
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {outOfStock
                      ? "Out of Stock"
                      : `${book.availableCopies} Left`}
                  </span>
                </div>
                <button
                  onClick={() => onIssue(book.bookId)}
                  disabled={outOfStock || alreadyHas}
                  className={`w-full py-2 rounded-lg font-medium transition flex justify-center items-center gap-2
                                    ${
                                      alreadyHas
                                        ? "bg-green-100 text-green-700 cursor-default"
                                        : outOfStock
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                    }`}
                >
                  {alreadyHas ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5" /> Borrowed
                    </>
                  ) : outOfStock ? (
                    "Unavailable"
                  ) : (
                    "Issue Book"
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No books found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Pagination Controls ... (Same as before) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border ${
              currentPage === 1
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border ${
              currentPage === totalPages
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseBooks;
