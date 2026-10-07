import type { DashboardStats } from "../types";
import { http } from "./client";

export async function getDashboard(): Promise<DashboardStats> {
  const { data } = await http.get<DashboardStats>("/dashboard");
  return data;
}
