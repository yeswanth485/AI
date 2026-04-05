"use client";

import { useState, useEffect } from "react";
import { OptimizationResult, BoxInventory } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { CheckCircle, TrendingUp, Box, Info, Rotate3D } from "lucide-react";
import dynamic from "next/dynamic";
import api from "@/services/api";

const ThreeDPackViewer = dynamic(
  () => import("./ThreeDPackViewer"),
  { ssr: false, loading: () => <div className="h-[500px] bg-[#111111] rounded-lg flex items-center justify-center text-gray-500">Loading 3D viewer...</div> }
);

interface OptimizationResultProps {
  result: OptimizationResult;
}

export default function OptimizationResultCard({ result }: OptimizationResultProps) {
  const [show3D, setShow3D] = useState(false);
  const [boxes, setBoxes] = useState<BoxInventory[]>([]);
  const savingsPercent =
    result.baseline_cost > 0
      ? ((result.baseline_cost - result.optimized_cost) / result.baseline_cost) * 100
      : 0;

  useEffect(() => {
    api.get<BoxInventory[]>("/inventory")
      .then(res => setBoxes(res.data))
      .catch(() => {});
  }, []);

  const selectedBox = boxes.find(b => b.name === result.recommended_box);
  const boxDims = selectedBox || { length_cm: 45, width_cm: 35, height_cm: 25 };

  const boxInfo = {
    name: result.recommended_box,
    length_cm: boxDims.length_cm,
    width_cm: boxDims.width_cm,
    height_cm: boxDims.height_cm,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-accent-green" />
        <div>
          <h3 className="font-display text-base font-bold text-foreground tracking-tight">Optimization Complete</h3>
          <p className="text-[12px] text-muted">Order #{result.order_id}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={result.savings > 0 ? "success" : "info"}>
            {result.savings > 0 ? "optimized" : "no_savings"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Box className="h-4 w-4 text-accent" />
            <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Box</p>
          </div>
          <p className="font-display text-lg font-black text-foreground tracking-tight">{result.recommended_box}</p>
        </Card>
        <Card>
          <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-2">Baseline</p>
          <p className="font-display text-lg font-black text-muted tracking-tight">{formatCurrency(result.baseline_cost)}</p>
        </Card>
        <Card>
          <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-2">Optimized</p>
          <p className="font-display text-lg font-black text-accent-green tracking-tight">{formatCurrency(result.optimized_cost)}</p>
        </Card>
        <Card>
          <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-2">Savings</p>
          <p className="font-display text-lg font-black text-accent-green tracking-tight">
            {formatCurrency(result.savings)}
            <span className="ml-1 text-[11px] text-muted font-sans">({savingsPercent.toFixed(1)}%)</span>
          </p>
        </Card>
      </div>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-accent" />
          <p className="text-[13px] font-semibold text-foreground">Efficiency Score</p>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${result.efficiency_score * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-[11px] text-muted">{formatPercentage(result.efficiency_score)}</p>
      </Card>

      <Card className="border-l-[3px] border-l-accent/30">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
          <div>
            <p className="text-[13px] font-semibold text-foreground mb-1">Decision Explanation</p>
            <p className="text-[12px] text-muted leading-relaxed">{result.decision_explanation}</p>
          </div>
        </div>
      </Card>

      {result.packed_items && result.packed_items.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Rotate3D className="h-4 w-4 text-accent" />
              <p className="text-[13px] font-semibold text-foreground">3D Packing Visualization</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShow3D(!show3D)}
                className="flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-3 py-1.5 text-[11px] font-semibold hover:bg-accent/20 transition-all"
              >
                <Rotate3D className="h-3 w-3" />
                {show3D ? "Hide 3D View" : "Show 3D View"}
              </button>
            </div>
          </div>
          {show3D && (
            <ThreeDPackViewer
              box={boxInfo}
              items={result.packed_items.map(item => ({
                product_name: item.product_name,
                position_x: item.position_x,
                position_y: item.position_y,
                position_z: item.position_z,
                length_cm: item.length_cm || 10,
                width_cm: item.width_cm || 10,
                height_cm: item.height_cm || 10,
                is_fragile: item.is_fragile,
                quantity: item.quantity,
              }))}
            />
          )}
        </Card>
      )}

      {result.item_order && result.item_order.length > 0 && (
        <Card>
          <p className="text-[13px] font-semibold text-foreground mb-3">Packing Order</p>
          <div className="space-y-2">
            {result.item_order.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-border/50 last:border-0">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <span className="text-[13px] text-foreground font-medium">{item.product_name}</span>
                  <span className="text-[12px] text-muted ml-1">×{item.quantity}</span>
                </div>
                <Badge variant={item.is_fragile ? "danger" : "success"}>
                  {item.layer}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
