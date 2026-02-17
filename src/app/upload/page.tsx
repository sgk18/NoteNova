"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";

export default function UploadPage() {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    semester: "",
    type: "",
    year: "",
    description: "",
    isPublic: true,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData({ ...formData, [name]: checked });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
        alert("Please select a file to upload.");
        return;
    }
    setLoading(true);

    // Mock upload logic
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      
      // Reset form
      setFormData({
        title: "",
        subject: "",
        semester: "",
        type: "",
        year: "",
        description: "",
        isPublic: true,
      });
      setTags([]);
      setFile(null);
      
      setTimeout(() => setSubmitted(false), 3000);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Upload Resource
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Share your knowledge with the community.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            {submitted ? (
              <div className="rounded-md bg-green-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Upload Successful!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Your resource has been published.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Resource Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Subject/Course Name
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    required
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="semester"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    required
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.semester}
                    onChange={handleChange}
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Resource Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    required
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="">Select Type</option>
                    <option value="Notes">Notes</option>
                    <option value="Question Papers">Question Papers</option>
                    <option value="Solutions">Solutions</option>
                    <option value="Project Reports">Project Reports</option>
                    <option value="Study Material">Study Material</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Year/Batch
                  </label>
                  <input
                    type="text"
                    name="year"
                    id="year"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    placeholder="e.g. 2024"
                    value={formData.year}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6">
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tags (Press Enter to add)
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                        >
                          <span className="sr-only">Remove tag {tag}</span>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      id="tags"
                      className="flex-1 min-w-[100px] border-none focus:ring-0 p-0 sm:text-sm"
                      placeholder={tags.length === 0 ? "Add tags..." : ""}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagAdd}
                    />
                  </div>
                </div>

                <div className="col-span-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Resource File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOCX, PPTX up to 10MB
                      </p>
                      {file && (
                        <p className="text-sm font-medium text-indigo-600 mt-2">
                          Selected: {file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isPublic"
                        name="isPublic"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={formData.isPublic}
                        onChange={(e) =>
                            setFormData({ ...formData, isPublic: e.target.checked })
                        }
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="isPublic"
                        className="font-medium text-gray-700"
                      >
                        Public Resource
                      </label>
                      <p className="text-gray-500">
                        Allow everyone to see and download this resource.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Upload Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
