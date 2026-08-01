import { Link } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";
import { useStore } from "../services/store";
import { CheckCircle2, Home, Receipt } from "lucide-react";

export function SuccessPage({ searchId }: { searchId?: string }) {
  const txn = useStore((s) => s.txns.find((t) => t.id === searchId) ?? s.txns[0]);
  const stb = useStore((s) => s.stb);

  if (!txn)
    return (
      <AppShell>
        <div className="card-3d rounded-3xl p-8 text-center">No recent transaction found.</div>
      </AppShell>
    );

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="card-3d relative overflow-hidden rounded-3xl p-8 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_-20%,color-mix(in_oklab,var(--success)_25%,transparent),transparent_60%)]" />

          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[color:var(--success)]/15 border border-[color:var(--success)]/40 pulse-success animate-success-pop">
            <CheckCircle2 className="h-12 w-12 text-[color:var(--success)]" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold">Recharge Successful 🎉</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your plan has been activated by the operator.
          </p>

          <div className="mx-auto mt-6 grid max-w-md gap-3 text-left">
            <Row k="Activated plan" v={txn.planName} />
            <Row k="Amount paid" v={`₹${txn.amount}`} />
            <Row k="Transaction ID" v={txn.id} />
            <Row k="Date & time" v={new Date(txn.approvedAt ?? txn.date).toLocaleString()} />
            {stb && <Row k="STB ID" v={stb.id} />}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              <Home className="h-4 w-4" /> Go to Dashboard
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm"
            >
              <Receipt className="h-4 w-4" /> View History
            </Link>
          </div>
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

export default SuccessPage;
