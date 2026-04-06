"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { getOrdersOptimizationSummary } from "@/services/orders.service";
import type { OrderOptimizationSummary } from "@/types";
import OrdersTable from "@/components/tables/OrdersTable";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import CreateOrderForm from "@/components/forms/CreateOrderForm";
import PackNowModal from "@/components/optimization/PackNowModal";
import { useAppContext } from "@/context/AppContext";
import { Plus, RefreshCw, Package, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const { orders, loading, error, refetch, createOrder } = useOrders({ polling: true, pollingInterval: 5000 });
  const { addToast } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [showPackNow, setShowPackNow] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [summaries, setSummaries] = useState<Map<number, OrderOptimizationSummary>>(new Map());

  useEffect(() => {
    if (orders.length > 0) {
      getOrdersOptimizationSummary().then(data => {
        const map = new Map<number, OrderOptimizationSummary>();
        data.forEach(s => map.set(s.order_id, s));
        setSummaries(map);
      }).catch(() => {});
    }
  }, [orders]);

  const handleOptimize = (id: number) => {
    router.push(`/optimization?order=${id}`);
  };

  const handlePackNow = (id: number) => {
    setShowPackNow(id);
  };

  const handleCreate = async (data: {
    user_id: number;
    shipping_zone: string;
    items: { product_id: number; quantity: number }[];
  }) => {
    try {
      await createOrder(data);
      setShowModal(false);
      addToast("Order created successfully", "success");
      refetch();
    } catch {
      addToast("Failed to create order", "error");
    }
  };

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    optimized: orders.filter((o) => o.status === "optimized").length,
    processing: orders.filter((o) => o.status === "no_savings").length,
    failed: orders.filter((o) => o.status === "failed").length,
  };

  const filterOptions = [
    { key: "all", label: "All", icon: Package, color: "text-foreground" },
    { key: "pending", label: "Pending", icon: Clock, color: "text-accent" },
    { key: "optimized", label: "Optimized", icon: CheckCircle, color: "text-teal" },
    { key: "processing", label: "No Savings", icon: AlertCircle, color: "text-orange" },
    { key: "failed", label: "Failed", icon: XCircle, color: "text-red" },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load orders"
        description={error}
        action={
          <button onClick={refetch} className="text-sm text-accent hover:underline">
            Retry
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black text-foreground tracking-tight">Orders</h2>
          <p className="text-[12px] text-muted-dark mt-1">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] font-semibold text-muted hover:text-foreground hover:border-border2 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-3.5 w-3.5" />
            New Order
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterOptions.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-all whitespace-nowrap ${
                filter === f.key
                  ? "bg-accent/10 text-accent border border-accent/20 shadow-[0_0_20px_rgba(200,255,0,.05)]"
                  : "bg-surface border border-border text-muted hover:border-border2 hover:text-foreground"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${filter === f.key ? f.color : "text-muted-dark"}`} />
              {f.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                filter === f.key ? "bg-accent/10 text-accent/70" : "bg-ink2 text-muted-dark"
              }`}>
                {statusCounts[f.key as keyof typeof statusCounts]}
              </span>
            </button>
          );
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          title={filter === "all" ? "No orders yet" : `No ${filter} orders`}
          description={filter === "all" ? "Create your first order to get started" : `No orders with ${filter} status`}
          action={
            filter === "all" ? (
              <Button onClick={() => setShowModal(true)}>
                <Plus className="h-3.5 w-3.5" />
                Create Order
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setFilter("all")}>
                View all orders
              </Button>
            )
          }
        />
      ) : (
        <OrdersTable orders={filteredOrders} summaries={summaries} onOptimize={handleOptimize} onPackNow={handlePackNow} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Order">
        <CreateOrderForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} />
      </Modal>

      {showPackNow && (
        <PackNowModal orderId={showPackNow} onClose={() => setShowPackNow(null)} />
      )}
    </div>
  );
}
