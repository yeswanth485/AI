"use client";

import { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import AddBoxForm from "@/components/forms/AddBoxForm";
import Card from "@/components/ui/Card";
import { useAppContext } from "@/context/AppContext";
import { Plus, Package, Warehouse, AlertTriangle, Save, X } from "lucide-react";

export default function InventoryPage() {
  const { inventory, loading, error, refetch, addBox, updateQuantity } = useInventory();
  const { addToast } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingBoxId, setEditingBoxId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState("");

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
      setEditingBoxId(null);
      setEditQty("");
      refetch();
    } catch {
      addToast("Failed to update quantity", "error");
    }
  };

  const startEditing = (boxId: number, currentQty: number) => {
    setEditingBoxId(boxId);
    setEditQty(String(currentQty));
  };

  const cancelEditing = () => {
    setEditingBoxId(null);
    setEditQty("");
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

  const totalBoxes = inventory.length;
  const totalUnits = inventory.reduce((sum, b) => sum + b.quantity_available, 0);
  const lowStock = inventory.filter((b) => b.quantity_available < 30).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-black text-foreground tracking-tight">Box Inventory</h2>
          <p className="text-[12px] text-muted-dark mt-0.5">Manage your packaging materials</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Box
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card hover>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="font-display text-2xl font-black text-foreground">{totalBoxes}</div>
              <div className="text-[10px] text-muted-dark uppercase tracking-wider">Box types</div>
            </div>
          </div>
        </Card>
        <Card hover>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center">
              <Warehouse className="h-5 w-5 text-accent-green" />
            </div>
            <div>
              <div className="font-display text-2xl font-black text-foreground">{totalUnits}</div>
              <div className="text-[10px] text-muted-dark uppercase tracking-wider">Total units</div>
            </div>
          </div>
        </Card>
        <Card hover>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-accent-red" />
            </div>
            <div>
              <div className="font-display text-2xl font-black text-accent-red">{lowStock}</div>
              <div className="text-[10px] text-muted-dark uppercase tracking-wider">Low stock (&lt;30)</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Inventory Grid */}
      {inventory.length === 0 ? (
        <EmptyState
          title="No inventory items"
          description="Add your first box type to get started"
          action={
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Box
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          {inventory.map((box) => (
            <Card key={box.id} hover className="relative">
              {box.quantity_available < 30 && (
                <div className="absolute top-3 right-3 text-[8px] font-bold text-accent-red bg-accent-red/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  LOW
                </div>
              )}
              <div className="font-display text-lg font-black text-accent mb-1">{box.name}</div>
              <div className="text-[11px] text-muted-dark mb-3">
                {box.length_cm} × {box.width_cm} × {box.height_cm} cm · Max {box.max_weight_kg}kg
              </div>
              <div className="flex items-end justify-between">
                <div>
                  {editingBoxId === box.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = parseInt(editQty, 10);
                            if (!isNaN(val) && val >= 0) {
                              handleUpdateQty(box.id, val);
                            }
                          }
                          if (e.key === "Escape") cancelEditing();
                        }}
                        className="w-20 px-2 py-1 text-sm bg-[#1a1a1a] border border-border rounded text-foreground focus:outline-none focus:border-accent"
                        autoFocus
                        min="0"
                      />
                      <button
                        onClick={() => {
                          const val = parseInt(editQty, 10);
                          if (!isNaN(val) && val >= 0) {
                            handleUpdateQty(box.id, val);
                          }
                        }}
                        className="p-1 text-accent-green hover:text-accent-green/80 transition-colors"
                        title="Save"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-muted hover:text-foreground transition-colors"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={`font-display text-2xl font-black ${
                        box.quantity_available > 30 ? "text-foreground" : "text-accent-red"
                      }`}>
                        {box.quantity_available}
                      </div>
                      <div className="text-[9px] text-muted-dark uppercase tracking-wider">In stock</div>
                    </>
                  )}
                </div>
                {editingBoxId !== box.id && (
                  <button
                    onClick={() => startEditing(box.id, box.quantity_available)}
                    className="text-[11px] text-accent hover:underline font-semibold"
                  >
                    Edit qty
                  </button>
                )}
              </div>
              {box.supports_fragile && (
                <div className="mt-2 text-[10px] text-accent-green font-semibold">✓ Fragile safe</div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add new box type">
        <AddBoxForm onSubmit={handleAddBox} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
