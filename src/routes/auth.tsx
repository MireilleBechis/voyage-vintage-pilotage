import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Connexion — Voyage Vintage" },
      { name: "description", content: "Accès privé au pilotage du stock Voyage Vintage." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue.");
        navigate({ to: "/aujourdhui" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Compte créé.");
        navigate({ to: "/aujourdhui" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center container-app py-12">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brass">Voyage Vintage</p>
        <h1 className="font-serif text-4xl text-primary mt-2">Pilotage du stock</h1>
        <p className="text-sm text-muted-foreground mt-2 italic">Accès privé.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 bg-card border rounded-xl p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Mot de passe</label>
          <input
            type="password" required minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full rounded-md bg-primary text-primary-foreground py-3 font-medium disabled:opacity-60"
        >
          {loading ? "…" : mode === "signin" ? "Se connecter" : "Créer mon compte"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-sm text-muted-foreground underline underline-offset-4"
        >
          {mode === "signin" ? "Créer un compte" : "J'ai déjà un compte"}
        </button>
      </form>
    </div>
  );
}
