import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import {
  BellAlertIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import BookDetailsModal from "../components/BookDetailsModal";

const UserBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination State
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;

  // Modal State
  const [selectedBook, setSelectedBook] = useState(null);

  const genres = [
    "All",
    "Fiction",
    "Non-Fiction",
    "Sci-Fi",
    "Technology",
    "History",
    "Mystery",
    "Other",
  ];

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedGenre, searchTerm]);

  // Debounce search fetch
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [selectedGenre, searchTerm, page]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const genreParam =
        selectedGenre === "All" ? "" : `&genre=${selectedGenre}`;
      const searchParam = searchTerm ? `&search=${searchTerm}` : "";

      // Call the API with pagination and filters
      const url = `/books?page=${page}&limit=${pageSize}${genreParam}${searchParam}`;
      const response = await api.get(url);

      if (response.data.isSuccess) {
        const result = response.data.result;
        setBooks(result.items || []);
        setTotalPages(result.totalPages || 1);
      }
    } catch (error) {
      console.error("Load error", error);
      toast.error("Failed to load library catalog.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UNIFIED ACTION HANDLER (Borrow or Waitlist)
  const handleAction = async (book, endpoint, successMsg) => {
    try {
      const res = await api.post(endpoint, {
        bookId: book.bookId,
        bookTitle: book.title,
      });

      if (res.data.isSuccess) {
        toast.success(successMsg);
      } else {
        // Backend usually returns "Already on waitlist" or similar messages here
        toast.info(res.data.displayMessage);
      }
    } catch (error) {
      const serverMessage =
        error.response?.data?.displayMessage || "Action failed";
      // 400 often means logic error (Limit reached, Already requested)
      if (error.response?.status === 400) {
        toast.warning(serverMessage);
      } else {
        toast.error(serverMessage);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Library Catalog</h1>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search books..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* GENRE TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200 scrollbar-hide">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-4 py-2 text-sm font-bold rounded-full whitespace-nowrap transition-all border
                ${
                  selectedGenre === g
                    ? "bg-black text-white border-black shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* BOOK GRID */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
          {books.length > 0 ? (
            books.map((book) => (
              <div
                key={book.bookId}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 flex flex-col justify-between group"
              >
                <div>
                  {/* BOOK IMAGE (Clickable) */}
                  <div
                    onClick={() => setSelectedBook(book)}
                    className="h-48 w-full bg-gray-100 rounded-lg mb-4 overflow-hidden cursor-pointer relative"
                  >
                    <img
                      src={
                        book.imageUrl ||
                        "https://via.placeholder.com/300x450?text=No+Cover"
                      }
                      alt={book.title}
                      className="w-full h-full object-contain hover:scale-105 transition duration-300"
                    />
                  </div>

                  {/* Header: Genre & Status */}
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-gray-100 text-gray-600">
                      {book.genre || "General"}
                    </span>
                    <span
                      className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
                        book.availableCopies > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {book.availableCopies > 0
                        ? `${book.availableCopies} Left`
                        : "Out of Stock"}
                    </span>
                  </div>

                  {/* TITLE (Clickable) */}
                  <h3
                    onClick={() => setSelectedBook(book)}
                    className="text-xl font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    {book.title}
                  </h3>

                  <p className="text-gray-500 text-sm mt-1 mb-2">
                    by {book.author}
                  </p>

                  {/* RATING */}
                  <div className="flex items-center gap-1 mb-4">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-700">
                      {book.averageRating || 0}
                    </span>
                    <button
                      onClick={() => setSelectedBook(book)}
                      className="text-xs text-blue-500 ml-2 hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* ✅ DYNAMIC ACTION BUTTONS */}
                {book.availableCopies > 0 ? (
                  // Case A: Book is Available -> BORROW
                  <button
                    onClick={() =>
                      handleAction(
                        book,
                        "/circulation/request",
                        "Request Sent!"
                      )
                    }
                    className="mt-2 w-full py-3 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition shadow-sm"
                  >
                    Request Book
                  </button>
                ) : (
                  // Case B: Book is Out of Stock -> JOIN WAITLIST
                  <button
                    onClick={() =>
                      handleAction(
                        book,
                        "/circulation/waitlist",
                        "Added to Waitlist!"
                      )
                    }
                    className="mt-2 w-full py-3 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg font-bold text-sm hover:bg-orange-100 transition flex justify-center items-center gap-2"
                  >
                    <BellAlertIcon className="h-4 w-4" /> Notify Me
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-400">
              No books found matching "{searchTerm}" in {selectedGenre}.
            </div>
          )}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`p-2 rounded-full border ${
              page === 1
                ? "text-gray-300 border-gray-200 cursor-not-allowed"
                : "text-black border-gray-300 hover:bg-gray-50"
            }`}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <span className="text-sm font-medium text-gray-700">
            Page <span className="font-bold text-black">{page}</span> of{" "}
            {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`p-2 rounded-full border ${
              page === totalPages
                ? "text-gray-300 border-gray-200 cursor-not-allowed"
                : "text-black border-gray-300 hover:bg-gray-50"
            }`}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* MODAL */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
};

export default UserBooks;
