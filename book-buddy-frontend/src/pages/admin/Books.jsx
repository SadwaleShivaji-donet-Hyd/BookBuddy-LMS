import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get("/Books"); // Use your real endpoint
        setBooks(res.data.result.items || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBooks();
  }, []);

  // Filter Logic
  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Book Management</h2>
        <div className="flex gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm w-64 focus:outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-black">
            <PlusIcon className="h-4 w-4" /> Add Book
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase font-bold text-xs">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Author</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Price</th>
              <th className="p-4">Availability</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((book) => (
              <tr key={book.bookId} className="hover:bg-gray-50">
                <td className="p-4 text-gray-500">#{book.bookId}</td>
                <td className="p-4 font-medium">{book.title}</td>
                <td className="p-4 text-gray-500">{book.author}</td>
                <td className="p-4">{book.totalCopies}</td>
                <td className="p-4 text-gray-500">$3.99</td>{" "}
                {/* Static Price for now */}
                <td className="p-4">
                  {book.availableCopies > 0 ? (
                    <span className="text-green-600 font-medium">
                      Available
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium">
                      Out of Stock
                    </span>
                  )}
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button className="text-gray-400 hover:text-black">
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Books;
