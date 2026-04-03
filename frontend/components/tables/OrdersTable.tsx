"use client";

import Link from "next/link";
import { Order } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Zap } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
  onOptimize?: (id: number) => void;
}

const statusVariant: Record<string, "warning" | "success" | "danger" | "info"> = {
  pending: "warning",
  optimized: "success",
  failed: "danger",
  no_savings: "info",
};

export default function OrdersTable({ orders, onOptimize }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-muted">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 font-medium text-muted">Order ID</th>
            <th className="px-4 py-3 font-medium text-muted">Zone</th>
            <th className="px-4 py-3 font-medium text-muted">Items</th>
            <th className="px-4 py-3 font-medium text-muted">Status</th>
            <th className="px-4 py-3 font-medium text-muted">Created</th>
            <th className="px-4 py-3 font-medium text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border/50 hover:bg-background/50 transition-all">
              <td className="px-4 py-3 font-mono text-xs text-accent">#{order.id}</td>
              <td className="px-4 py-3 text-foreground">{order.shipping_zone}</td>
              <td className="px-4 py-3 text-foreground">{order.items?.length || 0}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[order.status] || "default"}>
                  {order.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted">{formatDate(order.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs text-accent hover:underline"
                  >
                    View
                  </Link>
                  {order.status === "pending" && onOptimize && (
                    <button
                      onClick={() => onOptimize(order.id)}
                      className="flex items-center gap-1 text-xs text-accent-green hover:underline"
                    >
                      <Zap className="h-3 w-3" />
                      Optimize
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
