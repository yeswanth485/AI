import api from "./api";
import type { AuthUser } from "@/types";

interface LoginResponse {
  token: string;
  user: Omit<AuthUser, "token">;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export async function register(name: string, email: string, password: string): Promise<void> {
  await api.post("/auth/register", { name, email, password });
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

export function getStoredUser(): AuthUser | null {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  if (!token || !userStr) return null;
  const user = JSON.parse(userStr);
  return { ...user, token };
}
