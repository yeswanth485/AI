"use client";

import { useState, useEffect } from "react";
import { getPackInstructions } from "@/services/upload.service";
import { PackInstruction } from "@/types";
import { X, Printer, AlertTriangle, Package } from "lucide-react";

interface PackInstructionsModalProps {
  orderId: number;
  onClose: () => void;
}

export default function PackInstructionsModal({
  orderId,
  onClose,
}: PackInstructionsModalProps) {
  const [instructions, setInstructions] = useState<PackInstruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPackInstructions(orderId)
      .then(setInstructions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            Packing Instructions - Order #{orderId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        )}

        {error && (
          <div className="p-4 text-center text-red-400">{error}</div>
        )}

        {instructions && (
          <div className="p-6 space-y-6">
            <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-medium">
                  Box: {instructions.box_name}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{instructions.instructions}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                Packing Order
              </h3>
              <div className="space-y-2">
                {instructions.item_order.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      item.is_fragile
                        ? "bg-amber-900/20 border-amber-800"
                        : "bg-gray-700/50 border-gray-600"
                    }`}
                  >
                    <span className="text-gray-400 text-sm w-6">{i + 1}.</span>
                    <div className="flex-1">
                      <span className="text-white font-medium">
                        {item.product_name}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        (x{item.quantity})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          item.layer === "bottom"
                            ? "bg-green-900/50 text-green-400"
                            : item.layer === "top"
                            ? "bg-amber-900/50 text-amber-400"
                            : "bg-blue-900/50 text-blue-400"
                        }`}
                      >
                        {item.layer.toUpperCase()}
                      </span>
                      {item.is_fragile && (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Instructions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}