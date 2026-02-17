"use client";

import { useState } from "react";
import FilterPanel from "@/components/FilterPanel";
import ResourceCard from "@/components/ResourceCard";

// Mock data
const resourceData = [
  {
    id: "1",
    title: "Advanced Data Structures Notes",
    subject: "Data Structures",
    semester: "3rd",
    type: "Notes",
    isPublic: true,
    rating: 4.5,
    downloads: 120,
    branch: "CSE",
    year: "2023",
  },
  {
    id: "2",
    title: "Digital Logic Design Solutions",
    subject: "DLD",
    semester: "3rd",
    type: "Solutions",
    isPublic: true,
    rating: 4.8,
    downloads: 85,
    branch: "ECE",
    year: "2023",
  },
  {
    id: "3",
    title: "Operating Systems Project Report",
    subject: "OS",
    semester: "4th",
    type: "Project Reports",
    isPublic: true,
    rating: 4.2,
    downloads: 45,
    branch: "CSE",
    year: "2024",
  },
  {
    id: "4",
    title: "Computer Networks Question Paper 2023",
    subject: "CN",
    semester: "5th",
    type: "Question Papers",
    isPublic: true,
    rating: 4.0,
    downloads: 200,
    branch: "IT",
    year: "2023",
  },
  {
    id: "5",
    title: "Physics Lab Manual",
    subject: "Physics",
    semester: "1st",
    type: "Study Material",
    isPublic: true,
    rating: 4.2,
    downloads: 350,
    branch: "Common",
    year: "2024",
  },
  {
    id: "7",
    title: "Engineering Mathematics I Notes",
    subject: "Mathematics",
    semester: "1st",
    type: "Notes",
    isPublic: true,
    rating: 3.8,
    downloads: 500,
    branch: "Common",
    year: "2023",
  },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    semester: "",
    branch: "",
  });
  const [sortBy, setSortBy] = useState("latest");

  const filteredResources = resourceData
    .filter((resource) => {
      // Search logic
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.subject.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter logic
      const matchesType = filters.type ? resource.type === filters.type : true;
      const matchesSemester = filters.semester
        ? resource.semester === `${filters.semester}rd` || // simplistic matching for demo
          resource.semester === `${filters.semester}th` ||
          resource.semester === `${filters.semester}st` ||
          resource.semester === `${filters.semester}nd`
        : true;
        
      const matchesBranch = filters.branch
        ? resource.branch === filters.branch
        : true;

      return matchesSearch && matchesType && matchesSemester && matchesBranch;
    })
    .sort((a, b) => {
      if (sortBy === "highest_rated") {
        return b.rating - a.rating;
      } else if (sortBy === "most_popular") {
        return b.downloads - a.downloads;
      }
      return 0; // consistent order for latest (mock)
    });

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Browse Resources
        </h1>
        <p className="text-gray-500">
          Find the best academic resources shared by your peers.
        </p>
      </div>

      <FilterPanel
        onSearch={setSearchQuery}
        onFilterChange={handleFilterChange}
        onSortChange={setSortBy}
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource) => (
            <ResourceCard key={resource.id} {...resource} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              No resources found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
