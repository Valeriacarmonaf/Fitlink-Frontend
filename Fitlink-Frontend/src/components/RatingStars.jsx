// src/components/RatingStars.jsx
import React, { useState } from "react";
import { Star } from "lucide-react";

export default function RatingStars({ value = 0, onRate, disabled = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={28}
          className={`cursor-pointer transition-colors ${
            (hover || value) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => !disabled && onRate(star)}
        />
      ))}
    </div>
  );
}
