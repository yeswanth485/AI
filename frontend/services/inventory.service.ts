import api from "./api";
import type { BoxInventory } from "@/types";

interface AddBoxPayload {
  name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  max_weight_kg: number;
  supports_fragile: boolean;
  quantity_available: number;
}

export async function getInventory(): Promise<BoxInventory[]> {
  const { data } = await api.get<BoxInventory[]>("/inventory");
  return data;
}

export async function addBox(payload: AddBoxPayload): Promise<BoxInventory> {
  const { data } = await api.post<BoxInventory>("/inventory", payload);
  return data;
}

export async function updateQuantity(boxId: number, qty: number): Promise<BoxInventory> {
  const { data } = await api.patch<BoxInventory>(`/inventory/${boxId}`, { quantity_available: qty });
  return data;
}
