"use client";

import { useState, useEffect, useCallback } from "react";
import { getInventory, addBox, updateQuantity } from "@/services/inventory.service";
import type { BoxInventory } from "@/types";

export function useInventory() {
  const [inventory, setInventory] = useState<BoxInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventory();
      setInventory(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch inventory";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddBox = async (payload: {
    name: string;
    length_cm: number;
    width_cm: number;
    height_cm: number;
    max_weight_kg: number;
    supports_fragile: boolean;
    quantity_available: number;
  }) => {
    return addBox(payload);
  };

  const handleUpdateQuantity = async (boxId: number, qty: number) => {
    return updateQuantity(boxId, qty);
  };

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory,
    addBox: handleAddBox,
    updateQuantity: handleUpdateQuantity,
  };
}
