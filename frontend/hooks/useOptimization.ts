"use client";

import { useState } from "react";
import { optimizePackaging } from "@/services/optimization.service";
import type { OptimizationResult } from "@/types";

export function useOptimization() {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runOptimization = async (orderId: number) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const data = await optimizePackaging(orderId);
      setResult(data);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Optimization failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return { result, loading, error, runOptimization, reset };
}
