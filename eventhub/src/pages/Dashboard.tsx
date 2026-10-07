import { Link } from "react-router-dom";
import { PageMotion } from "../components/layout/PageMotion";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../hooks/useEvents";

export function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isPending } = useDashboard();

  if (isPending || !stats)
    return <p className="text-ink-soft">Chargement des statistiques…</p>;

  const cards = [
    { label: "Événements", value: stats.totalEvents, hint: "Tous statuts" },
    {
      label: "Publiés",
      value: stats.publishedEvents,
      hint: "Visibles aux inscriptions",
    },
    {
      label: "Inscriptions du jour",
      value: stats.registrationsToday,
      hint: "Créées aujourd’hui",
    },
  ];

  return (
    <PageMotion>
      <p className="text-sm uppercase tracking-[0.2em] text-ink-soft">
        Vue d’ensemble
      </p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">
        Bonjour, {user?.fullName.split(" ")[0]}
      </h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Suivez le remplissage des salles et les inscriptions en temps réel.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-3xl border border-line bg-card p-6 shadow-sm"
          >
            <p className="text-sm text-ink-soft">{card.label}</p>
            <p className="mt-3 font-display text-5xl">{card.value}</p>
            <p className="mt-2 text-sm text-ink-soft">{card.hint}</p>
          </article>
        ))}
      </div>

      <section className="mt-10 rounded-3xl border border-line bg-card p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Top 5 les plus remplis</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Places actives (confirmées + en attente)
            </p>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-ember hover:underline"
          >
            Voir les événements
          </Link>
        </div>
        <ul className="mt-6 space-y-4">
          {stats.topEvents.map((event, index) => (
            <li key={event.id}>
              <Link to={`/events/${event.id}`} className="block">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <p className="font-medium">
                    <span className="mr-2 text-ink-soft">{index + 1}.</span>
                    {event.title}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {event.filled}/{event.maxParticipants}
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-paper">
                  <div
                    className="h-full rounded-full bg-ember"
                    style={{
                      width: `${Math.min(100, event.occupancy * 100)}%`,
                    }}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageMotion>
  );
}
