import type { EventStatus, RegistrationStatus } from '../types'

export const queryKeys = {
  me: ['auth', 'me'] as const,
  dashboard: ['dashboard'] as const,
  events: (filters?: { status?: EventStatus | ''; date?: string }) =>
    ['events', filters ?? {}] as const,
  event: (id: string) => ['events', 'detail', id] as const,
  participants: (search = '') => ['participants', search] as const,
  registrations: (filters?: { eventId?: string; status?: RegistrationStatus | '' }) =>
    ['registrations', filters ?? {}] as const,
}
