import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import {
  XMarkIcon,
  StarIcon as StarIconSolid,
} from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";

const BookDetailsModal = ({ book, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Form State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch Reviews on Open
  useEffect(() => {
    if (book?.bookId) {
      fetchReviews();
    }
  }, [book]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/books/${book.bookId}/reviews`);
      if (res.data.isSuccess) {
        setReviews(res.data.result);
      }
    } catch (error) {
      console.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        bookId: book.bookId,
        rating: newRating,
        comment: newComment,
      };
      const res = await api.post("/books/review", payload);

      if (res.data.isSuccess) {
        toast.success("Review posted!");
        setNewComment("");
        fetchReviews(); // Refresh list to show new review immediately
      } else {
        toast.error(res.data.displayMessage);
      }
    } catch (error) {
      toast.error("Failed to post review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: Render Stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) =>
      i < rating ? (
        <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
      ) : (
        <StarIconOutline key={i} className="h-4 w-4 text-gray-300" />
      )
    );
  };

  if (!book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition"
        >
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        </button>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="overflow-y-auto flex-1 p-0">
          {/* TOP SECTION: Book Info */}
          <div className="flex flex-col md:flex-row bg-gray-50 border-b border-gray-100">
            {/* LEFT: Image */}
            <div className="md:w-1/3 p-8 flex justify-center bg-gray-100 items-center">
              <img
                src={
                  book.imageUrl ||
                  "https://via.placeholder.com/300x450?text=No+Cover"
                }
                alt={book.title}
                className="w-48 h-72 object-cover rounded-lg shadow-lg transform transition hover:scale-105"
              />
            </div>

            {/* RIGHT: Details */}
            <div className="md:w-2/3 p-8 space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {book.title}
                </h2>
                <p className="text-lg text-gray-600 font-medium">
                  {book.author}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  {book.genre}
                </span>
                <div className="flex items-center text-yellow-500">
                  <span className="font-bold text-lg mr-1">
                    {book.averageRating || 0}
                  </span>
                  <StarIconSolid className="h-5 w-5" />
                </div>
                <span className="text-sm text-gray-400">
                  ({reviews.length} reviews)
                </span>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-600 leading-relaxed h-32 overflow-y-auto">
                {book.description || "No description available for this book."}
              </div>

              <div className="pt-2">
                <span
                  className={`text-sm font-bold ${
                    book.availableCopies > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {book.availableCopies > 0 ? "✅ In Stock" : "❌ Out of Stock"}
                </span>
                <span className="text-gray-400 text-xs ml-2">
                  ISBN: {book.isbn}
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Reviews */}
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              Reader Reviews
              <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {reviews.length}
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* LIST OF REVIEWS */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {loadingReviews ? (
                  <p className="text-gray-400 italic">Loading comments...</p>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      No reviews yet. Be the first!
                    </p>
                  </div>
                ) : (
                  reviews.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-sm text-gray-900">
                            {r.userName || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {r.datePosted}
                          </p>
                        </div>
                        <div className="flex">{renderStars(r.rating)}</div>
                      </div>
                      <p className="text-gray-600 text-sm">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* ADD REVIEW FORM */}
              <div className="bg-gray-50 p-6 rounded-xl h-fit border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">Write a Review</h4>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Star Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none transform transition hover:scale-110"
                        >
                          {star <= newRating ? (
                            <StarIconSolid className="h-8 w-8 text-yellow-400" />
                          ) : (
                            <StarIconOutline className="h-8 w-8 text-gray-300" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Comment
                    </label>
                    <textarea
                      required
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none resize-none text-sm"
                      placeholder="What did you think about this book?"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {submitting ? "Posting..." : "Post Review"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
