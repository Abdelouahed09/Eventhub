import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Ticket,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";

const links = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/events", label: "Événements", icon: CalendarDays },
  { to: "/participants", label: "Participants", icon: Users },
  { to: "/register", label: "Inscription", icon: Ticket },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-svh bg-paper">
      {open ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-svh w-[280px] flex-col overflow-hidden border-r border-line bg-[#1b1612] p-6 text-[#f6efe4] transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-3xl tracking-tight">EventHub</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/50">
              Studio événements
            </p>
          </div>
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-10 flex-1 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-ember text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-sm font-semibold">{user?.fullName}</p>
          <p className="text-xs capitalize text-white/50">{user?.role}</p>
          <button
            type="button"
            className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-white/70 hover:text-white"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="min-h-svh lg:pl-[280px]">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/90 px-5 py-4 backdrop-blur lg:hidden">
          <p className="font-display text-xl">EventHub</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu />
          </button>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
