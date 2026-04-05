"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getOrders, createOrder } from "@/services/orders.service";
import type { Order } from "@/types";

export function useOrders({ polling = false, pollingInterval = 3000 } = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrders();
      setOrders(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch orders";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateOrder = async (payload: {
    user_id: number;
    shipping_zone: string;
    items: { product_id: number; quantity: number }[];
  }) => {
    return createOrder(payload);
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (polling) {
      pollingRef.current = setInterval(fetchOrders, pollingInterval);
      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [polling, pollingInterval, fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders, createOrder: handleCreateOrder };
}
