import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { PLANS, useStore } from "../services/store";
import { Check, Star } from "lucide-react";

const TABS = ["All", "Monthly", "Channels", "Add-on"] as const;

export function PlansPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const navigate = useNavigate();
  const allPlans = useStore((s) => (s.plans.length ? s.plans : PLANS));
  const list = allPlans.filter((p) => tab === "All" || p.category === tab);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Choose a plan</h1>
        <p className="text-sm text-muted-foreground">
          Transparent pricing. Operator-approved recharge in minutes.
        </p>
      </div>

      <div className="mb-6 inline-flex max-w-full overflow-x-auto no-scrollbar rounded-2xl border border-white/10 bg-white/5 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex shrink-0 rounded-xl px-4 py-2 text-sm transition whitespace-nowrap ${tab === t ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <div
            key={p.id}
            className={`card-3d relative flex flex-col rounded-3xl p-6 ${p.popular ? "neon-border" : ""}`}
          >
            {p.popular && (
              <div className="absolute -top-3 left-6 flex items-center gap-1 rounded-full gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-glow)]">
                <Star className="h-3 w-3" /> Most popular
              </div>
            )}
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {p.category}
            </div>
            <div className="mt-1 font-sans text-xl font-semibold">{p.name}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gradient">₹{p.price}</span>
              <span className="text-sm text-muted-foreground">/ {p.validityDays} days</span>
            </div>
            {p.channels && (
              <div className="mt-1 text-xs text-muted-foreground">
                {p.channels} channels included
              </div>
            )}
            <ul className="mt-4 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-[color:var(--neon-cyan)]" />{" "}
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate({ to: "/recharge/checkout", search: { plan: p.id } })}
              className="mt-6 rounded-2xl gradient-primary py-3 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
            >
              Recharge Now
            </button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export default PlansPage;
