"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, File, X, Loader2 } from "lucide-react";

export default function CreateProblemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testCases, setTestCases] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimit: 1000,
    memoryLimit: 256,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTestCases((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadingFiles(true);

    try {
      const uploadedCases = [];

      // Upload test cases to S3/MinIO via Next.js API
      for (const file of testCases) {
        const fileFormData = new FormData();
        fileFormData.append("file", file);

        const uploadRes = await fetch("/api/admin/testcases/upload", {
          method: "POST",
          body: fileFormData,
        });

        if (uploadRes.ok) {
          const data = await uploadRes.json();
          uploadedCases.push({
            id: data.s3Key || Math.random().toString(),
            filename: data.filename || file.name,
            inputUrl: data.fileUrl,
          });
        } else {
          console.error("Failed to upload", file.name);
        }
      }

      setUploadingFiles(false);

      const res = await fetch("/api/admin/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          testCases: uploadedCases,
        }),
      });

      if (res.ok) {
        router.push("/admin/problems");
        router.refresh();
      } else {
        console.error("Failed to save problem");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setUploadingFiles(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Create New Problem</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                placeholder="e.g. A+B Problem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                placeholder="Describe the problem..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (ms)</label>
                <input
                  required
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Memory Limit (MB)</label>
                <input
                  required
                  type="number"
                  value={formData.memoryLimit}
                  onChange={(e) => setFormData({ ...formData, memoryLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Test Cases</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
              <input
                type="file"
                multiple
                id="testcases"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="testcases" className="cursor-pointer flex flex-col items-center gap-2">
                <UploadCloud className="text-gray-400" size={32} />
                <span className="text-sm font-medium text-blue-600 hover:text-blue-700">Click to upload files</span>
                <span className="text-xs text-gray-500">.txt, .zip up to 10MB</span>
              </label>
            </div>

            {testCases.length > 0 && (
              <ul className="mt-4 space-y-2">
                {testCases.map((file, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <File size={18} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {uploadingFiles ? "Uploading Files..." : "Saving..."}
                </>
              ) : (
                "Create Problem"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
