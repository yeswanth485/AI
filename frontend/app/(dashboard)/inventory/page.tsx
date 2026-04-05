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
import { Plus, Package, Warehouse, AlertTriangle, Save, X, Ruler, Weight, ShieldCheck, Box } from "lucide-react";

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
  const fragileBoxes = inventory.filter((b) => b.supports_fragile).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black text-foreground tracking-tight">Box Inventory</h2>
          <p className="text-[12px] text-muted-dark mt-1">Manage your packaging materials</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Box
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card hover gradient className="group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-2xl -translate-y-4 translate-x-4" />
          <div className="flex items-center gap-3 relative">
            <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Box className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="font-display text-2xl font-black text-foreground">{totalBoxes}</div>
              <div className="text-[10px] text-muted-dark uppercase tracking-wider">Box types</div>
            </div>
          </div>
        </Card>
        <Card hover gradient className="group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-teal/5 rounded-full blur-2xl -translate-y-4 translate-x-4" />
          <div className="flex items-center gap-3 relative">
            <div className="w-11 h-11 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center">
              <Warehouse className="h-5 w-5 text-teal" />
            </div>
            <div>
              <div className="font-display text-2xl font-black text-foreground">{totalUnits.toLocaleString()}</div>
              <div className="text-[10px] text-muted-dark uppercase tracking-wider">Total units</div>
            </div>
          </div>
        </Card>
        <Card hover gradient className="group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red/5 rounded-full blur-2xl -translate-y-4 translate-x-4" />
          <div className="flex items-center gap-3 relative">
            <div className="w-11 h-11 rounded-xl bg-red/10 border border-red/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red" />
            </div>
            <div>
              <div className="font-display text-2xl font-black text-red">{lowStock}</div>
              <div className="text-[10px] text-muted-dark uppercase tracking-wider">Low stock (&lt;30)</div>
            </div>
          </div>
        </Card>
        <Card hover gradient className="group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple/5 rounded-full blur-2xl -translate-y-4 translate-x-4" />
          <div className="flex items-center gap-3 relative">
            <div className="w-11 h-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-purple" />
            </div>
            <div>
              <div className="font-display text-2xl font-black text-purple">{fragileBoxes}</div>
              <div className="text-[10px] text-muted-dark uppercase tracking-wider">Fragile-safe</div>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          {inventory.map((box) => {
            const isLow = box.quantity_available < 30;
            const volume = (box.length_cm * box.width_cm * box.height_cm).toFixed(0);

            return (
              <Card key={box.id} hover className="group relative overflow-hidden">
                {isLow && (
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 text-[8px] font-bold text-red bg-red/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-red/20">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      LOW
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isLow ? "bg-red/10 border border-red/20" : "bg-accent/10 border border-accent/20"
                  }`}>
                    <Package className={`h-5 w-5 ${isLow ? "text-red" : "text-accent"}`} />
                  </div>
                  <div>
                    <div className="font-display text-lg font-black text-foreground group-hover:text-accent transition-colors">{box.name}</div>
                    <div className="text-[10px] text-muted-dark">{volume} cm³ volume</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-ink2 rounded-lg p-2.5 border border-border/50">
                    <div className="flex items-center gap-1.5 text-[9px] text-muted-dark uppercase tracking-wider mb-1">
                      <Ruler className="h-3 w-3" />
                      Dimensions
                    </div>
                    <div className="text-[11px] text-foreground font-medium">
                      {box.length_cm}×{box.width_cm}×{box.height_cm}cm
                    </div>
                  </div>
                  <div className="bg-ink2 rounded-lg p-2.5 border border-border/50">
                    <div className="flex items-center gap-1.5 text-[9px] text-muted-dark uppercase tracking-wider mb-1">
                      <Weight className="h-3 w-3" />
                      Max Weight
                    </div>
                    <div className="text-[11px] text-foreground font-medium">
                      {box.max_weight_kg}kg
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between pt-3 border-t border-border/50">
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
                          className="w-20 px-2 py-1 text-sm bg-ink2 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
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
                          className="p-1.5 text-teal hover:bg-teal/10 rounded-lg transition-all"
                          title="Save"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1.5 text-muted hover:bg-white/[.04] rounded-lg transition-all"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className={`font-display text-2xl font-black ${
                          isLow ? "text-red" : "text-foreground"
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
                      className="text-[11px] text-accent hover:bg-accent/10 px-2.5 py-1 rounded-full transition-all font-semibold"
                    >
                      Edit qty
                    </button>
                  )}
                </div>

                {box.supports_fragile && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-teal font-semibold bg-teal/5 px-2.5 py-1.5 rounded-lg border border-teal/10">
                    <ShieldCheck className="h-3 w-3" />
                    Fragile-safe packaging
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add new box type">
        <AddBoxForm onSubmit={handleAddBox} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
