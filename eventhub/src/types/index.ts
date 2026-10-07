export type Role = "admin" | "staff";
export type EventStatus = "draft" | "published" | "cancelled";
export type RegistrationStatus = "pending" | "confirmed" | "cancelled";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
};

export type EventItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  maxParticipants: number;
  status: EventStatus;
  createdBy: string;
  createdAt: string;
};

export type Participant = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
};

export type Registration = {
  id: string;
  eventId: string;
  participantId: string;
  status: RegistrationStatus;
  createdAt: string;
};

export type DashboardStats = {
  totalEvents: number;
  publishedEvents: number;
  registrationsToday: number;
  topEvents: Array<{
    id: string;
    title: string;
    filled: number;
    maxParticipants: number;
    occupancy: number;
  }>;
};

export type AuthResponse = {
  token: string;
  user: User;
};
