"use client";

import { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import InventoryTable from "@/components/tables/InventoryTable";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import AddBoxForm from "@/components/forms/AddBoxForm";
import { useAppContext } from "@/context/AppContext";
import { Plus } from "lucide-react";

export default function InventoryPage() {
  const { inventory, loading, error, refetch, addBox, updateQuantity } = useInventory();
  const { addToast } = useAppContext();
  const [showModal, setShowModal] = useState(false);

  const handleAddBox = async (data: {
    name: string;
    length_cm: number;
    width_cm: number;
    height_cm: number;
    max_weight_kg: number;
    supports_fragile: boolean;
    quantity_available: number;
  }) => {
    try {
      await addBox(data);
      setShowModal(false);
      addToast("Box added successfully", "success");
      refetch();
    } catch {
      addToast("Failed to add box", "error");
    }
  };

  const handleUpdateQty = async (boxId: number, qty: number) => {
    try {
      await updateQuantity(boxId, qty);
      addToast("Quantity updated", "success");
      refetch();
    } catch {
      addToast("Failed to update quantity", "error");
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
        title="Failed to load inventory"
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
          <h2 className="text-lg font-semibold text-foreground">Box Inventory</h2>
          <p className="text-sm text-muted">{inventory.length} box types</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add Box
        </Button>
      </div>

      {inventory.length === 0 ? (
        <EmptyState
          title="No inventory items"
          description="Add your first box type to get started"
          action={
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" />
              Add Box
            </Button>
          }
        />
      ) : (
        <InventoryTable inventory={inventory} onUpdateQuantity={handleUpdateQty} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Box">
        <AddBoxForm onSubmit={handleAddBox} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
