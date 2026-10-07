import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PageMotion } from "../components/layout/PageMotion";
import { EventBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";
import { useCreateEvent, useEvents } from "../hooks/useEvents";
import type { EventStatus } from "../types";
import { getErrorMessage } from "../utils/error";
import { formatDateTime } from "../utils/format";

const filters: Array<{ label: string; value: EventStatus | "" }> = [
  { label: "Tous", value: "" },
  { label: "Publiés", value: "published" },
  { label: "Brouillons", value: "draft" },
  { label: "Annulés", value: "cancelled" },
];

const emptyForm = {
  title: "",
  description: "",
  location: "",
  eventDate: "",
  maxParticipants: 50,
};

export function EventsPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<EventStatus | "">("");
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { data: events = [], isPending } = useEvents({ status, date });
  const createEvent = useCreateEvent();

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    try {
      await createEvent.mutateAsync({
        ...form,
        eventDate: new Date(form.eventDate).toISOString(),
        createdBy: user!.id,
      });
      toast.success("Événement créé en brouillon");
      setOpen(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <PageMotion>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-ink-soft">
            Catalogue
          </p>
          <h1 className="mt-2 font-display text-4xl">Événements</h1>
        </div>
        <Button onClick={() => setOpen(true)}>Nouvel événement</Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {filters.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setStatus(item.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              status === item.value
                ? "bg-ink text-white"
                : "bg-card text-ink-soft ring-1 ring-line"
            }`}
          >
            {item.label}
          </button>
        ))}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-full border border-line bg-card px-4 py-2 text-sm"
        />
        {date ? (
          <button
            type="button"
            className="text-sm text-ember"
            onClick={() => setDate("")}
          >
            Réinitialiser la date
          </button>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4">
        {isPending ? (
          <p className="text-ink-soft">Chargement des événements…</p>
        ) : events.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line p-10 text-center text-ink-soft">
            Aucun événement pour ces filtres.
          </p>
        ) : (
          events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="rounded-3xl border border-line bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl">{event.title}</h2>
                  <p className="mt-1 text-ink-soft">{event.location}</p>
                </div>
                <EventBadge status={event.status} />
              </div>
              <p className="mt-3 max-w-3xl text-sm text-ink-soft">
                {event.description}
              </p>
              <p className="mt-4 text-sm font-medium">
                {formatDateTime(event.eventDate)} · {event.maxParticipants}{" "}
                places
              </p>
            </Link>
          ))
        )}
      </div>

      <Modal
        open={open}
        title="Créer un événement"
        onClose={() => setOpen(false)}
      >
        <form className="grid gap-3" onSubmit={onCreate}>
          <input
            required
            placeholder="Titre"
            className="rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            required
            placeholder="Description"
            className="min-h-24 rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            required
            placeholder="Lieu"
            className="rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            required
            type="datetime-local"
            className="rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
          />
          <input
            required
            type="number"
            min={1}
            className="rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.maxParticipants}
            onChange={(e) =>
              setForm({ ...form, maxParticipants: Number(e.target.value) })
            }
          />
          <Button type="submit" disabled={createEvent.isPending}>
            Enregistrer le brouillon
          </Button>
        </form>
      </Modal>
    </PageMotion>
  );
}
