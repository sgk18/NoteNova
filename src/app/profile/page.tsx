"use client";

import { User, MapPin, BookOpen, Calendar, Edit } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";

// Mock data
const userProfile = {
  name: "Surya VM",
  email: "surya@example.com",
  college: "National Institute of Technology",
  branch: "Computer Science and Engineering",
  semester: "6th",
  bio: "Passionate about coding and sharing knowledge. Always learning new technologies.",
  joinedDate: "August 2021",
};

const userResources = [
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
];

export default function Profile() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-indigo-600 h-32 sm:h-48"></div>
        <div className="relative px-4 sm:px-6 lg:px-8 pb-8">
          <div className="relative -mt-12 sm:-mt-16 flex justify-between items-end">
             <div className="flex items-end">
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full ring-4 ring-white bg-white flex items-center justify-center">
                    <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                </div>
                 <div className="ml-4 mb-1 hidden sm:block">
                     <h1 className="text-2xl font-bold text-gray-900">{userProfile.name}</h1>
                     <p className="text-sm text-gray-500">{userProfile.email}</p>
                 </div>
             </div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          </div>
          
           <div className="mt-4 sm:hidden">
              <h1 className="text-2xl font-bold text-gray-900">{userProfile.name}</h1>
              <p className="text-sm text-gray-500">{userProfile.email}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar Info */}
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <BuildingIcon className="h-5 w-5 mr-3 text-gray-400" />
                <span>{userProfile.college}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <BookOpen className="h-5 w-5 mr-3 text-gray-400" />
                <span>{userProfile.branch} • Semester {userProfile.semester}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                <span>Joined {userProfile.joinedDate}</span>
              </div>
               <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Bio</h3>
                  <p className="text-gray-700">{userProfile.bio}</p>
               </div>
            </div>

            {/* Main Content - Uploaded Resources */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Uploaded Resources</h2>
              {userResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userResources.map((resource) => (
                    <ResourceCard key={resource.id} {...resource} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No resources uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildingIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
    )
}
