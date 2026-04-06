"use client";

import Link from "next/link";
import { Order, OrderOptimizationSummary } from "@/types";
import Badge from "@/components/ui/Badge";
import { Zap, Eye, Store, MapPin, CreditCard, Package, AlertTriangle } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
  summaries?: Map<number, OrderOptimizationSummary>;
  onOptimize?: (id: number) => void;
  onPackNow?: (id: number) => void;
}

const statusVariant: Record<string, "warning" | "success" | "danger" | "info" | "purple"> = {
  pending: "warning",
  optimized: "success",
  failed: "danger",
  no_savings: "info",
};

const channelColors: Record<string, string> = {
  shopify: "bg-green-500/10 text-green-400 border-green-500/20",
  amazon: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  flipkart: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  meesho: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  delhivery: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  unicommerce: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export default function OrdersTable({ orders, summaries, onOptimize, onPackNow }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-12 text-center">
        <Package className="h-10 w-10 mx-auto text-muted-dark mb-3" />
        <p className="text-sm text-muted">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-ink2/50">
              <th className="px-2.5 py-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Order</th>
              <th className="px-2.5 py-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Channel</th>
              <th className="px-2.5 py-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Customer</th>
              <th className="px-2.5 py-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Location</th>
              <th className="px-2.5 py-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Pincode</th>
              <th className="px-2.5 py-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Payment</th>
              <th className="px-2.5 py-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Status</th>
              <th className="px-2.5 py-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Box</th>
              <th className="px-2.5 py-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Savings</th>
              <th className="px-2.5 py-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Fragile</th>
              <th className="px-2.5 py-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={order.id} className={`border-b border-border/50 table-row-hover transition-colors ${
                idx % 2 === 0 ? "bg-transparent" : "bg-white/[.01]"
              }`}>
                <td className="px-2.5 py-2">
                  <div className="font-mono text-[12px] text-accent font-semibold">#{order.id}</div>
                  {order.channel_order_id && (
                    <div className="text-[10px] text-muted-dark mt-0.5">{order.channel_order_id}</div>
                  )}
                </td>
                <td className="px-2.5 py-2">
                  {order.channel ? (
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      channelColors[order.channel.toLowerCase()] || "bg-surface2 text-muted border-border"
                    }`}>
                      <Store className="h-2.5 w-2.5" />
                      <span className="capitalize">{order.channel}</span>
                    </span>
                  ) : (
                    <span className="text-[12px] text-muted-dark">—</span>
                  )}
                </td>
                <td className="px-2.5 py-2">
                  {order.customer_name ? (
                    <div>
                      <div className="text-[12px] text-foreground font-medium">{order.customer_name}</div>
                      {order.customer_phone && (
                        <div className="text-[10px] text-muted-dark mt-0.5">{order.customer_phone}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[12px] text-muted-dark">—</span>
                  )}
                </td>
                <td className="px-2.5 py-2">
                  {order.customer_city ? (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-muted-dark flex-shrink-0" />
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
                <td className="px-2.5 py-2">
                  <span className="font-mono text-[12px] text-foreground bg-ink2 px-2 py-0.5 rounded">{order.customer_pincode || "—"}</span>
                </td>
                <td className="px-2.5 py-2">
                  {order.payment_type ? (
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="h-3 w-3 text-muted-dark" />
                      <span className="text-[12px] text-foreground capitalize">{order.payment_type}</span>
                    </div>
                  ) : (
                    <span className="text-[12px] text-muted-dark">—</span>
                  )}
                </td>
                <td className="px-2.5 py-2">
                  <Badge variant={statusVariant[order.status] || "default"}>
                    {order.status}
                  </Badge>
                </td>
                <td className="px-2.5 py-2">
                  {summaries?.get(order.id)?.recommended_box ? (
                    <span className="text-[12px] text-accent font-semibold">{summaries.get(order.id)!.recommended_box}</span>
                  ) : (
                    <span className="text-[12px] text-muted-dark">—</span>
                  )}
                </td>
                <td className="px-2.5 py-2">
                  {summaries?.get(order.id) && summaries.get(order.id)!.savings > 0 ? (
                    <span className="text-[12px] text-teal font-semibold">+Rs.{summaries.get(order.id)!.savings.toFixed(2)}</span>
                  ) : (
                    <span className="text-[12px] text-muted-dark">—</span>
                  )}
                </td>
                <td className="px-2.5 py-2">
                  {summaries?.get(order.id)?.has_fragile ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <span className="text-[12px] text-muted-dark">—</span>
                  )}
                </td>
                <td className="px-2.5 py-2">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-white/[.04]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                    {order.status === "pending" && onOptimize && (
                      <button
                        onClick={() => onOptimize(order.id)}
                        className="flex items-center gap-1 text-[11px] text-accent hover:text-accent/80 transition-colors font-semibold px-2 py-1.5 rounded-lg hover:bg-accent/5"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        Optimize
                      </button>
                    )}
                    {(order.status === "optimized" || order.status === "no_savings") && onPackNow && (
                      <button
                        onClick={() => onPackNow(order.id)}
                        className="flex items-center gap-1 text-[11px] text-teal hover:text-teal/80 transition-colors font-semibold px-3 py-1.5 rounded-lg bg-teal/10 hover:bg-teal/20 ml-1"
                      >
                        <Package className="h-3.5 w-3.5" />
                        Pack Now
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
