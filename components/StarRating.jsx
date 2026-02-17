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
          className={`transition-all duration-200 ${onRate ? "cursor-pointer hover:scale-125 hover:drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]" : "cursor-default"}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              i <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]"
                : "fill-gray-600 text-gray-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
