import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home,
  CreditCard,
  Gift,
  Receipt,
  LogOut,
  Tv,
  MessageCircle,
  Shield,
  Package,
  Wrench,
} from "lucide-react";
import { useStore, logout } from "@/lib/store";
import { useState, type ReactNode } from "react";
import { ChatWidget } from "./ChatWidget";

const nav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/plans", label: "Plans", icon: CreditCard },
  { to: "/products", label: "Accessories", icon: Package },
  { to: "/complaints", label: "Complaints", icon: Wrench },
  { to: "/offers", label: "Offers", icon: Gift },
  { to: "/history", label: "History", icon: Receipt },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useStore((s) => s.user);
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  const isAdminRoute = pathname.startsWith("/admin") || user?.role === "admin";

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white font-bold shadow-sm">
              <Tv className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-bold tracking-tight flex items-center gap-2 text-slate-100">
                STB RECHARGE
                {isAdminRoute && (
                  <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                    ADMIN PORTAL
                  </span>
                )}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">
                {isAdminRoute
                  ? "Master Control • KATHIRAVAN V"
                  : "Smart Recharge · Operator Control"}
              </div>
            </div>
          </div>

          {!isAdminRoute ? (
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((n) => {
                const active = pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      active
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
              {user?.role === "operator" && (
                <Link
                  to="/operator"
                  className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-600 hover:text-white"
                >
                  <Shield className="h-3.5 w-3.5" /> Operator Panel
                </Link>
              )}
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                👑 Super Admin: KATHIRAVAN V (9080864542)
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {user && !isAdminRoute && (
              <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground sm:inline flex items-center gap-1.5">
                {user.role === "operator" && (
                  <Shield className="h-3 w-3 text-[color:var(--neon-cyan)]" />
                )}
                +91 {user.mobile}
              </span>
            )}
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition hover:bg-red-500/20"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-10">{children}</main>

      {/* Bottom nav mobile (For Customers & Operators) */}
      {!isAdminRoute && (
        <nav className="fixed bottom-3 left-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 md:hidden">
          <div className="glass-strong flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/10 px-2 py-2 shadow-2xl backdrop-blur-xl no-scrollbar">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex shrink-0 flex-col items-center rounded-xl px-2.5 py-1.5 text-[10px] font-semibold transition-all ${
                    active
                      ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)] font-bold"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{n.label}</span>
                </Link>
              );
            })}
            {user?.role === "operator" && (
              <Link
                to="/operator"
                className={`flex shrink-0 flex-col items-center rounded-xl px-2.5 py-1.5 text-[10px] font-bold transition-all ${
                  pathname.startsWith("/operator")
                    ? "bg-[color:var(--neon-cyan)] text-black shadow-[0_0_12px_rgba(0,210,255,0.5)]"
                    : "text-[color:var(--neon-cyan)] border border-[color:var(--neon-cyan)]/30 bg-[color:var(--neon-cyan)]/10"
                }`}
              >
                <Shield className="h-4 w-4" />
                <span className="whitespace-nowrap">Operator</span>
              </Link>
            )}
          </div>
        </nav>
      )}

      {/* Chat FAB (Only for Customers / Operators) */}
      {!isAdminRoute && (
        <>
          <button
            onClick={() => setChatOpen((v) => !v)}
            className="fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full gradient-primary text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-105 md:bottom-6"
            aria-label="Live support"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
          <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
        </>
      )}
    </div>
  );
}
