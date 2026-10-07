import type { EventItem, EventStatus } from "../types";
import { http } from "./client";

export async function listEvents(params?: {
  status?: EventStatus | "";
  date?: string;
}) {
  const { data } = await http.get<EventItem[]>("/events", { params });
  return data;
}

export async function getEvent(id: string) {
  const { data } = await http.get<EventItem>(`/events/${id}`);
  return data;
}

export async function createEvent(payload: {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  maxParticipants: number;
  createdBy: string;
}) {
  const { data } = await http.post<EventItem>("/events", payload);
  return data;
}

export async function updateEvent(id: string, payload: Partial<EventItem>) {
  const { data } = await http.put<EventItem>(`/events/${id}`, payload);
  return data;
}

export async function updateEventStatus(id: string, status: EventStatus) {
  const { data } = await http.patch<EventItem>(`/events/${id}/status`, {
    status,
  });
  return data;
}
