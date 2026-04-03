"use client";

import { BoxInventory } from "@/types";
import { formatDimensions, formatWeight } from "@/lib/utils";

interface InventoryTableProps {
  inventory: BoxInventory[];
  onUpdateQuantity?: (boxId: number, qty: number) => void;
}

export default function InventoryTable({ inventory, onUpdateQuantity }: InventoryTableProps) {
  if (inventory.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-muted">No inventory items found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 font-medium text-muted">Box Name</th>
            <th className="px-4 py-3 font-medium text-muted">Dimensions</th>
            <th className="px-4 py-3 font-medium text-muted">Max Weight</th>
            <th className="px-4 py-3 font-medium text-muted">Fragile</th>
            <th className="px-4 py-3 font-medium text-muted">Available</th>
            <th className="px-4 py-3 font-medium text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((box) => (
            <tr key={box.id} className="border-b border-border/50 hover:bg-background/50 transition-all">
              <td className="px-4 py-3 font-medium text-foreground">{box.name}</td>
              <td className="px-4 py-3 text-muted font-mono text-xs">
                {formatDimensions(box.length_cm, box.width_cm, box.height_cm)}
              </td>
              <td className="px-4 py-3 text-muted">{formatWeight(box.max_weight_kg)}</td>
              <td className="px-4 py-3">
                <span className={box.supports_fragile ? "text-accent-green" : "text-accent-red"}>
                  {box.supports_fragile ? "✓" : "✗"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    box.quantity_available > 10
                      ? "text-accent-green"
                      : box.quantity_available > 0
                      ? "text-yellow-400"
                      : "text-accent-red"
                  }
                >
                  {box.quantity_available}
                </span>
              </td>
              <td className="px-4 py-3">
                {onUpdateQuantity && (
                  <button
                    onClick={() => {
                      const newQty = prompt("Enter new quantity:", String(box.quantity_available));
                      if (newQty !== null && !isNaN(Number(newQty))) {
                        onUpdateQuantity(box.id, Number(newQty));
                      }
                    }}
                    className="text-xs text-accent hover:underline"
                  >
                    Edit Qty
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
