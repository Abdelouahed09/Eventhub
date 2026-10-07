import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { getErrorMessage } from "../utils/error";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("admin@eventhub.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: string } | null)?.from || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative hidden overflow-hidden bg-[#1b1612] p-12 text-[#f6efe4] lg:flex lg:flex-col lg:justify-between"
      >
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-ember/40 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-sage/30 blur-3xl" />
        <p className="font-display text-4xl">EventHub</p>
        <div className="relative max-w-md">
          <p className="font-display text-5xl leading-tight">
            Orchestrer des événements, simplement.
          </p>
          <p className="mt-5 text-white/70">
            Publiez, inscrivez, suivez le remplissage — un espace unique pour
            l’équipe admin et staff.
          </p>
        </div>
        <p className="text-sm text-white/40">PERN · JWT · PostgreSQL</p>
      </motion.section>

      <section className="grid place-items-center px-6 py-12">
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-[2rem] border border-line bg-card p-8 shadow-sm"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-ink-soft">
            Connexion
          </p>
          <h1 className="mt-2 font-display text-4xl">Bon retour</h1>
          <p className="mt-2 text-ink-soft">
            Utilisez un compte admin ou staff pour continuer.
          </p>

          <label className="mt-8 block text-sm font-medium">
            Email
            <input
              className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none ring-ember/30 focus:ring-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Mot de passe
            <input
              className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none ring-ember/30 focus:ring-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

          <Button className="mt-6 w-full" disabled={submitting}>
            {submitting ? "Connexion…" : "Entrer"}
          </Button>

          <div className="mt-6 rounded-2xl bg-paper p-4 text-sm text-ink-soft">
            <p className="font-semibold text-ink">Comptes de démo</p>
            <p className="mt-1">admin@eventhub.local / admin123</p>
            <p>staff@eventhub.local / staff123</p>
          </div>
        </motion.form>
      </section>
    </div>
  );
}
