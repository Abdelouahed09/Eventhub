import type { AuthResponse, User } from "../types";
import { http } from "./client";

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function getMe(token?: string): Promise<User> {
  const { data } = await http.get<User>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}
