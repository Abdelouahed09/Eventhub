import { cn } from "../../utils/cn";
import type { EventStatus, RegistrationStatus } from "../../types";

const eventLabels: Record<EventStatus, string> = {
  draft: "Brouillon",
  published: "Publié",
  cancelled: "Annulé",
};

const registrationLabels: Record<RegistrationStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
};

export function EventBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        status === "published" && "bg-sage/10 text-sage",
        status === "draft" && "bg-gold/15 text-amber-800",
        status === "cancelled" && "bg-red-100 text-red-800",
      )}
    >
      {eventLabels[status]}
    </span>
  );
}

export function RegistrationBadge({ status }: { status: RegistrationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "confirmed" && "bg-sage/10 text-sage",
        status === "pending" && "bg-sky/10 text-sky",
        status === "cancelled" && "bg-red-100 text-red-800",
      )}
    >
      {registrationLabels[status]}
    </span>
  );
}
