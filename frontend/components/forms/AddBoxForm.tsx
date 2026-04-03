"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface AddBoxFormProps {
  onSubmit: (data: {
    name: string;
    length_cm: number;
    width_cm: number;
    height_cm: number;
    max_weight_kg: number;
    supports_fragile: boolean;
    quantity_available: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function AddBoxForm({ onSubmit, onCancel }: AddBoxFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    max_weight_kg: "",
    supports_fragile: false,
    quantity_available: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.length_cm || Number(form.length_cm) <= 0) newErrors.length_cm = "Must be > 0";
    if (!form.width_cm || Number(form.width_cm) <= 0) newErrors.width_cm = "Must be > 0";
    if (!form.height_cm || Number(form.height_cm) <= 0) newErrors.height_cm = "Must be > 0";
    if (!form.max_weight_kg || Number(form.max_weight_kg) <= 0) newErrors.max_weight_kg = "Must be > 0";
    if (!form.quantity_available || Number(form.quantity_available) < 0) newErrors.quantity_available = "Must be >= 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        name: form.name,
        length_cm: Number(form.length_cm),
        width_cm: Number(form.width_cm),
        height_cm: Number(form.height_cm),
        max_weight_kg: Number(form.max_weight_kg),
        supports_fragile: form.supports_fragile,
        quantity_available: Number(form.quantity_available),
      });
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="box-name"
        label="Box Name"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
        placeholder="e.g., Standard Box A"
      />
      <div className="grid grid-cols-3 gap-3">
        <Input
          id="box-length"
          label="Length (cm)"
          type="number"
          step="0.1"
          value={form.length_cm}
          onChange={(e) => update("length_cm", e.target.value)}
          error={errors.length_cm}
        />
        <Input
          id="box-width"
          label="Width (cm)"
          type="number"
          step="0.1"
          value={form.width_cm}
          onChange={(e) => update("width_cm", e.target.value)}
          error={errors.width_cm}
        />
        <Input
          id="box-height"
          label="Height (cm)"
          type="number"
          step="0.1"
          value={form.height_cm}
          onChange={(e) => update("height_cm", e.target.value)}
          error={errors.height_cm}
        />
      </div>
      <Input
        id="box-weight"
        label="Max Weight (kg)"
        type="number"
        step="0.1"
        value={form.max_weight_kg}
        onChange={(e) => update("max_weight_kg", e.target.value)}
        error={errors.max_weight_kg}
      />
      <Input
        id="box-qty"
        label="Available Quantity"
        type="number"
        value={form.quantity_available}
        onChange={(e) => update("quantity_available", e.target.value)}
        error={errors.quantity_available}
      />
      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={form.supports_fragile}
          onChange={(e) => update("supports_fragile", e.target.checked)}
          className="rounded border-border bg-surface text-accent focus:ring-accent"
        />
        Supports Fragile Items
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Add Box
        </Button>
      </div>
    </form>
  );
}
