import { API_URL } from "../lib/constants";
import { UploadResult, PackInstruction } from "../types";

function getAuthToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

export async function uploadOrders(
  file: File,
  userId: number,
  shippingZone: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId.toString());
  formData.append("shipping_zone", shippingZone);

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/upload-orders`, {
    method: "POST",
    body: formData,
    headers,
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
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/pack-instructions/${orderId}`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch packing instructions");
  }

  return response.json();
}
