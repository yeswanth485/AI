import api from "./api";
import type { Order } from "@/types";

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
