"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrder } from "@/services/orders.service";
import type { Order } from "@/types";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { formatDateTime, formatDimensions, formatWeight } from "@/lib/utils";
import { ArrowLeft, Package, Calendar, MapPin, Clock } from "lucide-react";

const statusVariant: Record<string, "warning" | "success" | "danger" | "info" | "purple"> = {
  pending: "warning",
  optimized: "success",
  failed: "danger",
  no_savings: "info",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrder(Number(params.id));
        setOrder(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load order";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <EmptyState
        title="Order not found"
        description={error || "This order does not exist"}
        action={
          <button onClick={() => router.push("/orders")} className="text-sm text-accent hover:underline">
            Back to Orders
          </button>
        }
      />
    );
  }

  const totalWeight = order.items?.reduce((sum, item) => {
    return sum + (item.product?.weight_kg || 0) * item.quantity;
  }, 0) || 0;

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push("/orders")}
        className="flex items-center gap-2 text-[13px] text-muted hover:text-foreground transition-all"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Orders
      </button>

      <div className="flex items-center gap-3">
        <h2 className="font-display text-lg font-black text-foreground tracking-tight">Order #{order.id}</h2>
        <Badge variant={statusVariant[order.status] || "default"}>{order.status}</Badge>
      </div>

      {/* Order Info Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Shipping Zone</p>
          </div>
          <p className="font-display text-lg font-black text-foreground tracking-tight">{order.shipping_zone}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-3.5 w-3.5 text-accent-green" />
            <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Created</p>
          </div>
          <p className="text-[13px] font-semibold text-foreground">{formatDateTime(order.created_at)}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-3.5 w-3.5 text-accent-purple" />
            <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Last Updated</p>
          </div>
          <p className="text-[13px] font-semibold text-foreground">{formatDateTime(order.updated_at)}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-3.5 w-3.5 text-accent-orange" />
            <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Total Weight</p>
          </div>
          <p className="font-display text-lg font-black text-foreground tracking-tight">{totalWeight.toFixed(1)} kg</p>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <h3 className="mb-3 text-[13px] font-semibold text-foreground">Order Items</h3>
        {order.items && order.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Product</th>
                  <th className="pb-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">SKU</th>
                  <th className="pb-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Dimensions</th>
                  <th className="pb-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Weight</th>
                  <th className="pb-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Qty</th>
                  <th className="pb-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Fragile</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-white/[.015] transition-colors">
                    <td className="py-2.5 text-foreground font-medium">{item.product?.name || `Product #${item.product_id}`}</td>
                    <td className="py-2.5 font-mono text-[12px] text-muted">{item.product?.sku || "—"}</td>
                    <td className="py-2.5 text-muted text-[12px]">
                      {item.product ? formatDimensions(item.product.length_cm, item.product.width_cm, item.product.height_cm) : "—"}
                    </td>
                    <td className="py-2.5 text-muted text-[12px]">
                      {item.product ? formatWeight(item.product.weight_kg) : "—"}
                    </td>
                    <td className="py-2.5 text-foreground font-semibold">{item.quantity}</td>
                    <td className="py-2.5">
                      {item.product?.is_fragile ? (
                        <Badge variant="danger">Fragile</Badge>
                      ) : (
                        <Badge variant="success">Standard</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted">No items in this order</p>
        )}
      </Card>
    </div>
  );
}
