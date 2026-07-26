import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, CreditCard, Gift, Receipt, LogOut, Tv, MessageCircle } from "lucide-react";
import { useStore, logout } from "@/lib/store";
import { useState, type ReactNode } from "react";
import { ChatWidget } from "./ChatWidget";

const nav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/plans", label: "Plans", icon: CreditCard },
  { to: "/offers", label: "Offers", icon: Gift },
  { to: "/history", label: "History", icon: Receipt },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useStore((s) => s.user);
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass-strong border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary shadow-[var(--shadow-glow)]">
              <Tv className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-bold tracking-tight">STB RECHARGE</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Smart Recharge · Operator Control</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => {
              const active = pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`rounded-lg px-3 py-2 text-sm transition-all ${active ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            {user && (
              <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground sm:inline">
                +91 {user.mobile}
              </span>
            )}
            <button
              onClick={() => { logout(); navigate({ to: "/" }); }}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition hover:text-foreground hover:bg-white/10"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-10">{children}</main>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 md:hidden">
        <div className="glass-strong flex items-center gap-1 rounded-2xl border border-white/10 px-2 py-2">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex min-w-16 flex-col items-center rounded-xl px-3 py-1.5 text-[10px] transition ${active ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground"}`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Chat FAB */}
      <button
        onClick={() => setChatOpen((v) => !v)}
        className="fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full gradient-primary text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-105 md:bottom-6"
        aria-label="Live support"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
