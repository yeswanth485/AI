import { API_URL } from "../lib/constants";
import { UploadResult, PackInstruction } from "../types";

export async function uploadOrders(
  file: File,
  userId: number,
  shippingZone: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId.toString());
  formData.append("shipping_zone", shippingZone);

  const response = await fetch(`${API_URL}/upload-orders`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Upload failed");
  }

  return response.json();
}

export async function getPackInstructions(
  orderId: number
): Promise<PackInstruction> {
  const response = await fetch(`${API_URL}/pack-instructions/${orderId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch packing instructions");
  }

  return response.json();
}