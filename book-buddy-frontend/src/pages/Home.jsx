import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { StarIcon } from "@heroicons/react/24/solid";
import {
  BookOpenIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch books for the "Trending" section
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch a batch of books
        const response = await api.get("/books?limit=10");
        if (response.data.isSuccess) {
          const books = response.data.result.items;
          // ✅ Client-side logic: Sort by Rating (High to Low) and take top 4
          const topRated = books
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 4);
          setFeaturedBooks(topRated);
        }
      } catch (error) {
        console.error("Failed to load featured books");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      {/* --- 1. NAVBAR --- */}
      <nav className="border-b border-gray-100 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-2 rounded-lg">
              <BookOpenIcon className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">BookBuddy</span>
          </div>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-black transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-sm font-bold bg-black text-white rounded-full hover:bg-gray-800 transition shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <header className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl space-y-6 animate-fadeIn">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-100">
            The #1 Library Management System
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Discover Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Great Adventure.
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Borrow books, track your reading journey, and join a community of
            book lovers. Your personal library is just a click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-black text-white font-bold rounded-full text-lg hover:scale-105 transition transform shadow-xl flex items-center justify-center gap-2"
            >
              Join Now <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white text-gray-900 border border-gray-200 font-bold rounded-full text-lg hover:bg-gray-50 transition"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </header>

      {/* --- 3. TRENDING BOOKS SECTION --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
              <p className="text-gray-500 mt-2">
                Highest rated books selected by our readers.
              </p>
            </div>
            <Link
              to="/login"
              className="text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              View All <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredBooks.map((book) => (
                <div
                  key={book.bookId}
                  className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-xl transition duration-300"
                >
                  <div className="h-64 bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                    <img
                      src={
                        book.imageUrl ||
                        "https://via.placeholder.com/300x450?text=No+Cover"
                      }
                      alt={book.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <StarIcon className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-bold">
                        {book.averageRating || "N/A"}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{book.author}</p>
                  <Link
                    to="/login"
                    className="block w-full py-2 bg-gray-50 hover:bg-black hover:text-white text-center rounded-lg text-sm font-bold transition"
                  >
                    Login to Borrow
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- 4. FEATURES GRID --- */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <BookOpenIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Vast Collection</h3>
              <p className="text-gray-500">
                Access thousands of books across genres, from Sci-Fi to History.
              </p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                <DevicePhoneMobileIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Read Anywhere</h3>
              <p className="text-gray-500">
                Manage your loans and reading lists from any device, anytime.
              </p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                <UserGroupIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Community Reviews</h3>
              <p className="text-gray-500">
                See what others are reading and leave your own reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 py-12 text-center">
        <p className="text-gray-400 font-medium">
          © 2025 BookBuddy Library System. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
