"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { uploadOrders } from "@/services/upload.service";
import { UploadResult } from "@/types";
import { Upload, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [shippingZone, setShippingZone] = useState("Zone A");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx") {
      setError("Only CSV and Excel (.xlsx) files are allowed");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    const ext = droppedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx") {
      setError("Only CSV and Excel (.xlsx) files are allowed");
      setFile(null);
      return;
    }

    setFile(droppedFile);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setUploadProgress(0);
    setResult(null);
    setError(null);

    try {
      const uploadResult = await uploadOrders(file, user.id, shippingZone);
      setResult(uploadResult);
      setUploadProgress(100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Orders</h1>
        <p className="text-gray-400 mt-1">
          Upload a CSV or Excel file to bulk-create orders
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            file
              ? "border-blue-500 bg-blue-500/5"
              : "border-gray-600 hover:border-gray-500"
          }`}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          {file ? (
            <div>
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-gray-400 text-sm">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-white font-medium">
                Drag & drop your file here
              </p>
              <p className="text-gray-400 text-sm mt-1">
                or click to browse (.csv, .xlsx)
              </p>
            </div>
          )}
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Shipping Zone
          </label>
          <input
            type="text"
            value={shippingZone}
            onChange={(e) => setShippingZone(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            placeholder="Zone A"
          />
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {uploading ? "Uploading..." : "Upload Orders"}
        </button>

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            Upload Results
          </h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{result.total_rows}</p>
              <p className="text-gray-400 text-sm">Total Rows</p>
            </div>
            <div className="bg-green-900/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {result.valid_rows}
              </p>
              <p className="text-gray-400 text-sm">Valid Rows</p>
            </div>
            <div className="bg-red-900/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-400">
                {result.failed_rows}
              </p>
              <p className="text-gray-400 text-sm">Failed Rows</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-400 mb-2">
                Row Errors
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {result.errors.map((err, i) => (
                  <div
                    key={i}
                    className="bg-red-900/20 border border-red-800 rounded-lg p-3 flex items-start gap-2"
                  >
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-red-400 text-sm">
                        Row {err.row}:
                      </span>
                      <span className="text-gray-300 text-sm ml-1">
                        {err.error}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.order_ids.length > 0 && (
            <button
              onClick={() => router.push("/orders")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              View Orders ({result.order_ids.length} created)
            </button>
          )}
        </div>
      )}
    </div>
  );
}