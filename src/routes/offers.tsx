import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Gift, Copy, Sparkles, Percent } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [{ title: "Offers & Cashback — STB RECHARGE" }, { name: "description", content: "Exclusive coupons, cashback and promo codes for your recharge." }] }),
  component: Offers,
});

const OFFERS = [
  { code: "STB50", title: "Flat ₹50 off", desc: "On any plan above ₹199", tag: "Best", grad: "gradient-primary" },
  { code: "NEW10", title: "₹10 welcome bonus", desc: "For your first recharge", tag: "New user", grad: "gradient-cyan" },
  { code: "WELCOME", title: "Flat ₹25 off", desc: "On any Monthly pack", tag: "Trending", grad: "gradient-primary" },
];

function Offers() {
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Offers & cashback</h1>
          <p className="text-sm text-muted-foreground">Save more on every recharge.</p>
        </div>
        <Sparkles className="h-6 w-6 text-[color:var(--neon-purple)]" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {OFFERS.map((o) => (
          <div key={o.code} className="card-3d relative overflow-hidden rounded-3xl p-6">
            <div className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-40 blur-3xl ${o.grad}`} />
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Gift className="h-3.5 w-3.5" /> {o.tag}
            </div>
            <div className="mt-2 font-display text-2xl font-bold">{o.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{o.desc}</p>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2 font-mono font-semibold">
                <Percent className="h-4 w-4 text-[color:var(--neon-cyan)]" /> {o.code}
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(o.code); setCopied(o.code); setTimeout(() => setCopied(null), 1500); }}
                className="inline-flex items-center gap-1 rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                <Copy className="h-3.5 w-3.5" /> {copied === o.code ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
