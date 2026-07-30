import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Gift } from "lucide-react";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Cashback — STB RECHARGE" },
      {
        name: "description",
        content: "Exclusive coupons, cashback and promo codes for your recharge.",
      },
    ],
  }),
  component: Offers,
});

const OFFERS = [
  {
    code: "STB50",
    title: "Flat ₹50 off",
    desc: "FOR 4 MONTHS PLAN ABOVE ₹240",
    tag: "Best",
    grad: "gradient-primary",
  },
  {
    code: "NEW10",
    title: "₹10 welcome bonus",
    desc: "FOR YOUR FIRST RECHARGE",
    tag: "New user",
    grad: "gradient-cyan",
  },
  {
    code: "WELCOME",
    title: "Flat ₹25 off",
    desc: "FOR 2 MONTHS PLAN ABOVE ₹200",
    tag: "Trending",
    grad: "gradient-primary",
  },
];

function Offers() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Offers & cashback</h1>
        <p className="text-sm text-muted-foreground">Save more on every recharge.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {OFFERS.map((o) => (
          <div key={o.code} className="card-3d relative overflow-hidden rounded-3xl p-6">
            <div
              className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-40 blur-3xl ${o.grad}`}
            />
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Gift className="h-3.5 w-3.5" /> {o.tag}
            </div>
            <div className="mt-2 font-display text-2xl font-bold">{o.title}</div>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{o.desc}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
