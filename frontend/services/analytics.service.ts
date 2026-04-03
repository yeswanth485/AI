import api from "./api";
import type { AnalyticsSummary } from "@/types";

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const { data } = await api.get<AnalyticsSummary>("/analytics");
  return data;
}
