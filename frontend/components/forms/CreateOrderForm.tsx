"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface CreateOrderFormProps {
  onSubmit: (data: {
    user_id: number;
    shipping_zone: string;
    items: { product_id: number; quantity: number }[];
  }) => Promise<void>;
  onCancel: () => void;
}

export default function CreateOrderForm({ onSubmit, onCancel }: CreateOrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [zone, setZone] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: "" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addItem = () => {
    setItems((prev) => [...prev, { product_id: "", quantity: "" }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!userId || Number(userId) <= 0) newErrors.userId = "Valid user ID required";
    if (!zone.trim()) newErrors.zone = "Shipping zone required";
    items.forEach((item, i) => {
      if (!item.product_id || Number(item.product_id) <= 0) newErrors[`item_${i}_product`] = "Required";
      if (!item.quantity || Number(item.quantity) <= 0) newErrors[`item_${i}_qty`] = "Required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        user_id: Number(userId),
        shipping_zone: zone,
        items: items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
        })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="order-user-id"
        label="User ID"
        type="number"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        error={errors.userId}
      />
      <Input
        id="order-zone"
        label="Shipping Zone"
        value={zone}
        onChange={(e) => setZone(e.target.value)}
        error={errors.zone}
        placeholder="e.g., Zone A"
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted">Order Items</label>
          <button type="button" onClick={addItem} className="text-xs text-accent hover:underline">
            + Add Item
          </button>
        </div>
        {items.map((item, index) => (
          <div key={index} className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                id={`item-product-${index}`}
                label={`Item ${index + 1} — Product ID`}
                type="number"
                value={item.product_id}
                onChange={(e) => updateItem(index, "product_id", e.target.value)}
                error={errors[`item_${index}_product`]}
              />
            </div>
            <div className="w-24">
              <Input
                id={`item-qty-${index}`}
                label="Qty"
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                error={errors[`item_${index}_qty`]}
              />
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="mb-2 text-xs text-accent-red hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Order
        </Button>
      </div>
    </form>
  );
}
