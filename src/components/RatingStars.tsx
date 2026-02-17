"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 16,
  className,
  onRatingChange,
  readOnly = true,
}: RatingStarsProps) {
  return (
    <div className={cn("flex items-center space-x-0.5", className)}>
      {[...Array(maxRating)].map((_, i) => (
        <button
          type="button"
          key={i}
          onClick={() => !readOnly && onRatingChange?.(i + 1)}
          disabled={readOnly}
          className={cn(
            "focus:outline-none transition-transform hover:scale-110",
            readOnly ? "cursor-default hover:scale-100" : "cursor-pointer"
          )}
        >
          <Star
            size={size}
            className={cn(
              "transition-colors",
              i < Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            )}
          />
        </button>
      ))}
    </div>
  );
}
