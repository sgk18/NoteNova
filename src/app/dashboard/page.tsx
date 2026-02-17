"use client";

import Link from "next/link";
import { Upload, FileText, Download, Star, Plus } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";

// Mock data
const userStats = [
  { name: "Total Uploads", value: "12", icon: FileText },
  { name: "Total Downloads", value: "1.2k", icon: Download },
  { name: "Average Rating", value: "4.8", icon: Star },
];

const myResources = [
  {
    id: "1",
    title: "Advanced Data Structures Notes",
    subject: "Data Structures",
    semester: "3rd",
    type: "Notes",
    isPublic: true,
    rating: 4.5,
    downloads: 120,
  },
  {
    id: "5",
    title: "Physics Lab Manual",
    subject: "Physics",
    semester: "1st",
    type: "Lab Manual",
    isPublic: true,
    rating: 4.2,
    downloads: 350,
  },
  {
    id: "6",
    title: "My Personal Study Schedule",
    subject: "General",
    semester: "All",
    type: "Study Material",
    isPublic: false,
    rating: 0,
    downloads: 0,
  },
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/upload"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Upload New Resource
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        {userStats.map((item) => (
          <div
            key={item.name}
            className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6"
          >
            <dt className="text-sm font-medium text-gray-500 truncate">
              {item.name}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 flex items-baseline gap-2">
              <item.icon className="h-6 w-6 text-indigo-500" />
              {item.value}
            </dd>
          </div>
        ))}
      </div>

      {/* My Resources */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            My Uploads
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your shared resources.
          </p>
        </div>
        <div className="p-6 bg-gray-50">
          {myResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myResources.map((resource) => (
                <ResourceCard key={resource.id} {...resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No resources uploaded
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading your first resource.
              </p>
              <div className="mt-6">
                <Link
                  href="/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Upload Resource
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
