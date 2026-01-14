import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 8; // Admins usually prefer seeing more rows

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // ✅ 1. UPDATE STATE: Add 'description' and 'imageUrl'
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    isbn: "",
    totalCopies: 0,
    availableCopies: 0,
    description: "", // New Field
    imageUrl: "", // New Field
  });

  // Reset Page when Search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Fetch on Page or Search change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // ✅ Send Search & Pagination Params
      const searchParam = searchTerm ? `&search=${searchTerm}` : "";
      const url = `/books?page=${page}&limit=${pageSize}${searchParam}`;

      const response = await api.get(url);

      if (response.data.isSuccess) {
        // Handle new response structure
        const result = response.data.result;
        setBooks(result.items || []);
        setTotalPages(result.totalPages || 1);
      }
    } catch (error) {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      const response = await api.delete(`/books/${id}`);
      if (response.data.isSuccess) {
        toast.success("Book deleted successfully");
        fetchBooks();
      } else {
        toast.error(response.data.displayMessage);
      }
    } catch (error) {
      toast.error("Error deleting book");
    }
  };

  const openModal = (book = null) => {
    if (book) {
      setEditingBook(book);
      // ✅ Populate form with existing data, including new fields
      setFormData({
        title: book.title,
        author: book.author,
        genre: book.genre,
        isbn: book.isbn,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        description: book.description || "",
        imageUrl: book.imageUrl || "",
      });
    } else {
      setEditingBook(null);
      // ✅ Reset form with empty new fields
      setFormData({
        title: "",
        author: "",
        genre: "",
        isbn: "",
        totalCopies: 0,
        availableCopies: 0,
        description: "",
        imageUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingBook) {
        // Update
        response = await api.put("/books", {
          ...formData,
          bookId: editingBook.bookId,
        });
      } else {
        // Create
        response = await api.post("/books", formData);
      }

      if (response.data.isSuccess) {
        toast.success(editingBook ? "Book updated!" : "Book created!");
        setIsModalOpen(false);
        fetchBooks();
      } else {
        toast.error(response.data.displayMessage);
      }
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER & CONTROLS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Books</h1>

        <div className="flex gap-3 w-full md:w-auto">
          {/* 🔍 Search Bar */}
          <div className="relative flex-grow md:flex-grow-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search title or author..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-black focus:border-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => openModal()}
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition"
          >
            <PlusIcon className="h-5 w-5" /> Add Book
          </button>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Title / Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Genre
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                ISBN
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.bookId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">
                      {book.title}
                    </div>
                    <div className="text-xs text-gray-500">{book.author}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {book.genre}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                    {book.isbn}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-bold ${
                        book.availableCopies > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {book.availableCopies} / {book.totalCopies}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(book)}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(book.bookId)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {books.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-500">No books found.</div>
        )}
      </div>

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white px-4 py-3 border border-gray-200 rounded-lg shadow-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`flex items-center gap-1 text-sm font-medium ${
              page === 1 ? "text-gray-300" : "text-gray-700 hover:text-black"
            }`}
          >
            <ChevronLeftIcon className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`flex items-center gap-1 text-sm font-medium ${
              page === totalPages
                ? "text-gray-300"
                : "text-gray-700 hover:text-black"
            }`}
          >
            Next <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* --- MODAL (CREATE / EDIT) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingBook ? "Edit Book" : "Add New Book"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Title Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Title
                </label>
                <input
                  required
                  type="text"
                  className="w-full border p-2 rounded focus:ring-black focus:border-black"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Author & Genre Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">
                    Author
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2 rounded focus:ring-black focus:border-black"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">
                    Genre
                  </label>
                  <select
                    className="w-full border p-2 rounded focus:ring-black focus:border-black"
                    value={formData.genre}
                    onChange={(e) =>
                      setFormData({ ...formData, genre: e.target.value })
                    }
                  >
                    <option value="">Select...</option>
                    {[
                      "Fiction",
                      "Non-Fiction",
                      "Sci-Fi",
                      "Technology",
                      "History",
                      "Mystery",
                      "Biography",
                      "Fantasy",
                      "Other"
                    ].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ISBN Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  ISBN
                </label>
                <input
                  required
                  type="text"
                  className="w-full border p-2 rounded focus:ring-black focus:border-black"
                  value={formData.isbn}
                  onChange={(e) =>
                    setFormData({ ...formData, isbn: e.target.value })
                  }
                />
              </div>

              {/* Stock Management Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">
                    Total Copies
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded focus:ring-black focus:border-black"
                    value={formData.totalCopies}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalCopies: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">
                    Available
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded focus:ring-black focus:border-black"
                    value={formData.availableCopies}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availableCopies: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* ✅ Image URL Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/cover.jpg"
                  className="w-full border p-2 rounded focus:ring-black focus:border-black"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                />
              </div>

              {/* ✅ Description Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Description
                </label>
                <textarea
                  rows="4"
                  placeholder="Enter a brief summary..."
                  className="w-full border p-2 rounded focus:ring-black focus:border-black"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 font-bold"
                >
                  {editingBook ? "Update Book" : "Create Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;
