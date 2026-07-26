import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { fetchStb, useStore, PLANS } from "@/lib/store";
import { Tv, Search, QrCode, Zap, Gift, MessageCircle, CreditCard, ChevronRight, Sparkles, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — STB RECHARGE" },
      { name: "description", content: "View your STB status, quick recharge and personalized plan recommendations." },
      { property: "og:title", content: "STB RECHARGE — Dashboard" },
      { property: "og:description", content: "Live STB status and quick recharge." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const user = useStore((s) => s.user);
  const stb = useStore((s) => s.stb);
  const autoRecharge = useStore((s) => s.autoRecharge);
  const pending = useStore((s) => s.pending);
  const [stbId, setStbId] = useState(stb?.id ?? "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user, navigate]);

  useEffect(() => {
    if (pending) navigate({ to: "/recharge/pending" });
  }, [pending, navigate]);

  async function handleFetch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!stbId.trim()) return;
    setLoading(true);
    await fetchStb(stbId);
    setLoading(false);
  }

  const recommended = PLANS.filter((p) => p.popular || p.category === "Monthly").slice(0, 3);
  const daysLeft = stb ? Math.ceil((new Date(stb.expiry).getTime() - Date.now()) / 86400000) : 0;

  return (
    <AppShell>
      {/* Hero greeting */}
      <section className="rounded-3xl glass-strong p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Welcome back</p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
              Hi <span className="text-gradient">+91 {user?.mobile}</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your STB ID to view live status and recharge.</p>
          </div>
          <form onSubmit={handleFetch} className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 md:w-auto">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <input
              value={stbId}
              onChange={(e) => setStbId(e.target.value)}
              placeholder="Enter STB ID (try 1234567890)"
              className="w-full min-w-56 bg-transparent px-2 py-2 text-sm outline-none"
            />
            <button className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5" type="button" aria-label="Scan QR">
              <QrCode className="h-4 w-4" />
            </button>
            <button type="submit" disabled={loading} className="rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
              {loading ? "Fetching…" : "Fetch"}
            </button>
          </form>
        </div>

        {/* STB card */}
        {stb ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="card-3d relative overflow-hidden rounded-2xl p-5 md:col-span-2">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <Tv className="h-3.5 w-3.5" /> Set Top Box
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold">{stb.customerName}</div>
                  <div className="text-sm text-muted-foreground">STB ID · {stb.id}</div>
                </div>
                <StatusDot active={stb.active} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Meta label="Current Plan" value={stb.currentPlan} />
                <Meta label="Expiry" value={new Date(stb.expiry).toLocaleDateString()} />
                <Meta label="Days Left" value={`${daysLeft}`} accent={daysLeft <= 3 ? "warn" : "ok"} />
              </div>
              {daysLeft <= 3 && daysLeft >= 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 px-3 py-2 text-sm">
                  <Clock className="h-4 w-4 text-[color:var(--warning)]" />
                  Your plan expires in {daysLeft} day{daysLeft === 1 ? "" : "s"} — recharge now to avoid interruption.
                </div>
              )}
            </div>
            <div className="card-3d rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Auto Recharge</div>
                  <div className="font-display text-lg font-semibold">Never miss expiry</div>
                </div>
                <AutoRechargeToggle />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {autoRecharge.enabled ? "Enabled — we'll renew your plan 1 day before expiry." : "Turn on to auto-renew your active plan."}
              </p>
              <Link to="/plans" className="mt-4 inline-flex items-center gap-1 text-sm text-[color:var(--neon-cyan)]">
                Manage plan <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-muted-foreground">
            Enter your STB ID above to see live status. Try <span className="text-foreground">1234567890</span> (active) or <span className="text-foreground">9999999999</span> (inactive).
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction to="/plans" icon={CreditCard} label="Recharge" />
        <QuickAction to="/plans" icon={Zap} label="View Plans" />
        <QuickAction to="/offers" icon={Gift} label="Offers" />
        <QuickAction to="/history" icon={MessageCircle} label="History" />
      </section>

      {/* AI recommended */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[color:var(--neon-purple)]" />
          <h2 className="font-display text-lg font-semibold">Recommended for you</h2>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">AI picked</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((p) => (
            <PlanMini key={p.id} plan={p} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${active ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-[color:var(--success)] pulse-success" : "bg-destructive pulse-danger"}`} />
      {active ? "Active" : "Inactive"}
    </div>
  );
}
function Meta({ label, value, accent }: { label: string; value: string; accent?: "ok" | "warn" }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-medium ${accent === "warn" ? "text-[color:var(--warning)]" : ""}`}>{value}</div>
    </div>
  );
}
function AutoRechargeToggle() {
  const enabled = useStore((s) => s.autoRecharge.enabled);
  return (
    <button
      onClick={() => import("@/lib/store").then(({ setState, getState }) => setState({ autoRecharge: { ...getState().autoRecharge, enabled: !enabled } }))}
      className={`relative h-7 w-12 rounded-full transition ${enabled ? "gradient-primary shadow-[var(--shadow-glow)]" : "bg-white/10"}`}
      aria-pressed={enabled}
    >
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${enabled ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}
function QuickAction({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link to={to} className="card-3d group flex flex-col items-start gap-3 rounded-2xl p-4 transition hover:card-3d-hover">
      <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-medium">{label}</div>
    </Link>
  );
}
function PlanMini({ plan }: { plan: (typeof PLANS)[number] }) {
  const navigate = useNavigate();
  return (
    <div className="card-3d flex flex-col rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{plan.category}</div>
          <div className="mt-1 font-display text-lg font-semibold">{plan.name}</div>
        </div>
        {plan.popular && <span className="rounded-full gradient-cyan px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">POPULAR</span>}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gradient">₹{plan.price}</span>
        <span className="text-xs text-muted-foreground">/ {plan.validityDays}d</span>
      </div>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        {plan.features.slice(0, 2).map((f) => <li key={f}>• {f}</li>)}
      </ul>
      <button
        onClick={() => navigate({ to: "/recharge/checkout", search: { plan: plan.id } })}
        className="mt-4 rounded-xl gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
      >
        Recharge Now
      </button>
    </div>
  );
}
