"use client";

import { useState } from "react";
import RatingStars from "./RatingStars";

export default function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating");
    console.log({ rating, review });
    setSubmitted(true);
    // Mock API call
    setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setReview("");
        alert("Review submitted successfully!");
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <RatingStars
            rating={rating}
            size={24}
            readOnly={false}
            onRatingChange={setRating}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
            Review
          </label>
          <textarea
            id="review"
            rows={4}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 border"
            placeholder="Share your thoughts about this resource..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={submitted}
        >
          {submitted ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
