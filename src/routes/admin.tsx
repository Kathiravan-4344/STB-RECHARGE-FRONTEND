import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  useStore,
  addApprovedOperator,
  toggleOperatorStatus,
  removeApprovedOperator,
  toggleBlockCustomer,
  clearRechargeHistory,
  clearProductOrderHistory,
  clearComplaintHistory,
  clearAllFakeEntries,
  approvePending,
  rejectPending,
  updateProductRequestStatus,
  addProduct,
  updateProduct,
  deleteProduct,
  formatName,
  Product,
  ApprovedOperator,
} from "@/lib/store";
import {
  Shield,
  Users,
  CreditCard,
  Wrench,
  Package,
  Trash2,
  UserCheck,
  UserX,
  Search,
  Plus,
  Lock,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Edit,
  Eye,
  Tv,
  Phone,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Super Admin Portal — STB RECHARGE" },
      { name: "description", content: "Master Control Panel for STB Recharge system." },
    ],
  }),
  component: AdminPage,
});

type TabType =
  "dashboard" | "operators" | "customers" | "recharges" | "complaints" | "products" | "system";

function AdminPage() {
  const user = useStore((s) => s.user);
  const txns = useStore((s) => s.txns);
  const products = useStore((s) => s.products);
  const productRequests = useStore((s) => s.productRequests);
  const complaints = useStore((s) => s.complaints);
  const approvedOperators = useStore((s) => s.approvedOperators);
  const blockedCustomers = useStore((s) => s.blockedCustomers);
  const stb = useStore((s) => s.stb);

  const [tab, setTab] = useState<TabType>("dashboard");
  const [opMobile, setOpMobile] = useState("");
  const [opName, setOpName] = useState("");
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Search states
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Selected Operator Modal state
  const [selectedOperator, setSelectedOperator] = useState<ApprovedOperator | null>(null);
  const [opModalTab, setOpModalTab] = useState<
    "customers" | "recharges" | "products" | "complaints"
  >("customers");

  // Operator selection filters per tab
  const [customerFilterOperator, setCustomerFilterOperator] = useState<ApprovedOperator | null>(
    null,
  );
  const [rechargeFilterOperator, setRechargeFilterOperator] = useState<ApprovedOperator | null>(
    null,
  );
  const [productFilterOperator, setProductFilterOperator] = useState<ApprovedOperator | null>(null);
  const [complaintFilterOperator, setComplaintFilterOperator] = useState<ApprovedOperator | null>(
    null,
  );

  // Product Add/Edit Modal state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<"accessory" | "service">("accessory");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");

  const navigate = useNavigate();

  // STRICT ADMIN GUARD
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate({ to: "/" });
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  // Handlers
  function handleAddOperator(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = addApprovedOperator(opMobile, opName);
    setMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setOpMobile("");
      setOpName("");
    }
  }

  function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;
    addProduct({
      name: newProdName.trim(),
      category: newProdCategory,
      price: Number(newProdPrice),
      availableStock: Number(newProdStock) || 10,
      description: newProdDesc.trim(),
    });
    setShowAddProduct(false);
    setNewProdName("");
    setNewProdPrice("");
    setNewProdStock("");
    setNewProdDesc("");
    setMsg({ text: "New item added to catalog successfully." });
  }

  // Derived Metrics
  const totalRechargeAmount = txns
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingRechargesCount = txns.filter((t) => t.status === "pending").length;
  const pendingComplaintsCount = complaints.filter((c) => c.status === "Pending").length;

  // Aggregate Customer list from all records
  const customerMap = new Map<string, { mobile: string; name: string; stbId: string }>();
  txns.forEach((t) => {
    const key = t.customerMobile || t.stbId || "Unknown";
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        mobile: t.customerMobile || "N/A",
        name: t.customerName || "Customer",
        stbId: t.stbId || "1234567890",
      });
    }
  });
  productRequests.forEach((pr) => {
    const key = pr.customerMobile || pr.stbId;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        mobile: pr.customerMobile,
        name: pr.customerName,
        stbId: pr.stbId,
      });
    }
  });
  complaints.forEach((cmp) => {
    const key = cmp.customerMobile || cmp.stbId;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        mobile: cmp.customerMobile,
        name: cmp.customerName,
        stbId: cmp.stbId,
      });
    }
  });

  const allCustomers = Array.from(customerMap.values());
  const filteredCustomers = allCustomers.filter(
    (c) =>
      c.mobile.includes(customerSearch) ||
      c.stbId.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  return (
    <AppShell>
      {/* Top Banner */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900/80 p-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Lock className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/40">
                SUPER ADMIN MASTER CONTROL
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Welcome,{" "}
              <span className="text-amber-400 font-extrabold">{user.name || "KATHIRAVAN V"}</span>{" "}
              (9080864542)
            </h1>
            <p className="text-xs text-muted-foreground">
              Super Admin Master Portal • Full customer, operator, recharge, & service control
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5">
        {[
          { id: "dashboard", label: "📊 Dashboard", icon: Shield },
          { id: "operators", label: "🧑💻 Operators", icon: UserCheck },
          { id: "customers", label: "👥 Customers", icon: Users },
          { id: "recharges", label: "💰 Recharges", icon: CreditCard },
          { id: "complaints", label: "🛠️ Complaints", icon: Wrench },
          { id: "products", label: "📦 Products", icon: Package },
          { id: "system", label: "🧹 System Control", icon: RefreshCw },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as TabType)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              tab === t.id
                ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Alert Notification */}
      {msg && (
        <div
          className={`mb-6 flex items-center justify-between rounded-2xl border p-4 text-sm font-semibold ${
            msg.error
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              title="Total Customers"
              value={allCustomers.length}
              icon={Users}
              color="cyan"
            />
            <MetricCard
              title="Approved Operators"
              value={approvedOperators.filter((o) => o.active).length}
              icon={UserCheck}
              color="emerald"
            />
            <MetricCard
              title="Total Recharges"
              value={`₹${totalRechargeAmount}`}
              subtitle={`${txns.length} requests (${pendingRechargesCount} pending)`}
              icon={CreditCard}
              color="amber"
            />
            <MetricCard
              title="Complaints"
              value={complaints.length}
              subtitle={`${pendingComplaintsCount} pending tickets`}
              icon={Wrench}
              color="purple"
            />
            <MetricCard
              title="STB Status"
              value={stb?.active ? "Active" : "Inactive"}
              subtitle={`STB ID: ${stb?.id || "1234567890"}`}
              icon={Tv}
              color="blue"
            />
          </div>

          {/* Quick Actions Panel */}
          <div className="card-3d rounded-3xl p-6">
            <h2 className="font-display text-lg font-bold">Admin Master Actions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <button
                onClick={() => setTab("operators")}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-amber-500/50 hover:bg-white/10"
              >
                <UserCheck className="h-6 w-6 text-amber-400" />
                <div>
                  <div className="font-bold text-sm">Add Operator</div>
                  <div className="text-xs text-muted-foreground">Authorize mobile login</div>
                </div>
              </button>
              <button
                onClick={() => setTab("customers")}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-500/50 hover:bg-white/10"
              >
                <Users className="h-6 w-6 text-cyan-400" />
                <div>
                  <div className="font-bold text-sm">Manage Customers</div>
                  <div className="text-xs text-muted-foreground">Block / view user details</div>
                </div>
              </button>
              <button
                onClick={() => setTab("recharges")}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-emerald-500/50 hover:bg-white/10"
              >
                <CreditCard className="h-6 w-6 text-emerald-400" />
                <div>
                  <div className="font-bold text-sm">Recharge Requests</div>
                  <div className="text-xs text-muted-foreground">Approve or reject</div>
                </div>
              </button>
              <button
                onClick={() => setTab("system")}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-purple-500/50 hover:bg-white/10"
              >
                <RefreshCw className="h-6 w-6 text-purple-400" />
                <div>
                  <div className="font-bold text-sm">System Control</div>
                  <div className="text-xs text-muted-foreground">Purge fake entries</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPERATOR MANAGEMENT */}
      {tab === "operators" && (
        <div className="space-y-6">
          {/* Add Operator Form */}
          <div className="card-3d rounded-3xl p-6">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-amber-400" /> Add Operator Number (Whitelist)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              ONLY mobile numbers added here by Admin can access the Operator Panel. Added operator numbers are permanent records and cannot be deleted.
            </p>
            <form
              onSubmit={handleAddOperator}
              className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Operator Name
                </label>
                <input
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                  placeholder="e.g. VENKATESA PERUMAL"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Operator Mobile Number *
                </label>
                <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/5 focus-within:border-amber-400">
                  <span className="grid place-items-center px-4 text-sm font-bold text-muted-foreground">
                    +91
                  </span>
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    value={opMobile}
                    onChange={(e) => setOpMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="ENTER 10-DIGIT MOBILE"
                    className="w-full bg-transparent px-2 py-3 text-sm outline-none font-bold"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!opMobile || opMobile.length !== 10}
                className="rounded-2xl bg-amber-500 px-6 py-3 font-bold text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] transition hover:bg-amber-400 disabled:opacity-40"
              >
                + Add Operator
              </button>
            </form>
          </div>

          {/* Approved Operators Table */}
          <div className="card-3d overflow-hidden rounded-3xl p-6">
            <h3 className="font-display text-base font-bold mb-4">
              Approved Operators List ({approvedOperators.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Operator Name</th>
                    <th className="px-4 py-3">Mobile Number</th>
                    <th className="px-4 py-3">Date Added</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {approvedOperators.map((op) => (
                    <tr key={op.id}>
                      <td className="px-4 py-3.5 font-bold">{op.name}</td>
                      <td className="px-4 py-3.5 font-mono text-amber-400">+91 {op.mobile}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {new Date(op.addedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            op.active
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                              : "bg-red-500/10 border-red-500/40 text-red-400"
                          }`}
                        >
                          {op.active ? "Active (Approved)" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOperator(op);
                            setOpModalTab("customers");
                          }}
                          className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20"
                        >
                          👁️ Operator Info
                        </button>
                        <button
                          onClick={() => toggleOperatorStatus(op.id)}
                          className={`rounded-xl border px-3 py-1 text-xs font-semibold ${
                            op.active
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          }`}
                        >
                          {op.active ? "Deactivate" : "Activate"}
                        </button>
                        <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-muted-foreground">
                          🔒 Permanent
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DETAILED OPERATOR INFO MODAL OVERLAY */}
          {selectedOperator && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="card-3d w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-cyan-500/30 bg-slate-950 p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-400 border border-cyan-500/40">
                        OPERATOR PROFILE & LIVE DATA
                      </span>
                    </div>
                    <h2 className="font-display text-2xl font-bold mt-1 text-amber-400">
                      {selectedOperator.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Mobile Number:{" "}
                      <strong className="text-white">+91 {selectedOperator.mobile}</strong> • Added
                      on {new Date(selectedOperator.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOperator(null)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Modal Sub-Tabs */}
                <div className="mt-4 flex gap-2 border-b border-white/10 pb-3">
                  {[
                    { id: "customers", label: "👥 Customers", count: allCustomers.length },
                    { id: "recharges", label: "💰 Recharges", count: txns.length },
                    { id: "products", label: "📦 Product Orders", count: productRequests.length },
                    {
                      id: "complaints",
                      label: "🛠️ Complaints & Repairs",
                      count: complaints.length,
                    },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() =>
                        setOpModalTab(t.id as "customers" | "recharges" | "products" | "complaints")
                      }
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                        opModalTab === t.id
                          ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                          : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {t.label} ({t.count})
                    </button>
                  ))}
                </div>

                {/* Modal Content */}
                <div className="mt-4 space-y-4">
                  {/* SUB-TAB 1: CUSTOMERS */}
                  {opModalTab === "customers" && (
                    <div>
                      <h4 className="font-bold text-sm mb-2 text-cyan-400">
                        Customers under {selectedOperator.name}
                      </h4>
                      {allCustomers.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-xs text-muted-foreground">
                          No customers registered under this operator yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-white/10 bg-white/5 uppercase tracking-widest text-muted-foreground">
                              <tr>
                                <th className="px-4 py-2.5">Customer Name</th>
                                <th className="px-4 py-2.5">Mobile Number</th>
                                <th className="px-4 py-2.5">STB ID</th>
                                <th className="px-4 py-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {allCustomers.map((c) => {
                                const isBlocked =
                                  blockedCustomers.includes(c.mobile) ||
                                  blockedCustomers.includes(c.stbId);
                                return (
                                  <tr key={c.mobile + c.stbId}>
                                    <td className="px-4 py-2.5 font-bold">{c.name}</td>
                                    <td className="px-4 py-2.5 font-mono text-cyan-400">
                                      {c.mobile}
                                    </td>
                                    <td className="px-4 py-2.5 font-mono">{c.stbId}</td>
                                    <td className="px-4 py-2.5">
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                                          isBlocked
                                            ? "bg-red-500/10 border-red-500/40 text-red-400"
                                            : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                        }`}
                                      >
                                        {isBlocked ? "BLOCKED" : "ACTIVE"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 2: RECHARGES */}
                  {opModalTab === "recharges" && (
                    <div>
                      <h4 className="font-bold text-sm mb-2 text-amber-400">
                        Customer Recharges under {selectedOperator.name}
                      </h4>
                      {txns.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-xs text-muted-foreground">
                          No recharge transactions for this operator yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-white/10 bg-white/5 uppercase tracking-widest text-muted-foreground">
                              <tr>
                                <th className="px-4 py-2.5">Txn ID</th>
                                <th className="px-4 py-2.5">Customer</th>
                                <th className="px-4 py-2.5">Plan Name</th>
                                <th className="px-4 py-2.5">Amount</th>
                                <th className="px-4 py-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {txns.map((t) => (
                                <tr key={t.id}>
                                  <td className="px-4 py-2.5 font-mono text-amber-400">{t.id}</td>
                                  <td className="px-4 py-2.5 font-medium">
                                    {t.customerName} ({t.customerMobile})
                                  </td>
                                  <td className="px-4 py-2.5">{t.planName}</td>
                                  <td className="px-4 py-2.5 font-bold text-emerald-400">
                                    ₹{t.amount}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                                        t.status === "success"
                                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                          : t.status === "pending"
                                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                            : "bg-red-500/10 border-red-500/40 text-red-400"
                                      }`}
                                    >
                                      {t.status.toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 3: PRODUCTS */}
                  {opModalTab === "products" && (
                    <div>
                      <h4 className="font-bold text-sm mb-2 text-purple-400">
                        Product & Service Orders under {selectedOperator.name}
                      </h4>
                      {productRequests.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-xs text-muted-foreground">
                          No product or service orders for this operator yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-white/10 bg-white/5 uppercase tracking-widest text-muted-foreground">
                              <tr>
                                <th className="px-4 py-2.5">Request ID</th>
                                <th className="px-4 py-2.5">Customer</th>
                                <th className="px-4 py-2.5">Item Name</th>
                                <th className="px-4 py-2.5">Category</th>
                                <th className="px-4 py-2.5">Total Amount</th>
                                <th className="px-4 py-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {productRequests.map((pr) => (
                                <tr key={pr.id}>
                                  <td className="px-4 py-2.5 font-mono text-purple-400">{pr.id}</td>
                                  <td className="px-4 py-2.5 font-medium">
                                    {pr.customerName} ({pr.customerMobile})
                                  </td>
                                  <td className="px-4 py-2.5 font-bold">{pr.productName}</td>
                                  <td className="px-4 py-2.5 text-[10px] uppercase text-muted-foreground">
                                    {pr.category}
                                  </td>
                                  <td className="px-4 py-2.5 font-bold text-amber-400">
                                    ₹{pr.totalAmount}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span className="rounded-full bg-cyan-500/10 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                                      {pr.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 4: COMPLAINTS */}
                  {opModalTab === "complaints" && (
                    <div>
                      <h4 className="font-bold text-sm mb-2 text-red-400">
                        Complaints & TV Repair Tickets under {selectedOperator.name}
                      </h4>
                      {complaints.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-xs text-muted-foreground">
                          No repair tickets or complaints assigned to this operator yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-white/10 bg-white/5 uppercase tracking-widest text-muted-foreground">
                              <tr>
                                <th className="px-4 py-2.5">Ticket ID</th>
                                <th className="px-4 py-2.5">Customer</th>
                                <th className="px-4 py-2.5">Category / Issue</th>
                                <th className="px-4 py-2.5">Preferred Time</th>
                                <th className="px-4 py-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {complaints.map((c) => (
                                <tr key={c.id}>
                                  <td className="px-4 py-2.5 font-mono text-purple-400">{c.id}</td>
                                  <td className="px-4 py-2.5 font-medium">
                                    {c.customerName} ({c.customerMobile})
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <div className="font-bold text-xs">{c.category}</div>
                                    <div className="text-[10px] text-muted-foreground">
                                      {c.issueType}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                    {c.preferredTime}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                                        c.status === "Resolved"
                                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                          : "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                      }`}
                                    >
                                      {c.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CUSTOMER MANAGEMENT */}
      {tab === "customers" && (
        <div className="space-y-6">
          {!customerFilterOperator ? (
            /* STEP 1: SELECT AN OPERATOR FIRST */
            <div className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <UserCheck className="h-6 w-6 text-amber-400" /> Select an Operator to View
                    Customers
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click on an operator below to inspect all customer accounts, STB IDs, and access
                    controls managed by that operator.
                  </p>
                </div>
              </div>

              {approvedOperators.length === 0 ? (
                <div className="card-3d rounded-3xl p-8 text-center">
                  <UserX className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <h3 className="font-bold text-base">No Approved Operators Added Yet</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Go to the <strong>Operators</strong> tab to add operator mobile numbers first.
                  </p>
                  <button
                    onClick={() => setTab("operators")}
                    className="rounded-2xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-amber-400"
                  >
                    + Add Operator Now
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {approvedOperators.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setCustomerFilterOperator(op)}
                      className="group card-3d rounded-3xl border border-white/10 p-5 text-left transition hover:border-amber-500/50 hover:bg-white/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <UserCheck className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          Active Operator
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg mt-3 text-white group-hover:text-amber-400 transition">
                        {op.name}
                      </h3>
                      <div className="font-mono text-sm text-amber-400 mt-1">+91 {op.mobile}</div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold text-cyan-400">
                        <span>View Customers ({allCustomers.length})</span>
                        <span className="transition group-hover:translate-x-1">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: SHOW CUSTOMERS FOR SELECTED OPERATOR */
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <button
                    onClick={() => setCustomerFilterOperator(null)}
                    className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline"
                  >
                    ← Back to All Operators
                  </button>
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    Customers under:{" "}
                    <span className="text-amber-400">{customerFilterOperator.name}</span> (+91{" "}
                    {customerFilterOperator.mobile})
                  </h2>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search Mobile / STB ID / Name..."
                    className="bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div className="card-3d overflow-hidden rounded-3xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Customer Name</th>
                        <th className="px-4 py-3">Mobile Number</th>
                        <th className="px-4 py-3">STB ID</th>
                        <th className="px-4 py-3">Access Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-xs text-muted-foreground"
                          >
                            No customers found for {customerFilterOperator.name}.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((c) => {
                          const isBlocked =
                            blockedCustomers.includes(c.mobile) ||
                            blockedCustomers.includes(c.stbId);
                          return (
                            <tr key={c.mobile + c.stbId}>
                              <td className="px-4 py-3.5 font-bold">{c.name}</td>
                              <td className="px-4 py-3.5 font-mono text-cyan-400">{c.mobile}</td>
                              <td className="px-4 py-3.5 font-mono">{c.stbId}</td>
                              <td className="px-4 py-3.5">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                    isBlocked
                                      ? "bg-red-500/10 border-red-500/40 text-red-400"
                                      : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                  }`}
                                >
                                  {isBlocked ? "BLOCKED" : "ACTIVE"}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <button
                                  onClick={() => toggleBlockCustomer(c.mobile)}
                                  className={`rounded-xl border px-3 py-1 text-xs font-semibold ${
                                    isBlocked
                                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                      : "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                  }`}
                                >
                                  {isBlocked ? "Unblock Customer" : "Block Customer"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RECHARGE MANAGEMENT */}
      {tab === "recharges" && (
        <div className="space-y-6">
          {!rechargeFilterOperator ? (
            /* STEP 1: SELECT AN OPERATOR FIRST */
            <div className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-emerald-400" /> Select an Operator to View
                    Recharge Requests
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click on an operator below to view and manage customer recharge requests under
                    that operator.
                  </p>
                </div>
                <button
                  onClick={() => {
                    clearRechargeHistory();
                    setMsg({ text: "Recharge history cleared." });
                  }}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20"
                >
                  Clear History
                </button>
              </div>

              {approvedOperators.length === 0 ? (
                <div className="card-3d rounded-3xl p-8 text-center">
                  <UserX className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <h3 className="font-bold text-base">No Approved Operators Added Yet</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Go to the <strong>Operators</strong> tab to add operator mobile numbers first.
                  </p>
                  <button
                    onClick={() => setTab("operators")}
                    className="rounded-2xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-amber-400"
                  >
                    + Add Operator Now
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {approvedOperators.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setRechargeFilterOperator(op)}
                      className="group card-3d rounded-3xl border border-white/10 p-5 text-left transition hover:border-emerald-500/50 hover:bg-white/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          Active Operator
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg mt-3 text-white group-hover:text-emerald-400 transition">
                        {op.name}
                      </h3>
                      <div className="font-mono text-sm text-emerald-400 mt-1">+91 {op.mobile}</div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold text-cyan-400">
                        <span>View Recharges ({txns.length})</span>
                        <span className="transition group-hover:translate-x-1">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: SHOW RECHARGES FOR SELECTED OPERATOR */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <button
                    onClick={() => setRechargeFilterOperator(null)}
                    className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
                  >
                    ← Back to All Operators
                  </button>
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    Customer Recharges under:{" "}
                    <span className="text-emerald-400">{rechargeFilterOperator.name}</span> (+91{" "}
                    {rechargeFilterOperator.mobile})
                  </h2>
                </div>
                <button
                  onClick={() => {
                    clearRechargeHistory();
                    setMsg({ text: "Recharge history cleared." });
                  }}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20"
                >
                  Clear History
                </button>
              </div>

              <div className="card-3d overflow-hidden rounded-3xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Txn ID</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Plan</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {txns.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-xs text-muted-foreground"
                          >
                            No recharge requests for {rechargeFilterOperator.name} yet.
                          </td>
                        </tr>
                      ) : (
                        txns.map((t) => (
                          <tr key={t.id}>
                            <td className="px-4 py-3.5 font-mono text-xs text-amber-400">{t.id}</td>
                            <td className="px-4 py-3.5 font-medium">
                              {t.customerName || "Customer"} ({t.customerMobile || "N/A"})
                            </td>
                            <td className="px-4 py-3.5">{t.planName}</td>
                            <td className="px-4 py-3.5 font-bold">₹{t.amount}</td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                  t.status === "success"
                                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                    : t.status === "pending"
                                      ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                      : "bg-red-500/10 border-red-500/40 text-red-400"
                                }`}
                              >
                                {t.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right space-x-2">
                              {t.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => approvePending(t.id)}
                                    className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => rejectPending(t.id)}
                                    className="rounded-lg bg-red-500/20 border border-red-500/40 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-500/30"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PRODUCT & CATALOG MANAGEMENT */}
      {tab === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Catalog & Orders Management</h2>
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-1 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" /> Add Product / Service
            </button>
          </div>

          {/* Add Product Modal */}
          {showAddProduct && (
            <div className="card-3d rounded-3xl p-6 border border-amber-500/30">
              <h3 className="font-bold text-base mb-4">Add New Catalog Item</h3>
              <form onSubmit={handleCreateProduct} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Item Name
                  </label>
                  <input
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. 4K HDMI Cable v2"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Category
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as "accessory" | "service")}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
                  >
                    <option value="accessory" className="bg-slate-900">
                      Accessory
                    </option>
                    <option value="service" className="bg-slate-900">
                      Installation Service
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="250"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="15"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Description
                  </label>
                  <input
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Description of item"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 px-6 py-2 text-xs font-bold text-black hover:bg-amber-400"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Product Catalog Table */}
          <div className="card-3d overflow-hidden rounded-3xl p-6">
            <h3 className="font-display text-base font-bold mb-4">Current Products & Services</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-bold">{p.name}</td>
                      <td className="px-4 py-3 text-xs uppercase text-muted-foreground">
                        {p.category}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">₹{p.price}</td>
                      <td className="px-4 py-3">{p.availableStock}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="rounded-xl border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COMPLAINTS & REPAIRS */}
      {tab === "complaints" && (
        <div className="space-y-6">
          {!complaintFilterOperator ? (
            /* STEP 1: SELECT AN OPERATOR FIRST */
            <div className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <Wrench className="h-6 w-6 text-purple-400" /> Select an Operator to View
                    Complaints & Repairs
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click on an operator below to view and manage repair tickets & complaints
                    assigned to that operator.
                  </p>
                </div>
                <button
                  onClick={() => {
                    clearComplaintHistory();
                    setMsg({ text: "Complaints history cleared." });
                  }}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20"
                >
                  Clear History
                </button>
              </div>

              {approvedOperators.length === 0 ? (
                <div className="card-3d rounded-3xl p-8 text-center">
                  <UserX className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <h3 className="font-bold text-base">No Approved Operators Added Yet</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Go to the <strong>Operators</strong> tab to add operator mobile numbers first.
                  </p>
                  <button
                    onClick={() => setTab("operators")}
                    className="rounded-2xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-amber-400"
                  >
                    + Add Operator Now
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {approvedOperators.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setComplaintFilterOperator(op)}
                      className="group card-3d rounded-3xl border border-white/10 p-5 text-left transition hover:border-purple-500/50 hover:bg-white/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                          <Wrench className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          Active Operator
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg mt-3 text-white group-hover:text-purple-400 transition">
                        {op.name}
                      </h3>
                      <div className="font-mono text-sm text-purple-400 mt-1">+91 {op.mobile}</div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold text-cyan-400">
                        <span>View Complaints ({complaints.length})</span>
                        <span className="transition group-hover:translate-x-1">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: SHOW COMPLAINTS FOR SELECTED OPERATOR */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <button
                    onClick={() => setComplaintFilterOperator(null)}
                    className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:underline"
                  >
                    ← Back to All Operators
                  </button>
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    Complaints & Repairs under:{" "}
                    <span className="text-purple-400">{complaintFilterOperator.name}</span> (+91{" "}
                    {complaintFilterOperator.mobile})
                  </h2>
                </div>
                <button
                  onClick={() => {
                    clearComplaintHistory();
                    setMsg({ text: "Complaints history cleared." });
                  }}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20"
                >
                  Clear History
                </button>
              </div>

              <div className="card-3d overflow-hidden rounded-3xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Ticket ID</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Category / Issue</th>
                        <th className="px-4 py-3">Assigned Operator</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {complaints.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-xs text-muted-foreground"
                          >
                            No repair tickets or complaints for {complaintFilterOperator.name} yet.
                          </td>
                        </tr>
                      ) : (
                        complaints.map((c) => (
                          <tr key={c.id}>
                            <td className="px-4 py-3.5 font-mono text-xs text-purple-400">
                              {c.id}
                            </td>
                            <td className="px-4 py-3.5 font-medium">
                              {c.customerName} ({c.customerMobile})
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-xs">{c.category}</div>
                              <div className="text-xs text-muted-foreground">{c.issueType}</div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-amber-400 font-bold">
                              {c.technicianName || complaintFilterOperator.name}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                  c.status === "Resolved"
                                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                    : "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: SYSTEM CONTROL */}
      {tab === "system" && (
        <div className="space-y-6">
          <div className="card-3d rounded-3xl p-6 border border-amber-500/30">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-amber-400" /> System Reset & Data Purge Controls
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Remove fake entries, auto-generated demo records, and manage system cleanups.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="font-bold text-sm">Purge Auto-Generated & Fake Records</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Clears out demo seed entries so only real customer activity is recorded.
                </p>
                <button
                  onClick={() => {
                    clearAllFakeEntries();
                    setMsg({ text: "Auto-generated fake demo entries removed." });
                  }}
                  className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400"
                >
                  Purge Fake Entries
                </button>
              </div>

              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
                <h3 className="font-bold text-sm text-red-400">Clear All Transaction History</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Permanently erases all customer recharge history.
                </p>
                <button
                  onClick={() => {
                    clearRechargeHistory();
                    setMsg({ text: "All recharge history erased." });
                  }}
                  className="mt-4 rounded-xl border border-red-500/40 bg-red-500/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/30"
                >
                  Clear Recharges
                </button>
              </div>

              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
                <h3 className="font-bold text-sm text-red-400">Clear Product Orders History</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Erases all accessory and service installation requests.
                </p>
                <button
                  onClick={() => {
                    clearProductOrderHistory();
                    setMsg({ text: "Product orders cleared." });
                  }}
                  className="mt-4 rounded-xl border border-red-500/40 bg-red-500/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/30"
                >
                  Clear Orders
                </button>
              </div>

              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
                <h3 className="font-bold text-sm text-red-400">Clear Complaint History</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Erases all repair tickets and complaint logs.
                </p>
                <button
                  onClick={() => {
                    clearComplaintHistory();
                    setMsg({ text: "Complaint tickets cleared." });
                  }}
                  className="mt-4 rounded-xl border border-red-500/40 bg-red-500/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/30"
                >
                  Clear Complaints
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: "cyan" | "emerald" | "amber" | "purple" | "blue";
}) {
  const colorMap = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  };

  return (
    <div className={`card-3d rounded-3xl p-5 border ${colorMap[color].split(" ")[2]}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{title}</div>
        <div className={`grid h-9 w-9 place-items-center rounded-xl border ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 font-display text-2xl font-bold">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
    </div>
  );
}
