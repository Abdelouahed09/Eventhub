import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageMotion } from "../components/layout/PageMotion";
import { Button } from "../components/ui/Button";
import { useEvents } from "../hooks/useEvents";
import { useParticipants } from "../hooks/useParticipants";
import { useCreateRegistration } from "../hooks/useRegistrations";
import { getErrorMessage } from "../utils/error";

export function RegisterPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data: events = [] } = useEvents({ status: "published" });
  const { data: people = [] } = useParticipants();
  const createRegistration = useCreateRegistration();
  const [eventId, setEventId] = useState(params.get("eventId") ?? "");
  const [participantId, setParticipantId] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await createRegistration.mutateAsync({ eventId, participantId });
      toast.success("Inscription enregistrée");
      navigate(`/events/${eventId}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <PageMotion>
      <p className="text-sm uppercase tracking-[0.2em] text-ink-soft">Flux</p>
      <h1 className="mt-2 font-display text-4xl">Inscrire un participant</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Uniquement sur un événement publié. Un participant ne peut pas
        s’inscrire deux fois, et la jauge maxParticipants est respectée.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 max-w-xl space-y-4 rounded-3xl border border-line bg-card p-6 shadow-sm"
      >
        <label className="block text-sm font-medium">
          Événement publié
          <select
            required
            className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            <option value="">Choisir…</option>
            {events.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} — {item.location}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Participant
          <select
            required
            className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3"
            value={participantId}
            onChange={(e) => setParticipantId(e.target.value)}
          >
            <option value="">Choisir…</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.fullName} — {person.email}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" disabled={createRegistration.isPending}>
          Confirmer l’inscription
        </Button>
      </form>
    </PageMotion>
  );
}
