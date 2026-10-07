import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboard } from "../api/dashboard";
import {
  createEvent,
  getEvent,
  listEvents,
  updateEvent,
  updateEventStatus,
} from "../api/events";
import { queryKeys } from "../api/queryKeys";
import type { EventItem, EventStatus } from "../types";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboard,
  });
}

export function useEvents(filters?: {
  status?: EventStatus | "";
  date?: string;
}) {
  return useQuery({
    queryKey: queryKeys.events(filters),
    queryFn: () => listEvents(filters),
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.event(id ?? ""),
    queryFn: () => getEvent(id!),
    enabled: Boolean(id),
  });
}

function invalidateEvents(
  queryClient: ReturnType<typeof useQueryClient>,
  id?: string,
) {
  void queryClient.invalidateQueries({ queryKey: ["events"] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  if (id) void queryClient.invalidateQueries({ queryKey: queryKeys.event(id) });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => invalidateEvents(queryClient),
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<EventItem>) => updateEvent(id, payload),
    onSuccess: () => invalidateEvents(queryClient, id),
  });
}

export function useUpdateEventStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: EventStatus) => updateEventStatus(id, status),
    onSuccess: () => {
      invalidateEvents(queryClient, id);
      void queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });
}
