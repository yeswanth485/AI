"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import OrdersTable from "@/components/tables/OrdersTable";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import CreateOrderForm from "@/components/forms/CreateOrderForm";
import { useAppContext } from "@/context/AppContext";
import { Plus } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const { orders, loading, error, refetch, createOrder } = useOrders();
  const { addToast } = useAppContext();
  const [showModal, setShowModal] = useState(false);

  const handleOptimize = (id: number) => {
    router.push(`/optimization?order=${id}`);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Orders</h2>
          <p className="text-sm text-muted">{orders.length} total orders</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Create your first order to get started"
          action={
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" />
              Create Order
            </Button>
          }
        />
      ) : (
        <OrdersTable orders={orders} onOptimize={handleOptimize} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Order">
        <CreateOrderForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
