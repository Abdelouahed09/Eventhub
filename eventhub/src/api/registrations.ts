import type { Registration, RegistrationStatus } from "../types";
import { http } from "./client";

export async function listRegistrations(params?: {
  eventId?: string;
  status?: RegistrationStatus | "";
}) {
  const { data } = await http.get<Registration[]>("/registrations", { params });
  return data;
}

export async function createRegistration(
  eventId: string,
  participantId: string,
) {
  const { data } = await http.post<Registration>("/registrations", {
    eventId,
    participantId,
  });
  return data;
}

export async function updateRegistrationStatus(
  id: string,
  status: RegistrationStatus,
) {
  const { data } = await http.patch<Registration>(
    `/registrations/${id}/status`,
    { status },
  );
  return data;
}
