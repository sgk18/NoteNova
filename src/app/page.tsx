import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";

// Mock data
const recentResources = [
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
    id: "2",
    title: "Digital Logic Design Solutions",
    subject: "DLD",
    semester: "3rd",
    type: "Solutions",
    isPublic: true,
    rating: 4.8,
    downloads: 85,
  },
  {
    id: "3",
    title: "Operating Systems Project Report",
    subject: "OS",
    semester: "4th",
    type: "Project Reports",
    isPublic: false,
    rating: 4.2,
    downloads: 45,
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
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Collaborative Academic</span>
              <span className="block text-indigo-600">Resource Platform</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Share, access, and collaborate on academic resources. Find notes,
              question papers, solutions, and more to ace your exams.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/search"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  Browse Resources
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="/upload"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Notes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Resources Section */}
      <section className="py-12 bg-gray-50 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Latest Resources
            </h2>
            <Link
              href="/search"
              className="text-indigo-600 hover:text-indigo-500 font-medium flex items-center"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentResources.map((resource) => (
              <ResourceCard key={resource.id} {...resource} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
