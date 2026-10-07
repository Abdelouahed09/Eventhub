import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createParticipant, listParticipants, updateParticipant } from '../api/participants'
import { queryKeys } from '../api/queryKeys'
import type { Participant } from '../types'

export function useParticipants(search = '') {
  return useQuery({
    queryKey: queryKeys.participants(search),
    queryFn: () => listParticipants(search),
  })
}

export function useCreateParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createParticipant,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}

export function useUpdateParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<Pick<Participant, 'fullName' | 'email' | 'phone'>>
    }) => updateParticipant(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}
