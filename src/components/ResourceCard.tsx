import Link from "next/link";
import { Download, FileText, Lock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import RatingStars from "./RatingStars";

interface ResourceCardProps {
  id: string;
  title: string;
  subject: string;
  semester: string;
  type: string;
  isPublic: boolean;
  rating: number;
  downloads: number;
}

export default function ResourceCard({
  id,
  title,
  subject,
  semester,
  type,
  isPublic,
  rating,
  downloads,
}: ResourceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {type}
          </span>
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
              isPublic
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            )}
          >
            {isPublic ? (
              <>
                <Globe className="w-3 h-3 mr-1" /> Public
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 mr-1" /> Private
              </>
            )}
          </span>
        </div>
      </div>

      <Link href={`/resource/${id}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-indigo-600 transition-colors line-clamp-1">
          {title}
        </h3>
      </Link>
      
      <p className="text-sm text-gray-500 mb-4">
        {subject} • {semester}
      </p>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
            <RatingStars rating={rating} size={14} />
            <span className="text-xs">({rating})</span>
        </div>
        <div className="flex items-center gap-1">
          <Download className="w-4 h-4" />
          <span>{downloads}</span>
        </div>
      </div>

      <Link
        href={`/resource/${id}`}
        className="mt-4 block w-full text-center py-2 px-4 shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-200"
      >
        View Details
      </Link>
    </div>
  );
}
