import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore, useCountdown, approvePending, rejectPending } from "@/lib/store";
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/recharge/pending")({
  head: () => ({
    meta: [
      { title: "Waiting for Operator — STB RECHARGE" },
      { name: "description", content: "Your recharge is pending operator approval." },
    ],
  }),
  component: Pending,
});

const FORTY_FIVE_MIN = 45 * 60 * 1000;

function Pending() {
  const pending = useStore((s) => s.pending);
  const txns = useStore((s) => s.txns);
  const navigate = useNavigate();
  const cd = useCountdown(pending?.startedAt ?? 0, FORTY_FIVE_MIN);

  useEffect(() => {
    if (!pending) {
      const last = txns[0];
      if (last?.status === "success")
        navigate({ to: "/recharge/success", search: { id: last.id } });
      else navigate({ to: "/dashboard" });
    }
  }, [pending, txns, navigate]);

  if (!pending) return null;
  const pct = Math.min(100, Math.max(0, cd.pct * 100));

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="card-3d relative overflow-hidden rounded-3xl p-8 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_-20%,var(--neon)/20,transparent_60%)]" />

          <div className="relative mx-auto grid h-24 w-24 place-items-center">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
              style={{ animation: "ring-spin 1.6s linear infinite" }}
            />
            <Loader2 className="h-8 w-8 animate-spin text-[color:var(--neon-cyan)]" />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 px-3 py-1 text-xs font-medium text-[color:var(--warning)]">
            <Clock className="h-3.5 w-3.5" /> Waiting for Operator Approval
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold">Recharge Pending</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Your request has been sent to the operator. Recharge will be completed shortly.
          </p>

          {/* Countdown */}
          <div className="mx-auto mt-6 max-w-sm">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Auto-completes in
            </div>
            <div className="mt-1 font-display text-5xl font-bold tabular-nums text-gradient">
              {cd.label}
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full gradient-primary transition-[width] duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="mx-auto mt-8 grid max-w-md gap-3 text-left">
            <Row k="Transaction ID" v={pending.txnId} />
            <Row k="Plan" v={pending.planName} />
            <Row k="Amount" v={`₹${pending.amount}`} />
          </div>

          {/* Demo controls */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => approvePending(pending.txnId)}
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--success)]/15 border border-[color:var(--success)]/40 px-4 py-2 text-sm font-semibold text-[color:var(--success)]"
            >
              <CheckCircle2 className="h-4 w-4" /> Simulate Operator Approval
            </button>
            <button
              onClick={() => rejectPending(pending.txnId)}
              className="inline-flex items-center gap-2 rounded-xl bg-destructive/15 border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive"
            >
              <XCircle className="h-4 w-4" /> Simulate Reject
            </button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Demo: request auto-approves in ~12 seconds.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
