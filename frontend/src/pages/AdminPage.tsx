import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import {
  useStore,
  upsertOperator,
  setOperatorActive,
  removeApprovedOperator,
  blockCustomer,
  unblockCustomer,
  approveTxn,
  updateProductStatus,
  updateComplaintStatus,
  upsertProduct,
  removeProduct,
  resetAllData,
  formatName,
  type Product,
  type ApprovedOperator,
  type ComplaintStatus,
} from "../services/store";
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
  Clock,
  Filter,
  Check,
  X,
} from "lucide-react";

type TabType =
  | "dashboard"
  | "operators"
  | "customers"
  | "recharges"
  | "complaints"
  | "products"
  | "system";

export function AdminPage() {
  const user = useStore((s) => s.user);
  const txns = useStore((s) => s.txns);
  const products = useStore((s) => s.products);
  const productRequests = useStore((s) => s.productRequests);
  const complaints = useStore((s) => s.complaints);
  const approvedOperators = useStore((s) => s.approvedOperators);
  const blockedCustomers = useStore((s) => s.blockedCustomers);

  const [tab, setTab] = useState<TabType>("dashboard");
  const [opMobile, setOpMobile] = useState("");
  const [opName, setOpName] = useState("");
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Search states per tab
  const [customerSearch, setCustomerSearch] = useState("");
  const [rechargeSearch, setRechargeSearch] = useState("");
  const [rechargeStatusFilter, setRechargeStatusFilter] = useState<string>("all");
  const [complaintSearch, setComplaintSearch] = useState("");
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<string>("all");
  const [productSearch, setProductSearch] = useState("");

  // Selected Operator Modal State
  const [selectedOperator, setSelectedOperator] = useState<ApprovedOperator | null>(null);

  // Product Add/Edit Modal state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
    if (!opMobile.trim() || !opName.trim()) return;
    upsertOperator(opMobile, opName);
    setMsg({ text: `Operator ${opName} added successfully!` });
    setOpMobile("");
    setOpName("");
  }

  function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;
    upsertProduct({
      id: editingProduct ? editingProduct.id : "prod-" + Date.now(),
      name: newProdName.trim(),
      category: newProdCategory,
      price: Number(newProdPrice),
      availableStock: Number(newProdStock) || 10,
      description: newProdDesc.trim(),
    });
    setShowAddProduct(false);
    setEditingProduct(null);
    setNewProdName("");
    setNewProdPrice("");
    setNewProdStock("");
    setNewProdDesc("");
    setMsg({ text: editingProduct ? "Product updated." : "New item added to catalog." });
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

  const filteredTxns = txns.filter((t) => {
    const matchSearch =
      t.id.toLowerCase().includes(rechargeSearch.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(rechargeSearch.toLowerCase())) ||
      (t.stbId && t.stbId.toLowerCase().includes(rechargeSearch.toLowerCase())) ||
      (t.customerMobile && t.customerMobile.includes(rechargeSearch));
    const matchStatus = rechargeStatusFilter === "all" ? true : t.status === rechargeStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredComplaints = complaints.filter((c) => {
    const matchSearch =
      c.id.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.customerName.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.stbId.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(complaintSearch.toLowerCase());
    const matchStatus =
      complaintStatusFilter === "all" ? true : c.status === complaintStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <AppShell>
      {/* Top Banner */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900/80 p-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-white">Super Admin Portal</h1>
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-extrabold text-amber-400 border border-amber-500/40 uppercase">
                MASTER CONTROL
              </span>
            </div>
            <p className="text-xs text-amber-200/80 mt-1">
              Logged in as 👑 <strong>Kathiravan V</strong> (9080864542) • Full Administrative
              Privileges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("system")}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
          >
            <Trash2 className="h-4 w-4" /> System Reset
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`mb-6 flex items-center justify-between rounded-2xl p-4 text-xs font-bold ${
            msg.error
              ? "border border-red-500/40 bg-red-500/10 text-red-400"
              : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-white hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar rounded-2xl border border-white/10 bg-white/5 p-1.5">
        {[
          { id: "dashboard", label: "📊 Overview", icon: Zap },
          { id: "operators", label: "🛡️ Operators", icon: Shield },
          { id: "customers", label: "👥 Customers", icon: Users },
          { id: "recharges", label: "💳 Recharges", icon: CreditCard },
          { id: "complaints", label: "🔧 Complaints", icon: Wrench },
          { id: "products", label: "📦 Products", icon: Package },
          { id: "system", label: "⚙️ System", icon: Lock },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as TabType)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              tab === t.id
                ? "bg-amber-500 text-black font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Dashboard Overview */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              onClick={() => setTab("recharges")}
              className="cursor-pointer group rounded-3xl border border-amber-500/20 bg-white/5 p-6 backdrop-blur-xl hover:border-amber-500/40 transition"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-bold">
                <span>Total Revenue</span>
                <CreditCard className="h-5 w-5 text-amber-400 group-hover:scale-110 transition" />
              </div>
              <div className="mt-4 font-display text-4xl font-black text-amber-400 font-mono">
                ₹{totalRechargeAmount}
              </div>
              <div className="mt-1 text-xs text-slate-400">All successful recharges</div>
            </div>

            <div
              onClick={() => setTab("operators")}
              className="cursor-pointer group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-cyan-500/40 transition"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-bold">
                <span>Approved Operators</span>
                <Shield className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition" />
              </div>
              <div className="mt-4 font-display text-4xl font-black text-white">
                {approvedOperators.length}
              </div>
              <div className="mt-1 text-xs text-slate-400">Approved operator logins</div>
            </div>

            <div
              onClick={() => setTab("recharges")}
              className="cursor-pointer group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-yellow-500/40 transition"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-bold">
                <span>Pending Approvals</span>
                <Clock className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition" />
              </div>
              <div className="mt-4 font-display text-4xl font-black text-yellow-400">
                {pendingRechargesCount}
              </div>
              <div className="mt-1 text-xs text-slate-400">Awaiting operator signoff</div>
            </div>

            <div
              onClick={() => setTab("complaints")}
              className="cursor-pointer group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-purple-500/40 transition"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-bold">
                <span>Open Complaints</span>
                <Wrench className="h-5 w-5 text-purple-400 group-hover:scale-110 transition" />
              </div>
              <div className="mt-4 font-display text-4xl font-black text-purple-400">
                {pendingComplaintsCount}
              </div>
              <div className="mt-1 text-xs text-slate-400">Needs technician dispatch</div>
            </div>
          </div>

          {/* Quick Nav Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              onClick={() => setTab("operators")}
              className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition space-y-2"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-amber-400" />
                <h3 className="font-bold text-white text-base">Manage Operators</h3>
              </div>
              <p className="text-xs text-slate-400">
                Add, activate, or deactivate operator logins.
              </p>
            </div>

            <div
              onClick={() => setTab("customers")}
              className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition space-y-2"
            >
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Customer Database</h3>
              </div>
              <p className="text-xs text-slate-400">
                View customer profiles, STB IDs, and block/unblock users.
              </p>
            </div>

            <div
              onClick={() => setTab("products")}
              className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition space-y-2"
            >
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Product Inventory</h3>
              </div>
              <p className="text-xs text-slate-400">
                Manage accessories, services, price & available stock.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Approved Operators */}
      {tab === "operators" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-slate-900/40 to-slate-900/80 p-6 space-y-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-400" /> ADD OPERATOR
              </h2>
              <span className="text-[11px] text-amber-300/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-mono">
                Instant Access
              </span>
            </div>

            <form
              onSubmit={handleAddOperator}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Operator Full Name
                </label>
                <input
                  type="text"
                  required
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Mobile Number / Email
                </label>
                <input
                  type="text"
                  required
                  value={opMobile}
                  onChange={(e) => setOpMobile(e.target.value)}
                  placeholder="e.g. 9840192837 or op@stb.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400 transition"
                />
              </div>

              <button
                type="submit"
                className="h-10 rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-xs font-extrabold text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] transition"
              >
                + ADD OPERATOR
              </button>
            </form>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Operator Name</th>
                  <th className="px-6 py-4">Contact (Mobile/Email)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {approvedOperators.map((op) => (
                  <tr key={op.id}>
                    <td className="px-6 py-4 font-bold text-white">{op.name}</td>
                    <td className="px-6 py-4 font-mono">{op.mobile}</td>
                    <td className="px-6 py-4">
                      {op.active ? (
                        <span className="text-emerald-400 font-bold text-xs">🟢 Active</span>
                      ) : (
                        <span className="text-red-400 font-bold text-xs">🔴 Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedOperator(op)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-cyan-300 hover:bg-white/15"
                      >
                        <Eye className="h-3.5 w-3.5 inline mr-1" /> View Details
                      </button>
                      <button
                        onClick={() => setOperatorActive(op.id, !op.active)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white hover:bg-white/15"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Customers */}
      {tab === "customers" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 flex justify-between items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customers..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">STB ID</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((c, i) => {
                  const isBlocked =
                    blockedCustomers.includes(c.mobile) || blockedCustomers.includes(c.stbId);
                  return (
                    <tr key={i}>
                      <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                      <td className="px-6 py-4 font-mono">{c.mobile}</td>
                      <td className="px-6 py-4 font-mono">{c.stbId}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            if (isBlocked) unblockCustomer(c.mobile);
                            else blockCustomer(c.mobile);
                          }}
                          className={`rounded-xl px-3 py-1 text-xs font-bold ${
                            isBlocked
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {isBlocked ? "Unblock Customer" : "Block Customer"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Recharges */}
      {tab === "recharges" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={rechargeSearch}
                onChange={(e) => setRechargeSearch(e.target.value)}
                placeholder="Search transaction ID, customer, STB..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Filter className="h-4 w-4 text-slate-400" />
              {["all", "pending", "success", "failed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setRechargeStatusFilter(st)}
                  className={`rounded-xl px-3 py-1.5 font-bold capitalize transition ${
                    rechargeStatusFilter === st
                      ? "bg-amber-500 text-black"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Txn ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTxns.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 font-mono text-white">{t.id}</td>
                    <td className="px-6 py-4">{t.customerName || "Customer"}</td>
                    <td className="px-6 py-4">{t.planName}</td>
                    <td className="px-6 py-4 font-mono text-amber-400 font-bold">₹{t.amount}</td>
                    <td className="px-6 py-4 capitalize font-bold">
                      {t.status === "pending" && (
                        <span className="text-yellow-400">🟡 Pending</span>
                      )}
                      {t.status === "success" && (
                        <span className="text-emerald-400">🟢 Success</span>
                      )}
                      {t.status === "failed" && <span className="text-red-400">🔴 Failed</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {t.status === "pending" && (
                        <button
                          onClick={() => approveTxn(t.id)}
                          className="rounded-xl bg-emerald-500 px-3 py-1 text-xs font-bold text-black"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Complaints */}
      {tab === "complaints" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                placeholder="Search complaint ID, customer, category..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Filter className="h-4 w-4 text-slate-400" />
              {["all", "Pending", "Assigned", "In Progress", "Resolved"].map((st) => (
                <button
                  key={st}
                  onClick={() => setComplaintStatusFilter(st)}
                  className={`rounded-xl px-3 py-1.5 font-bold capitalize transition ${
                    complaintStatusFilter === st
                      ? "bg-amber-500 text-black"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredComplaints.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 font-mono text-amber-400 font-bold">{c.id}</td>
                    <td className="px-6 py-4">{c.customerName}</td>
                    <td className="px-6 py-4">
                      {c.category} – {c.issueType}
                    </td>
                    <td className="px-6 py-4 font-bold">{c.status}</td>
                    <td className="px-6 py-4 text-right">
                      {c.status !== "Resolved" && (
                        <button
                          onClick={() => updateComplaintStatus(c.id, { status: "Resolved" })}
                          className="rounded-xl bg-emerald-500 px-3 py-1 text-xs font-bold text-black"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Products */}
      {tab === "products" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white outline-none"
              />
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setNewProdName("");
                setNewProdPrice("");
                setNewProdStock("");
                setNewProdDesc("");
                setShowAddProduct(true);
              }}
              className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black shrink-0"
            >
              + Add Product
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 font-bold text-white">{p.name}</td>
                    <td className="px-6 py-4 capitalize">{p.category}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">₹{p.price}</td>
                    <td className="px-6 py-4 font-mono">{p.availableStock}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setNewProdName(p.name);
                          setNewProdCategory(p.category);
                          setNewProdPrice(String(p.price));
                          setNewProdStock(String(p.availableStock));
                          setNewProdDesc(p.description || "");
                          setShowAddProduct(true);
                        }}
                        className="rounded-xl bg-white/10 px-3 py-1 text-xs font-bold text-white hover:bg-white/20"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="rounded-xl bg-red-500/20 text-red-400 px-3 py-1 text-xs font-bold hover:bg-red-500/30"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: System Reset */}
      {tab === "system" && (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 space-y-4 max-w-xl mx-auto text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h2 className="font-display text-2xl font-bold text-white">Reset Local System Data</h2>
          <p className="text-xs text-slate-300">
            This will clear all local transactions, complaints, product requests and restore default state.
          </p>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to reset all local data?")) {
                resetAllData();
                alert("System reset completed.");
              }
            }}
            className="rounded-xl bg-red-500 px-6 py-3 text-xs font-bold text-black"
          >
            Confirm System Reset
          </button>
        </div>
      )}

      {/* Selected Operator Modal */}
      {selectedOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0d121f] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-xl font-bold text-white">
                Operator: {selectedOperator.name}
              </h3>
              <button
                onClick={() => setSelectedOperator(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div>Contact: <strong>{selectedOperator.mobile}</strong></div>
              <div>Added Date: <strong>{new Date(selectedOperator.addedAt).toLocaleString()}</strong></div>
              <div>Status: <strong>{selectedOperator.active ? "Active" : "Inactive"}</strong></div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOperator(null)}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0d121f] p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-xl font-bold text-white">
              {editingProduct ? "Edit Product" : "Add New Item"}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Product Name"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white"
              />
              <select
                value={newProdCategory}
                onChange={(e) => setNewProdCategory(e.target.value as any)}
                className="w-full rounded-xl border border-white/10 bg-[#161c2e] p-2.5 text-white"
              >
                <option value="accessory">Accessory</option>
                <option value="service">Service</option>
              </select>
              <input
                type="number"
                required
                placeholder="Price (₹)"
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white"
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={newProdStock}
                onChange={(e) => setNewProdStock(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white"
              />
              <textarea
                placeholder="Description"
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-black"
                >
                  {editingProduct ? "Update Item" : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default AdminPage;
