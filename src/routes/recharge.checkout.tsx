import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { PLANS, startPayment, useStore, setState } from "@/lib/store";
import { CreditCard, ShieldCheck, Tv, Tag, ArrowRight } from "lucide-react";

const searchSchema = z.object({ plan: z.string().optional() });

export const Route = createFileRoute("/recharge/checkout")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Checkout — STB RECHARGE" },
      { name: "description", content: "Complete your Set Top Box recharge." },
    ],
  }),
  component: Checkout,
});

const COUPONS: Record<string, number> = { STB50: 50, NEW10: 10, WELCOME: 25 };

function Checkout() {
  const { plan: planId } = Route.useSearch();
  const allPlans = useStore((s) => (s.plans.length ? s.plans : PLANS));
  const plan = useMemo(
    () => allPlans.find((p) => p.id === planId) ?? allPlans[1] ?? allPlans[0],
    [allPlans, planId],
  );
  const stb = useStore((s) => s.stb);
  const appliedCoupon = useStore((s) => s.appliedCoupon);
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(appliedCoupon ?? "");
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [processing, setProcessing] = useState(false);

  const discount = appliedCoupon ? (COUPONS[appliedCoupon] ?? 0) : 0;
  const total = Math.max(0, plan.price - discount);

  function apply() {
    const code = coupon.trim().toUpperCase();
    if (COUPONS[code]) setState({ appliedCoupon: code });
    else setState({ appliedCoupon: null });
  }

  function pay() {
    setProcessing(true);
    setTimeout(() => {
      startPayment(plan.id, total, plan.name);
      navigate({ to: "/recharge/pending" });
    }, 1200);
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Checkout</h1>
        <p className="text-sm text-muted-foreground">Secure payment · operator-approved recharge</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* STB summary */}
          <div className="card-3d rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
                  <Tv className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    Recharge for
                  </div>
                  <div className="font-semibold">
                    {stb?.customerName ?? "Guest"} · STB {stb?.id ?? "—"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="text-sm text-[color:var(--neon-cyan)]"
              >
                Change
              </button>
            </div>
          </div>

          {/* Payment methods */}
          <div className="card-3d rounded-3xl p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="h-4 w-4" /> Payment method
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(["upi", "card", "netbanking"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`rounded-2xl border p-4 text-left text-sm transition ${method === m ? "border-primary/60 bg-primary/10 shadow-[var(--shadow-glow)]" : "border-white/10 bg-white/5 hover:border-white/20"}`}
                >
                  <div className="font-semibold uppercase">
                    {m === "upi" ? "UPI" : m === "card" ? "Card" : "Net Banking"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m === "upi"
                      ? "GPay, PhonePe, Paytm"
                      : m === "card"
                        ? "Credit / Debit Card"
                        : "All major banks"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Coupon */}
          <div className="card-3d rounded-3xl p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4" /> Apply coupon
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Try STB50, NEW10, WELCOME"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary/60"
              />
              <button
                onClick={apply}
                className="rounded-xl gradient-cyan px-4 text-sm font-semibold text-primary-foreground"
              >
                Apply
              </button>
            </div>
            {appliedCoupon && discount > 0 && (
              <p className="mt-2 text-sm text-[color:var(--success)]">
                Coupon <b>{appliedCoupon}</b> applied — ₹{discount} off
              </p>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="card-3d h-fit rounded-3xl p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Order summary
          </div>
          <div className="mt-1 font-display text-lg font-semibold">{plan.name}</div>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Plan price" value={`₹${plan.price}`} />
            <Row label="Validity" value={`${plan.validityDays} days`} />
            {discount > 0 && (
              <Row label={`Coupon (${appliedCoupon})`} value={`− ₹${discount}`} accent />
            )}
            <div className="my-3 border-t border-white/10" />
            <Row label="Total payable" value={`₹${total}`} big />
          </div>
          <button
            onClick={pay}
            disabled={processing}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02] disabled:opacity-60"
          >
            {processing ? (
              "Processing payment…"
            ) : (
              <>
                Pay ₹{total} <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> 100% secure · Payment protected
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({
  label,
  value,
  accent,
  big,
}: {
  label: string;
  value: string;
  accent?: boolean;
  big?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`${big ? "text-xl font-bold text-gradient" : "font-medium"} ${accent ? "text-[color:var(--success)]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
