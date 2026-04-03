"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrder } from "@/services/orders.service";
import type { Order } from "@/types";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const statusVariant: Record<string, "warning" | "success" | "danger" | "info"> = {
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

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/orders")}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </button>

      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground">Order #{order.id}</h2>
        <Badge variant={statusVariant[order.status] || "default"}>{order.status}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs text-muted">Shipping Zone</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{order.shipping_zone}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Created</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{formatDateTime(order.created_at)}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Last Updated</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{formatDateTime(order.updated_at)}</p>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Order Items</h3>
        {order.items && order.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 font-medium text-muted">Product</th>
                  <th className="pb-2 font-medium text-muted">SKU</th>
                  <th className="pb-2 font-medium text-muted">Quantity</th>
                  <th className="pb-2 font-medium text-muted">Weight</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-border/50">
                    <td className="py-2.5 text-foreground">{item.product?.name || `Product #${item.product_id}`}</td>
                    <td className="py-2.5 font-mono text-xs text-muted">{item.product?.sku || "—"}</td>
                    <td className="py-2.5 text-foreground">{item.quantity}</td>
                    <td className="py-2.5 text-muted">{item.product?.weight_kg ? `${item.product.weight_kg} kg` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted">No items in this order</p>
        )}
      </Card>
    </div>
  );
}
