"use client";

import { Star } from "lucide-react";

export default function StarRating({ rating = 0, onRate, size = 20 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onRate?.(i)}
          disabled={!onRate}
          className={`transition-transform ${onRate ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          <Star
            size={size}
            className={i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
          />
        </button>
      ))}
    </div>
  );
}
