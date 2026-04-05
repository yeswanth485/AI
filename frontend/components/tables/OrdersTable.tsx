"use client";

import Link from "next/link";
import { Order } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Zap, Eye, Store, MapPin, CreditCard } from "lucide-react";

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

const channelColors: Record<string, string> = {
  shopify: "text-green-400",
  amazon: "text-orange-400",
  flipkart: "text-blue-400",
  meesho: "text-yellow-400",
  delhivery: "text-purple-400",
  unicommerce: "text-cyan-400",
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
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Order</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Channel</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Customer</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Location</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Pincode</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Payment</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Zone</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Created</th>
            <th className="px-4 py-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border/50 hover:bg-white/[.015] transition-colors">
              <td className="px-4 py-3">
                <div className="font-mono text-[12px] text-accent font-semibold">#{order.id}</div>
                {order.channel_order_id && (
                  <div className="text-[10px] text-muted-dark">{order.channel_order_id}</div>
                )}
              </td>
              <td className="px-4 py-3">
                {order.channel ? (
                  <div className="flex items-center gap-1.5">
                    <Store className={`h-3 w-3 ${channelColors[order.channel.toLowerCase()] || "text-muted"}`} />
                    <span className="text-[12px] text-foreground capitalize">{order.channel}</span>
                  </div>
                ) : (
                  <span className="text-[12px] text-muted-dark">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {order.customer_name ? (
                  <div>
                    <div className="text-[12px] text-foreground">{order.customer_name}</div>
                    {order.customer_phone && (
                      <div className="text-[10px] text-muted-dark">{order.customer_phone}</div>
                    )}
                  </div>
                ) : (
                  <span className="text-[12px] text-muted-dark">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {order.customer_city ? (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted" />
                    <div>
                      <div className="text-[12px] text-foreground">{order.customer_city}</div>
                      {order.customer_state && (
                        <div className="text-[10px] text-muted-dark">{order.customer_state}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-[12px] text-muted-dark">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-[12px] text-foreground">{order.customer_pincode || "—"}</span>
              </td>
              <td className="px-4 py-3">
                {order.payment_type ? (
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3 text-muted" />
                    <span className="text-[12px] text-foreground capitalize">{order.payment_type}</span>
                  </div>
                ) : (
                  <span className="text-[12px] text-muted-dark">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="text-[12px] text-muted">{order.shipping_zone}</span>
              </td>
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
