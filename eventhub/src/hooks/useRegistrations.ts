import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import { createRegistration, listRegistrations, updateRegistrationStatus } from '../api/registrations'
import type { RegistrationStatus } from '../types'

export function useRegistrations(filters?: { eventId?: string; status?: RegistrationStatus | '' }) {
  return useQuery({
    queryKey: queryKeys.registrations(filters),
    queryFn: () => listRegistrations(filters),
  })
}

export function useCreateRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, participantId }: { eventId: string; participantId: string }) =>
      createRegistration(eventId, participantId),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['registrations'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      void queryClient.invalidateQueries({ queryKey: queryKeys.event(vars.eventId) })
    },
  })
}

export function useUpdateRegistrationStatus(eventId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RegistrationStatus }) =>
      updateRegistrationStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['registrations'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      if (eventId) void queryClient.invalidateQueries({ queryKey: queryKeys.event(eventId) })
    },
  })
}
