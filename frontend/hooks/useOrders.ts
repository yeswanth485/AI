"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getOrders, createOrder } from "@/services/orders.service";
import type { Order } from "@/types";

export function useOrders({ polling = false, pollingInterval = 5000 } = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialLoadDone = useRef(false);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      setError(null);
      const data = await getOrders();
      setOrders(data);
      initialLoadDone.current = true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch orders";
      setError(message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
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
    fetchOrders(false);
  }, [fetchOrders]);

  useEffect(() => {
    if (polling && initialLoadDone.current) {
      pollingRef.current = setInterval(() => fetchOrders(true), pollingInterval);
      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [polling, pollingInterval, fetchOrders]);

  return { orders, loading, error, refetch: () => fetchOrders(false), createOrder: handleCreateOrder };
}
