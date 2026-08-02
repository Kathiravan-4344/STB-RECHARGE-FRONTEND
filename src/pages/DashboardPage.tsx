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
      {/* Top Header Card */}
      <section className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Welcome Back
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
              Hi, {formatName(user?.name || "Customer")} 👋
            </h1>
            <p className="text-sm font-semibold text-[#2563EB] mt-1">
              STB ID: <span className="font-mono">{user?.stbId || stb?.id || "123456789012"}</span>
            </p>
          </div>
          <Link
            to="/plans"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-6 py-3.5 font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
          >
            <Zap className="h-5 w-5 fill-current" />
            <span>Recharge Now</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* STB Status Card */}
        {stb ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] p-5 md:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[#64748B]">
                    <Tv className="h-4 w-4 text-[#2563EB]" /> Set Top Box Status
                  </div>
                  <div className="mt-1 text-lg font-bold text-[#0F172A]">{stb.customerName}</div>
                  <div className="text-xs font-mono text-[#64748B]">STB ID: {stb.id}</div>
                </div>
                <StatusDot active={stb.active} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Meta label="Current Plan" value={stb.currentPlan} />
                <Meta label="Expiry Date" value={new Date(stb.expiry).toLocaleDateString()} />
                <Meta
                  label="Days Left"
                  value={`${daysLeft} Days`}
                  accent={daysLeft <= 3 ? "warn" : "ok"}
                />
              </div>
              {daysLeft <= 3 && daysLeft >= 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs font-bold text-amber-800">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  Plan expires in {daysLeft} day{daysLeft === 1 ? "" : "s"} — recharge now to avoid disconnection.
                </div>
              )}
            </div>

            <div className="bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] p-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase text-[#64748B]">
                    Auto Recharge
                  </div>
                  <div className="text-base font-bold text-[#0F172A] mt-1">Never Miss Expiry</div>
                </div>
                <AutoRechargeToggle />
              </div>
              <p className="mt-2 text-xs text-[#64748B]">
                {autoRecharge.enabled
                  ? "Enabled — plan auto-renews 1 day prior to expiry."
                  : "Turn on to automatically renew your active STB subscription."}
              </p>
              <Link
                to="/plans"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline"
              >
                Manage Plans <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      {/* Grid Cards (2x2 Mobile / 4 Columns Desktop) */}
      <section className="mt-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
          Quick Services
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link
            to="/plans"
            className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-sm hover:border-[#2563EB] hover:shadow-md transition group"
          >
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xl group-hover:bg-[#2563EB] group-hover:text-white transition">
              📺
            </div>
            <div className="mt-3 font-bold text-base text-[#0F172A]">Plans</div>
            <p className="text-xs text-[#64748B] mt-0.5">Explore & pick STB packages</p>
          </Link>

          <Link
            to="/plans"
            className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-sm hover:border-[#2563EB] hover:shadow-md transition group"
          >
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xl group-hover:bg-[#2563EB] group-hover:text-white transition">
              💳
            </div>
            <div className="mt-3 font-bold text-base text-[#0F172A]">Recharge</div>
            <p className="text-xs text-[#64748B] mt-0.5">Instant online payment</p>
          </Link>

          <Link
            to="/products"
            className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-sm hover:border-[#2563EB] hover:shadow-md transition group"
          >
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xl group-hover:bg-[#2563EB] group-hover:text-white transition">
              📦
            </div>
            <div className="mt-3 font-bold text-base text-[#0F172A]">Products</div>
            <p className="text-xs text-[#64748B] mt-0.5">Remotes, cables & adapters</p>
          </Link>

          <Link
            to="/complaints"
            className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-sm hover:border-[#2563EB] hover:shadow-md transition group"
          >
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xl group-hover:bg-[#2563EB] group-hover:text-white transition">
              🛠
            </div>
            <div className="mt-3 font-bold text-base text-[#0F172A]">Complaints</div>
            <p className="text-xs text-[#64748B] mt-0.5">Signal & hardware support</p>
          </Link>
        </div>
      </section>

      {/* Emergency Contact & Customer Support Card */}
      <section className="mt-6 bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PhoneCall className="h-5 w-5 text-[#2563EB]" />
          <h3 className="font-bold text-base text-[#0F172A]">Operator & Helpline Support</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <a
            href="tel:9876543210"
            className="flex items-center justify-between rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] p-3 text-xs font-bold text-[#0F172A] hover:border-[#2563EB] transition"
          >
            <span>Call Operator</span>
            <span className="font-mono text-[#2563EB]">+91 98765 43210</span>
          </a>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] p-3 text-xs font-bold text-[#0F172A] hover:border-[#22C55E] transition"
          >
            <span>WhatsApp Support</span>
            <span className="text-[#22C55E] font-bold">Online 💬</span>
          </a>
          <a
            href="tel:18001234567"
            className="flex items-center justify-between rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] p-3 text-xs font-bold text-[#0F172A] hover:border-[#2563EB] transition"
          >
            <span>Customer Care</span>
            <span className="font-mono text-[#64748B]">1800-123-4567</span>
          </a>
        </div>
      </section>

      {/* Recommended Plans */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2563EB]" /> Recommended Plans
          </h2>
          <Link to="/plans" className="text-xs font-bold text-[#2563EB] hover:underline">
            View All Plans →
          </Link>
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
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        active ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-red-100 text-red-800 border border-red-300"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${active ? "bg-[#22C55E]" : "bg-red-600"}`} />
      {active ? "Active" : "Inactive"}
    </div>
  );
}

function Meta({ label, value, accent }: { label: string; value: string; accent?: "ok" | "warn" }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase text-[#64748B]">{label}</div>
      <div
        className={`mt-0.5 text-sm font-bold ${
          accent === "warn" ? "text-amber-600" : "text-[#0F172A]"
        }`}
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
      className={`relative h-6 w-11 rounded-full transition ${enabled ? "bg-[#2563EB]" : "bg-[#CBD5E1]"}`}
      aria-pressed={enabled}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${enabled ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}

function PlanMini({ plan }: { plan: (typeof PLANS)[number] }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <span className="text-xs font-bold uppercase text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
            {plan.category}
          </span>
          {plan.popular && (
            <span className="rounded-full bg-blue-100 text-[#2563EB] px-2.5 py-0.5 text-[10px] font-bold border border-blue-200 uppercase">
              POPULAR
            </span>
          )}
        </div>
        <div className="mt-2 font-bold text-lg text-[#0F172A]">{plan.name}</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-[#2563EB]">₹{plan.price}</span>
          <span className="text-xs text-[#64748B] font-semibold">/ {plan.validityDays} days</span>
        </div>
        <ul className="mt-3 space-y-1 text-xs text-[#64748B]">
          {plan.features.slice(0, 2).map((f) => (
            <li key={f} className="flex items-center gap-1.5">
              <span className="text-[#2563EB] font-bold">•</span> {f}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => navigate({ to: "/recharge/checkout", search: { plan: plan.id } })}
        className="mt-4 w-full rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] py-2.5 text-sm font-bold text-white shadow-sm transition"
      >
        Select Plan
      </button>
    </div>
  );
}

export default DashboardPage;
