import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PageMotion } from "../components/layout/PageMotion";
import { EventBadge, RegistrationBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import {
  useEvent,
  useUpdateEvent,
  useUpdateEventStatus,
} from "../hooks/useEvents";
import { useParticipants } from "../hooks/useParticipants";
import {
  useRegistrations,
  useUpdateRegistrationStatus,
} from "../hooks/useRegistrations";
import type { EventStatus, RegistrationStatus } from "../types";
import { getErrorMessage } from "../utils/error";
import { formatDateTime } from "../utils/format";

export function EventDetailPage() {
  const { id } = useParams();
  const { data: event, isPending } = useEvent(id);
  const { data: registrations = [] } = useRegistrations({ eventId: id });
  const { data: participants = [] } = useParticipants();
  const updateEvent = useUpdateEvent(id ?? "");
  const updateStatus = useUpdateEventStatus(id ?? "");
  const updateRegStatus = useUpdateRegistrationStatus(id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    maxParticipants: 0,
  });

  useEffect(() => {
    if (!event) return;
    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      eventDate: event.eventDate.slice(0, 16),
      maxParticipants: event.maxParticipants,
    });
  }, [event]);

  const peopleById = useMemo(
    () => Object.fromEntries(participants.map((p) => [p.id, p])),
    [participants],
  );

  if (isPending || !event)
    return <p className="text-ink-soft">Chargement de l’événement…</p>;

  const filled = registrations.filter((r) => r.status !== "cancelled").length;

  async function changeStatus(status: EventStatus) {
    try {
      await updateStatus.mutateAsync(status);
      toast.success(
        status === "cancelled"
          ? "Événement annulé — inscriptions annulées"
          : "Statut mis à jour",
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function save() {
    try {
      await updateEvent.mutateAsync({
        ...form,
        eventDate: new Date(form.eventDate).toISOString(),
      });
      toast.success("Événement modifié");
      setEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function changeRegStatus(regId: string, status: RegistrationStatus) {
    try {
      await updateRegStatus.mutateAsync({ id: regId, status });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <PageMotion>
      <Link
        to="/events"
        className="text-sm font-semibold text-ember hover:underline"
      >
        ← Tous les événements
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl">{event.title}</h1>
            <EventBadge status={event.status} />
          </div>
          <p className="mt-2 text-ink-soft">
            {event.location} · {formatDateTime(event.eventDate)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {event.status === "draft" ? (
            <Button onClick={() => changeStatus("published")}>Publier</Button>
          ) : null}
          {event.status !== "cancelled" ? (
            <Button variant="danger" onClick={() => changeStatus("cancelled")}>
              Annuler l’événement
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => setEditing((v) => !v)}>
            {editing ? "Fermer" : "Modifier"}
          </Button>
        </div>
      </div>

      {editing ? (
        <div className="mt-6 grid gap-3 rounded-3xl border border-line bg-card p-6">
          <input
            className="rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className="rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            type="datetime-local"
            className="rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
          />
          <input
            type="number"
            min={1}
            className="rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.maxParticipants}
            onChange={(e) =>
              setForm({ ...form, maxParticipants: Number(e.target.value) })
            }
          />
          <Button onClick={save} disabled={updateEvent.isPending}>
            Enregistrer
          </Button>
        </div>
      ) : (
        <p className="mt-6 max-w-3xl text-ink-soft">{event.description}</p>
      )}

      <div className="mt-6 rounded-2xl bg-card px-5 py-4 text-sm ring-1 ring-line">
        Places actives : <strong>{filled}</strong> / {event.maxParticipants}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-3xl">Inscriptions</h2>
          <Link
            to="/register"
            className="text-sm font-semibold text-ember hover:underline"
          >
            Nouvelle inscription
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Participant</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-ink-soft" colSpan={4}>
                    Aucune inscription pour le moment.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => {
                  const person = peopleById[reg.participantId];
                  return (
                    <tr key={reg.id} className="border-t border-line">
                      <td className="px-4 py-3">{person?.fullName ?? "—"}</td>
                      <td className="px-4 py-3 text-ink-soft">
                        {person?.email ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <RegistrationBadge status={reg.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {reg.status !== "confirmed" ? (
                            <button
                              type="button"
                              className="text-sage"
                              onClick={() =>
                                changeRegStatus(reg.id, "confirmed")
                              }
                            >
                              Confirmer
                            </button>
                          ) : null}
                          {reg.status !== "cancelled" ? (
                            <button
                              type="button"
                              className="text-red-700"
                              onClick={() =>
                                changeRegStatus(reg.id, "cancelled")
                              }
                            >
                              Annuler
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PageMotion>
  );
}
