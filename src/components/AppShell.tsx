import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Package, Kanban, Coins, MoreHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/hooks/useRole";

const NAV = [
  { to: "/aujourdhui", label: "Aujourd'hui", icon: Home },
  { to: "/stock", label: "Stock", icon: Package },
  { to: "/kanban", label: "Kanban", icon: Kanban },
  { to: "/finances", label: "Finances", icon: Coins },
] as const;

const MORE = [
  { to: "/taches", label: "Tâches" },
  { to: "/debloquer", label: "À débloquer" },
  { to: "/ventes", label: "Ventes" },
  { to: "/qualite", label: "Qualité des données" },
  { to: "/historique", label: "Historique" },
  { to: "/corbeille", label: "Corbeille" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const [openMore, setOpenMore] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20">
      <main className="flex-1">{children}</main>

      {openMore && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenMore(false)}>
          <div
            className="absolute bottom-16 left-0 right-0 bg-card border-t rounded-t-2xl p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-md space-y-1">
              {MORE.map((it) => (
                <Link
                  key={it.to} to={it.to}
                  onClick={() => setOpenMore(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-secondary text-base"
                >
                  {it.label}
                </Link>
              ))}
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-3 rounded-lg text-destructive hover:bg-secondary"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-30 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-md grid grid-cols-5">
          {NAV.map((it) => {
            const active = loc.pathname.startsWith(it.to);
            return (
              <Link
                key={it.to} to={it.to}
                className={`flex flex-col items-center justify-center py-2.5 text-[10px] ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <it.icon className="w-5 h-5 mb-1" strokeWidth={active ? 2.2 : 1.6} />
                {it.label}
              </Link>
            );
          })}
          <button
            onClick={() => setOpenMore(true)}
            className="flex flex-col items-center justify-center py-2.5 text-[10px] text-muted-foreground"
          >
            <MoreHorizontal className="w-5 h-5 mb-1" />
            Plus
          </button>
        </div>
      </nav>
    </div>
  );
}
