import api from "./api";
import type { OptimizationResult } from "@/types";

export async function optimizePackaging(orderId: number): Promise<OptimizationResult> {
  const { data } = await api.post<OptimizationResult>(`/optimize-packaging/${orderId}`);
  return data;
}
