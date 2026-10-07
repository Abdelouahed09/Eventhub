import type { Participant } from "../types";
import { http } from "./client";

export async function listParticipants(search = "") {
  const { data } = await http.get<Participant[]>("/participants", {
    params: { search },
  });
  return data;
}

export async function createParticipant(
  payload: Pick<Participant, "fullName" | "email" | "phone">,
) {
  const { data } = await http.post<Participant>("/participants", payload);
  return data;
}

export async function updateParticipant(
  id: string,
  payload: Partial<Pick<Participant, "fullName" | "email" | "phone">>,
) {
  const { data } = await http.put<Participant>(`/participants/${id}`, payload);
  return data;
}
