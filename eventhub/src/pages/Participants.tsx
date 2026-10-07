import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageMotion } from "../components/layout/PageMotion";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import {
  useCreateParticipant,
  useParticipants,
  useUpdateParticipant,
} from "../hooks/useParticipants";
import type { Participant } from "../types";
import { getErrorMessage } from "../utils/error";
import { formatDate } from "../utils/format";

const empty = { fullName: "", email: "", phone: "" };

export function ParticipantsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const { data: people = [], isPending } = useParticipants(query);
  const createParticipant = useCreateParticipant();
  const updateParticipant = useUpdateParticipant();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Participant | null>(null);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(person: Participant) {
    setEditing(person);
    setForm({
      fullName: person.fullName,
      email: person.email,
      phone: person.phone ?? "",
    });
    setOpen(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      if (editing) {
        await updateParticipant.mutateAsync({ id: editing.id, payload: form });
        toast.success("Participant mis à jour");
      } else {
        await createParticipant.mutateAsync(form);
        toast.success("Participant créé");
      }
      setOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <PageMotion>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-ink-soft">
            Annuaire
          </p>
          <h1 className="mt-2 font-display text-4xl">Participants</h1>
        </div>
        <Button onClick={openCreate}>Nouveau participant</Button>
      </div>

      <input
        className="mt-6 w-full max-w-md rounded-full border border-line bg-card px-5 py-3"
        placeholder="Rechercher par nom ou email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Téléphone</th>
              <th className="px-4 py-3 font-medium">Créé le</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              <tr>
                <td className="px-4 py-8 text-ink-soft" colSpan={5}>
                  Chargement…
                </td>
              </tr>
            ) : (
              people.map((person) => (
                <tr key={person.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium">{person.fullName}</td>
                  <td className="px-4 py-3 text-ink-soft">{person.email}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {person.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {formatDate(person.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="font-semibold text-ember"
                      onClick={() => openEdit(person)}
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editing ? "Modifier le participant" : "Nouveau participant"}
        onClose={() => setOpen(false)}
      >
        <form className="grid gap-3" onSubmit={onSubmit}>
          <input
            required
            placeholder="Nom complet"
            className="rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Téléphone (optionnel)"
            type="tel"
            className="rounded-2xl border border-line bg-paper px-4 py-3"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Button
            type="submit"
            disabled={
              createParticipant.isPending || updateParticipant.isPending
            }
          >
            {editing ? "Enregistrer" : "Créer"}
          </Button>
        </form>
      </Modal>
    </PageMotion>
  );
}
