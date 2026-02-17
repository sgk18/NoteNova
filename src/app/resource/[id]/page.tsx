"use client";

import Link from "next/link";
import { Download, FileText, User, Calendar, Shield, Share2, MoreHorizontal, ArrowLeft } from "lucide-react";
import RatingStars from "@/components/RatingStars";
import ReviewForm from "@/components/ReviewForm";
import { useParams } from "next/navigation";

// Mock data
const resourceDetails = {
  id: "1",
  title: "Advanced Data Structures Notes",
  description:
    "Comprehensive notes covering AVL trees, Red-Black trees, B-trees, Graphs, and Heaps. Includes solved examples and practice problems.",
  subject: "Data Structures",
  semester: "3rd",
  type: "Notes",
  isPublic: true,
  rating: 4.5,
  reviewCount: 12,
  downloads: 120,
  uploadedBy: "Rahul Kumar",
  college: "IIT Bombay",
  uploadedDate: "Oct 12, 2023",
  tags: ["Trees", "Graphs", "DSA", "Algorithms"],
  fileSize: "2.4 MB",
  fileType: "PDF",
};

const reviews = [
  {
    id: 1,
    user: "Anime Fan",
    rating: 5,
    date: "2 days ago",
    comment: "Excellent notes! The graph algorithms section is explained very clearly.",
  },
  {
    id: 2,
    user: "Study Buddy",
    rating: 4,
    date: "1 week ago",
    comment: "Good content but some diagrams are a bit blurry.",
  },
];

export default function ResourceDetail() {
  const params = useParams();
  const { id } = params;

  // In a real app, fetch data based on id
  const resource = resourceDetails;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/search" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-100">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start">
                <div>
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                    {resource.type}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {resource.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <span className="font-medium text-gray-900">{resource.subject}</span>
                    <span>•</span>
                    <span>Semester {resource.semester}</span>
                    <span>•</span>
                     <div className="flex items-center gap-1">
                        <RatingStars rating={resource.rating} size={14} />
                        <span>({resource.reviewCount} reviews)</span>
                     </div>
                  </div>
                </div>
                 <div className="flex gap-2">
                    <button className="p-2 mr-2 text-gray-400 hover:text-gray-500">
                        <Share2 className="w-5 h-5"/>
                    </button>
                 </div>
              </div>

              <div className="prose max-w-none text-gray-600 mb-6">
                <p>{resource.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
                  <Download className="mr-2 h-5 w-5" />
                  Download ({resource.fileSize})
                </button>
                <button className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
                  <FileText className="mr-2 h-5 w-5" />
                  Preview File
                </button>
              </div>
            </div>
            
            {/* File Info Bar */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                <div className="flex gap-4">
                    <span>Format: {resource.fileType}</span>
                    <span>Size: {resource.fileSize}</span>
                    <span>Downloads: {resource.downloads}</span>
                </div>
                <div className="flex items-center gap-1">
                     <Shield className="w-4 h-4 text-green-500"/>
                     <span className="text-green-700">Virus scan passed</span>
                </div>
            </div>
          </div>

          <ReviewForm />

          {/* Reviews List */}
          <div className="bg-white shadow rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Reviews ({resource.reviewCount})</h3>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3">
                        {review.user.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.user}</p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    <RatingStars rating={review.rating} size={14} />
                  </div>
                  <p className="text-sm text-gray-600 ml-11">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Uploaded By
            </h3>
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-4">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-900">
                  {resource.uploadedBy}
                </p>
                <p className="text-sm text-gray-500">{resource.college}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-6">
                <Calendar className="h-4 w-4 mr-2"/>
                Uploaded on {resource.uploadedDate}
            </div>
            <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              View Profile
            </button>
          </div>

           <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
            <h3 className="text-indigo-900 font-semibold mb-2">Related Resources</h3>
            <ul className="space-y-3">
                <li className="text-sm">
                    <Link href="#" className="text-indigo-700 hover:text-indigo-900 block font-medium">
                        Data Structures Lab Manual
                    </Link>
                    <span className="text-xs text-indigo-500">240 downloads</span>
                </li>
                 <li className="text-sm">
                    <Link href="#" className="text-indigo-700 hover:text-indigo-900 block font-medium">
                        Algorithms Question Bank
                    </Link>
                    <span className="text-xs text-indigo-500">180 downloads</span>
                </li>
            </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
