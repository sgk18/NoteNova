"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  onSortChange: (sort: string) => void;
  className?: string;
}

export default function FilterPanel({
  onSearch,
  onFilterChange,
  onSortChange,
  className,
}: FilterPanelProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={cn("bg-white p-4 rounded-xl shadow-sm border border-gray-100", className)}>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search resources by title, subject, or tags..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="highest_rated">Highest Rated</option>
            <option value="most_popular">Most Popular</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
              showFilters
                ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
              Resource Type
            </label>
            <select
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => onFilterChange({ type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="Notes">Notes</option>
              <option value="Question Papers">Question Papers</option>
              <option value="Solutions">Solutions</option>
              <option value="Project Reports">Project Reports</option>
              <option value="Study Material">Study Material</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
              Semester
            </label>
            <select
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => onFilterChange({ semester: e.target.value })}
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
            <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
              Branch
            </label>
            <select
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => onFilterChange({ branch: e.target.value })}
            >
              <option value="">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
