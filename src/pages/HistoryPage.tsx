import { AppShell } from "../components/AppShell";
import { useStore } from "../services/store";
import { Receipt } from "lucide-react";

export function HistoryPage() {
  const txns = useStore((s) => s.txns);
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Transaction history</h1>
        <p className="text-sm text-muted-foreground">All your recharges in one place.</p>
      </div>
      {txns.length === 0 ? (
        <div className="card-3d rounded-3xl p-10 text-center">
          <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No transactions yet. Recharge a plan to see it here.
          </p>
        </div>
      ) : (
        <div className="card-3d overflow-hidden rounded-3xl">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3 hidden sm:table-cell">Date</th>
                <th className="px-5 py-3 hidden md:table-cell">Txn ID</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-4 font-medium">{t.planName}</td>
                  <td className="px-5 py-4">₹{t.amount}</td>
                  <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">
                    {new Date(t.date).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{t.id}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

function StatusBadge({ status }: { status: "pending" | "success" | "failed" }) {
  const map = {
    pending: {
      c: "bg-[color:var(--warning)]/10 text-[color:var(--warning)] border-[color:var(--warning)]/40",
      t: "Pending",
    },
    success: {
      c: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-[color:var(--success)]/40",
      t: "Success",
    },
    failed: { c: "bg-destructive/10 text-destructive border-destructive/40", t: "Failed" },
  }[status];
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${map.c}`}>
      {map.t}
    </span>
  );
}

export default HistoryPage;
