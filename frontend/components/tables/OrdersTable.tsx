"use client";

import Link from "next/link";
import { Order } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Zap, Eye } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
  onOptimize?: (id: number) => void;
}

const statusVariant: Record<string, "warning" | "success" | "danger" | "info" | "purple"> = {
  pending: "warning",
  optimized: "success",
  failed: "danger",
  no_savings: "info",
};

export default function OrdersTable({ orders, onOptimize }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-muted">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Order ID</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Product</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Zone</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Items</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Created</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border/50 hover:bg-white/[.015] transition-colors">
              <td className="px-4 py-3 font-mono text-[12px] text-accent font-semibold">#{order.id}</td>
              <td className="px-4 py-3 text-foreground text-[13px]">
                {order.items && order.items.length > 0
                  ? order.items[0].product?.name || `Product #${order.items[0].product_id}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-muted text-[13px]">{order.shipping_zone}</td>
              <td className="px-4 py-3 text-foreground text-[13px]">{order.items?.length || 0}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[order.status] || "default"}>
                  {order.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted text-[12px]">{formatDate(order.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-1 text-[12px] text-muted hover:text-foreground transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                  {order.status === "pending" && onOptimize && (
                    <button
                      onClick={() => onOptimize(order.id)}
                      className="flex items-center gap-1 text-[12px] text-accent hover:text-accent/80 transition-colors font-semibold"
                    >
                      <Zap className="h-3.5 w-3.5" />
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
