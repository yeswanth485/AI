import api from "./api";
import type { Order, OptimizationResult, OrderOptimizationSummary } from "@/types";

interface OrderCreatePayload {
  user_id: number;
  shipping_zone: string;
  items: { product_id: number; quantity: number }[];
}

export async function getOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>("/orders");
  return data;
}

export async function getOrder(id: number): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
}

export async function createOrder(payload: OrderCreatePayload): Promise<{ order_id: number; status: string }> {
  const { data } = await api.post<{ order_id: number; status: string }>("/orders", payload);
  return data;
}

export async function getOrderOptimizationStatus(id: number): Promise<OptimizationResult & { status: string; updated_at: string | null }> {
  const { data } = await api.get(`/orders/${id}/optimization-status`);
  return data;
}

export async function getOrdersOptimizationSummary(): Promise<OrderOptimizationSummary[]> {
  const { data } = await api.get<OrderOptimizationSummary[]>("/orders/optimization-summary");
  return data;
}

