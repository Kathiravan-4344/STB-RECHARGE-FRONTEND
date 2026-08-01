import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "../components/AppShell";
import { fetchStb, useStore, PLANS, formatName, setState, getState } from "../services/store";
import {
  Tv,
  Zap,
  Gift,
  MessageCircle,
  CreditCard,
  ChevronRight,
  Sparkles,
  Clock,
  Package,
  ShoppingBag,
  ArrowRight,
  Wrench,
  PhoneCall,
  Headphones,
} from "lucide-react";

export function DashboardPage() {
  const user = useStore((s) => s.user);
  const stb = useStore((s) => s.stb);
  const autoRecharge = useStore((s) => s.autoRecharge);
  const pending = useStore((s) => s.pending);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user, navigate]);

  useEffect(() => {
    if (pending) navigate({ to: "/recharge/pending" });
  }, [pending, navigate]);

  useEffect(() => {
    if (!stb) {
      fetchStb(user?.stbId || "1234567890");
    }
  }, [stb, user]);

  const allPlans = useStore((s) => (s.plans.length ? s.plans : PLANS));
  const recommended = allPlans.filter((p) => p.popular || p.category === "Monthly").slice(0, 3);
  const daysLeft = stb ? Math.ceil((new Date(stb.expiry).getTime() - Date.now()) / 86400000) : 0;

  return (
    <AppShell>
      {/* Hero greeting */}
      <section className="rounded-3xl glass-strong p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Welcome back
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Hi{" "}
              <span className="font-normal text-foreground/90">
                {formatName(user?.name || "there")}
              </span>
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-base">
              Live Set Top Box Status & Active Subscriptions
            </p>
          </div>
          <Link
            to="/plans"
            className="group flex items-center justify-center gap-3 rounded-2xl gradient-primary px-6 py-3.5 font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:scale-[1.03] active:scale-95 md:w-auto"
          >
            <Zap className="h-5 w-5 fill-current text-primary-foreground animate-pulse" />
            <span className="text-base font-extrabold tracking-wide uppercase">Recharge Now</span>
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
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
                <Meta
                  label="Days Left"
                  value={`${daysLeft}`}
                  accent={daysLeft <= 3 ? "warn" : "ok"}
                />
              </div>
              {daysLeft <= 3 && daysLeft >= 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 px-3 py-2 text-sm">
                  <Clock className="h-4 w-4 text-[color:var(--warning)]" />
                  Your plan expires in {daysLeft} day{daysLeft === 1 ? "" : "s"} — recharge now to
                  avoid interruption.
                </div>
              )}
            </div>
            <div className="card-3d rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    Auto Recharge
                  </div>
                  <div className="font-display text-lg font-semibold">Never miss expiry</div>
                </div>
                <AutoRechargeToggle />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {autoRecharge.enabled
                  ? "Enabled — we'll renew your plan 1 day before expiry."
                  : "Turn on to auto-renew your active plan."}
              </p>
              <Link
                to="/plans"
                className="mt-4 inline-flex items-center gap-1 text-sm text-[color:var(--neon-cyan)]"
              >
                Manage plan <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-primary/40 bg-primary/10 p-6 text-center text-base font-black text-foreground shadow-sm">
            ⚡ ENTER YOUR STB ID ABOVE TO SEE LIVE STATUS
          </div>
        )}
      </section>

      {/* 3D Product & Accessories Request Card */}
      <section className="mt-6">
        <div className="card-3d group relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-900/60 p-6 md:p-8 backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:border-[color:var(--neon-cyan)]/50 hover:shadow-[0_0_30px_rgba(0,210,255,0.2)]">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[color:var(--neon-cyan)]/20 blur-3xl transition-transform duration-500 group-hover:scale-125" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[color:var(--neon-purple)]/20 blur-3xl transition-transform duration-500 group-hover:scale-125" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--neon-cyan)]/30 bg-[color:var(--neon-cyan)]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[color:var(--neon-cyan)]">
                <ShoppingBag className="h-3.5 w-3.5" /> 🛒 Request Products
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                “Need STB Accessories?”
              </h2>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                Customer can request STB-related products and services such as HDMI cables,
                replacement remotes, adapters, dish cabling, or book professional technician
                installation.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white">
                  HDMI Cable
                </span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white">
                  Remote Control
                </span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white">
                  STB Adapter
                </span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white">
                  🔧 Installation Services
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-2xl gradient-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                <Package className="h-4 w-4" /> Request Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Complaint Card & Emergency Support Section */}
      <section className="mt-6 grid gap-6 md:grid-cols-12">
        {/* 3D Complaint Card (7 cols) */}
        <div className="md:col-span-7 card-3d group relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-amber-950/30 p-6 backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl transition-transform duration-500 group-hover:scale-125" />
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-amber-400">
                <Wrench className="h-3.5 w-3.5" /> 🛠️ Complaint & Service Request
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                “Facing TV, STB or Signal Issues?”
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Raise complaints for TV signal loss, STB power failures, cable cuts, or recharge
                activation issues with live 📍 Technician Tracking & resolution status.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white">
                📺 No Signal
              </span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white">
                📡 STB Error
              </span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white">
                🔌 Cable Cut
              </span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white">
                💳 Recharge Issues
              </span>
            </div>

            <div className="pt-2">
              <Link
                to="/complaints"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-extrabold text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] transition hover:bg-amber-400 active:scale-95"
              >
                <Wrench className="h-4 w-4" /> Raise Service Complaint{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 📞 Emergency Support Card (5 cols) */}
        <div className="md:col-span-5 card-3d relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-900/80 p-6 backdrop-blur-2xl shadow-2xl flex flex-col justify-between space-y-4">
          <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              <PhoneCall className="h-3.5 w-3.5" /> 📞 Emergency Support
            </div>
            <h3 className="mt-3 font-display text-xl font-bold text-white">
              Quick Operator Contact
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              Instant one-click phone line and WhatsApp chat support for urgent TV transmission
              breakdowns.
            </p>
          </div>

          <div className="space-y-2.5">
            <a
              href="tel:9876543210"
              className="w-full flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              <span className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-emerald-400" /> Call Local Operator
              </span>
              <span className="font-mono text-white">+91 98765 43210</span>
            </a>

            <a
              href="https://wa.me/919876543210?text=Hello%20STB%20Support,%20I%20need%20urgent%20service%20assistance..."
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" /> WhatsApp Support Chat
              </span>
              <span className="font-mono text-emerald-400 font-extrabold">Online 💬</span>
            </a>

            <a
              href="tel:18001234567"
              className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 transition"
            >
              <span className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-muted-foreground" /> Customer Care Toll-Free
              </span>
              <span className="font-mono text-white">1800-123-4567</span>
            </a>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <QuickAction to="/plans" icon={CreditCard} label="Recharge" />
        <QuickAction to="/plans" icon={Zap} label="View Plans" />
        <QuickAction to="/products" icon={Package} label="Accessories" />
        <QuickAction to="/offers" icon={Gift} label="Offers" />
        <QuickAction to="/history" icon={MessageCircle} label="History" />
      </section>

      {/* AI recommended */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[color:var(--neon-purple)]" />
          <h2 className="font-display text-lg font-semibold">Recommended for you</h2>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            AI picked
          </span>
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
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${active ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]" : "border-destructive/40 bg-destructive/10 text-destructive"}`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${active ? "bg-[color:var(--success)] pulse-success" : "bg-destructive pulse-danger"}`}
      />
      {active ? "Active" : "Inactive"}
    </div>
  );
}

function Meta({ label, value, accent }: { label: string; value: string; accent?: "ok" | "warn" }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div
        className={`mt-0.5 font-medium ${accent === "warn" ? "text-[color:var(--warning)]" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function AutoRechargeToggle() {
  const enabled = useStore((s) => s.autoRecharge.enabled);
  return (
    <button
      onClick={() =>
        setState({ autoRecharge: { ...getState().autoRecharge, enabled: !enabled } })
      }
      className={`relative h-7 w-12 rounded-full transition ${enabled ? "gradient-primary shadow-[var(--shadow-glow)]" : "bg-white/10"}`}
      aria-pressed={enabled}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${enabled ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="card-3d group flex flex-col items-start gap-3 rounded-2xl p-4 transition hover:card-3d-hover"
    >
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
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {plan.category}
          </div>
          <div className="mt-1 font-display text-lg font-semibold">{plan.name}</div>
        </div>
        {plan.popular && (
          <span className="rounded-full gradient-cyan px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            POPULAR
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gradient">₹{plan.price}</span>
        <span className="text-xs text-muted-foreground">/ {plan.validityDays}d</span>
      </div>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        {plan.features.slice(0, 2).map((f) => (
          <li key={f}>• {f}</li>
        ))}
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

export default DashboardPage;
