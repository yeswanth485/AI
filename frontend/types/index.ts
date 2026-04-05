export interface AuthUser {
  id: number;
  name: string;
  email: string;
  token: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface Order {
  id: number;
  user_id: number;
  shipping_zone: string;
  status: "pending" | "optimized" | "failed" | "no_savings";
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  is_fragile: boolean;
}

export interface BoxInventory {
  id: number;
  name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  max_weight_kg: number;
  supports_fragile: boolean;
  quantity_available: number;
}

export interface OptimizationResult {
  order_id: number;
  recommended_box: string;
  baseline_cost: number;
  optimized_cost: number;
  savings: number;
  efficiency_score: number;
  decision_explanation: string;
  profit: number;
  packing_instructions: string;
  item_order: {
    product_name: string;
    quantity: number;
    is_fragile: boolean;
    layer: string;
  }[];
  packed_items: {
    product_id: number;
    product_name: string;
    quantity: number;
    is_fragile: boolean;
    position_x: number;
    position_y: number;
    position_z: number;
    layer: string;
    length_cm?: number;
    width_cm?: number;
    height_cm?: number;
  }[];
}

export interface SavingsTrendPoint {
  date: string;
  savings: number;
}

export interface BoxUsagePoint {
  box_name: string;
  count: number;
}

export interface CostComparisonPoint {
  order_id: number;
  baseline: number;
  optimized: number;
}

export interface ProfitTrendPoint {
  date: string;
  profit: number;
}

export interface AnalyticsSummary {
  total_orders: number;
  total_savings: number;
  avg_savings_per_order: number;
  avg_efficiency: number;
  total_profit: number;
  profit_trend: ProfitTrendPoint[];
  savings_trend: SavingsTrendPoint[];
  box_usage: BoxUsagePoint[];
  cost_comparison: CostComparisonPoint[];
}

export interface UploadResult {
  upload_id: number;
  total_rows: number;
  valid_rows: number;
  failed_rows: number;
  order_ids: number[];
  errors: { row: number; error: string }[];
}

export interface PackInstruction {
  order_id: number;
  box_name: string;
  instructions: string;
  item_order: {
    product_name: string;
    quantity: number;
    is_fragile: boolean;
    layer: string;
  }[];
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
