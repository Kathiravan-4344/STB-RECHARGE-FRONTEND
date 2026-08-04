import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import {
  useStore,
  upsertOperator,
  setOperatorActive,
  removeApprovedOperator,
  refreshAdminData,
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
  | "products";

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
    } else {
      refreshAdminData();
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  // Handlers
  async function handleAddOperator(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!opMobile.trim() || !opName.trim()) return;
    const res = await upsertOperator(opMobile, opName);
    if (res.success) {
      setMsg({ text: `Operator ${opName} added and saved to database successfully!` });
    } else {
      setMsg({ text: res.message || `Failed to save operator to database.`, error: true });
    }
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
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#CBD5E1] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#2563EB] text-white font-bold shadow-md shadow-blue-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-[#0F172A]">Super Admin Portal</h1>
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-[#2563EB] border border-blue-200 uppercase tracking-wider">
                MASTER CONTROL
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1 font-medium">
              Logged in as 👑 <strong>Kathiravan V</strong> (9080864542) • Master Administrative Rights
            </p>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`mb-6 flex items-center justify-between rounded-xl p-4 text-xs font-bold ${
            msg.error
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-[#0F172A] hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {/* GLOBAL TAB FIX (Inactive #E2E8F0 / Active #2563EB) */}
      <div className="mb-6 flex gap-1.5 overflow-x-auto no-scrollbar rounded-xl border border-[#CBD5E1] bg-[#F1F5F9] p-1.5 shadow-sm">
        {[
          { id: "dashboard", label: "📊 Overview", icon: Zap },
          { id: "operators", label: "🛡️ Operators", icon: Shield },
          { id: "customers", label: "👥 Customers", icon: Users },
          { id: "recharges", label: "💳 Recharges", icon: CreditCard },
          { id: "complaints", label: "🔧 Complaints", icon: Wrench },
          { id: "products", label: "📦 Products", icon: Package },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as TabType)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ease-in-out whitespace-nowrap ${
              tab === t.id
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                : "bg-[#E2E8F0] text-[#334155] hover:bg-slate-300/70 hover:text-[#0F172A]"
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
              className="cursor-pointer group rounded-2xl border border-[#CBD5E1] bg-white p-6 shadow-sm hover:border-[#2563EB] transition"
            >
              <div className="flex items-center justify-between text-xs text-[#64748B] uppercase font-bold">
                <span>Total Revenue</span>
                <CreditCard className="h-5 w-5 text-[#2563EB]" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-[#2563EB] font-mono">
                ₹{totalRechargeAmount}
              </div>
              <div className="mt-1 text-xs text-[#64748B]">All successful recharges</div>
            </div>

            <div
              onClick={() => setTab("operators")}
              className="cursor-pointer group rounded-2xl border border-[#CBD5E1] bg-white p-6 shadow-sm hover:border-[#2563EB] transition"
            >
              <div className="flex items-center justify-between text-xs text-[#64748B] uppercase font-bold">
                <span>Approved Operators</span>
                <Shield className="h-5 w-5 text-[#2563EB]" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-[#0F172A]">
                {approvedOperators.length}
              </div>
              <div className="mt-1 text-xs text-[#64748B]">Active operator accounts</div>
            </div>

            <div
              onClick={() => setTab("recharges")}
              className="cursor-pointer group rounded-2xl border border-[#CBD5E1] bg-white p-6 shadow-sm hover:border-amber-400 transition"
            >
              <div className="flex items-center justify-between text-xs text-amber-700 uppercase font-bold">
                <span>Pending Approvals</span>
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-amber-600">
                {pendingRechargesCount}
              </div>
              <div className="mt-1 text-xs text-amber-700">Awaiting operator signoff</div>
            </div>

            <div
              onClick={() => setTab("complaints")}
              className="cursor-pointer group rounded-2xl border border-[#CBD5E1] bg-white p-6 shadow-sm hover:border-[#2563EB] transition"
            >
              <div className="flex items-center justify-between text-xs text-[#64748B] uppercase font-bold">
                <span>Open Complaints</span>
                <Wrench className="h-5 w-5 text-[#2563EB]" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-[#2563EB]">
                {pendingComplaintsCount}
              </div>
              <div className="mt-1 text-xs text-[#64748B]">Needs technician dispatch</div>
            </div>
          </div>

          {/* Quick Nav Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              onClick={() => setTab("operators")}
              className="cursor-pointer rounded-2xl border border-[#CBD5E1] bg-white p-5 hover:border-[#2563EB] shadow-sm transition space-y-1.5"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-[#2563EB]" />
                <h3 className="font-bold text-[#0F172A] text-base">Manage Operators</h3>
              </div>
              <p className="text-xs text-[#64748B]">
                Add, activate, or deactivate operator whitelist access.
              </p>
            </div>

            <div
              onClick={() => setTab("customers")}
              className="cursor-pointer rounded-2xl border border-[#CBD5E1] bg-white p-5 hover:border-[#2563EB] shadow-sm transition space-y-1.5"
            >
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-[#2563EB]" />
                <h3 className="font-bold text-[#0F172A] text-base">Customer Database</h3>
              </div>
              <p className="text-xs text-[#64748B]">
                View customer profiles, STB IDs, and block/unblock users.
              </p>
            </div>

            <div
              onClick={() => setTab("products")}
              className="cursor-pointer rounded-2xl border border-[#CBD5E1] bg-white p-5 hover:border-[#2563EB] shadow-sm transition space-y-1.5"
            >
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-[#2563EB]" />
                <h3 className="font-bold text-[#0F172A] text-base">Product Inventory</h3>
              </div>
              <p className="text-xs text-[#64748B]">
                Manage accessories, services, price & available stock.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Approved Operators */}
      {tab === "operators" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#CBD5E1] bg-white p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#2563EB]" /> ADD NEW OPERATOR
              </h2>
              <span className="text-xs text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 font-bold">
                Whitelist Login
              </span>
            </div>

            <form
              onSubmit={handleAddOperator}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1.5">
                  Operator Full Name
                </label>
                <input
                  type="text"
                  required
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1.5">
                  Mobile Number / Email
                </label>
                <input
                  type="text"
                  required
                  value={opMobile}
                  onChange={(e) => setOpMobile(e.target.value)}
                  placeholder="e.g. 9840192837 or op@stb.com"
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                className="h-10 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-6 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                + ADD OPERATOR
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-[#0F172A]">
              <thead className="border-b border-[#CBD5E1] bg-[#F8FAFC] text-xs uppercase text-[#64748B] font-bold">
                <tr>
                  <th className="px-6 py-4">Operator Name</th>
                  <th className="px-6 py-4">Contact (Mobile/Email)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD5E1]">
                {approvedOperators.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-[#0F172A]">{op.name}</td>
                    <td className="px-6 py-4 font-mono">{op.mobile}</td>
                    <td className="px-6 py-4">
                      {op.active ? (
                        <span className="text-[#22C55E] font-bold text-xs">🟢 Active</span>
                      ) : (
                        <span className="text-red-600 font-bold text-xs">🔴 Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedOperator(op)}
                        className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#2563EB] hover:bg-slate-100"
                      >
                        <Eye className="h-3.5 w-3.5 inline mr-1" /> View Details
                      </button>
                      <button
                        onClick={() => setOperatorActive(op.id, !op.active)}
                        className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#0F172A] hover:bg-slate-100"
                      >
                        Toggle Status
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove operator "${op.name}"?`)) {
                            removeApprovedOperator(op.id);
                            setMsg({ text: `Operator ${op.name} removed successfully.` });
                          }
                        }}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5 inline mr-1" /> Remove
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
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-4 flex justify-between items-center gap-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customers..."
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl py-2 pl-10 pr-4 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-[#0F172A]">
              <thead className="border-b border-[#CBD5E1] bg-[#F8FAFC] text-xs uppercase text-[#64748B] font-bold">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">STB ID</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD5E1]">
                {filteredCustomers.map((c, i) => {
                  const isBlocked =
                    blockedCustomers.includes(c.mobile) || blockedCustomers.includes(c.stbId);
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-bold text-[#0F172A]">{c.name}</td>
                      <td className="px-6 py-4 font-mono">{c.mobile}</td>
                      <td className="px-6 py-4 font-mono">{c.stbId}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            if (isBlocked) unblockCustomer(c.mobile);
                            else blockCustomer(c.mobile);
                          }}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                            isBlocked
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-red-100 text-red-800 border border-red-300"
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
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                value={rechargeSearch}
                onChange={(e) => setRechargeSearch(e.target.value)}
                placeholder="Search transaction ID, customer, STB..."
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Filter className="h-4 w-4 text-[#64748B]" />
              {["all", "pending", "success", "failed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setRechargeStatusFilter(st)}
                  className={`rounded-lg px-3 py-1.5 font-bold capitalize transition ${
                    rechargeStatusFilter === st
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#E2E8F0] text-[#334155] hover:bg-slate-300"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-[#0F172A]">
              <thead className="border-b border-[#CBD5E1] bg-[#F8FAFC] text-xs uppercase text-[#64748B] font-bold">
                <tr>
                  <th className="px-6 py-4">Txn ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD5E1]">
                {filteredTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-[#0F172A]">{t.id}</td>
                    <td className="px-6 py-4 font-bold">{t.customerName || "Customer"}</td>
                    <td className="px-6 py-4">{t.planName}</td>
                    <td className="px-6 py-4 font-mono text-[#2563EB] font-bold">₹{t.amount}</td>
                    <td className="px-6 py-4 capitalize font-bold">
                      {t.status === "pending" && (
                        <span className="text-amber-600">🟡 Pending</span>
                      )}
                      {t.status === "success" && (
                        <span className="text-[#22C55E]">🟢 Success</span>
                      )}
                      {t.status === "failed" && <span className="text-red-600">🔴 Failed</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {t.status === "pending" && (
                        <button
                          onClick={() => approveTxn(t.id)}
                          className="rounded-xl bg-[#22C55E] hover:bg-[#16A34A] px-3 py-1 text-xs font-bold text-white shadow-sm"
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
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                placeholder="Search complaint ID, customer, category..."
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Filter className="h-4 w-4 text-[#64748B]" />
              {["all", "Pending", "Assigned", "In Progress", "Resolved"].map((st) => (
                <button
                  key={st}
                  onClick={() => setComplaintStatusFilter(st)}
                  className={`rounded-lg px-3 py-1.5 font-bold capitalize transition ${
                    complaintStatusFilter === st
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#E2E8F0] text-[#334155] hover:bg-slate-300"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-[#0F172A]">
              <thead className="border-b border-[#CBD5E1] bg-[#F8FAFC] text-xs uppercase text-[#64748B] font-bold">
                <tr>
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD5E1]">
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono text-[#2563EB] font-bold">{c.id}</td>
                    <td className="px-6 py-4 font-bold">{c.customerName}</td>
                    <td className="px-6 py-4">
                      {c.category} – {c.issueType}
                    </td>
                    <td className="px-6 py-4 font-bold">{c.status}</td>
                    <td className="px-6 py-4 text-right">
                      {c.status !== "Resolved" && (
                        <button
                          onClick={() => updateComplaintStatus(c.id, { status: "Resolved" })}
                          className="rounded-xl bg-[#22C55E] hover:bg-[#16A34A] px-3 py-1 text-xs font-bold text-white shadow-sm"
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
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white border border-[#CBD5E1] rounded-2xl py-2.5 pl-10 pr-4 text-xs text-[#0F172A] outline-none"
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
              className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-5 py-2.5 text-xs font-bold text-white shrink-0 shadow-sm"
            >
              + Add Product
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-[#0F172A]">
              <thead className="border-b border-[#CBD5E1] bg-[#F8FAFC] text-xs uppercase text-[#64748B] font-bold">
                <tr>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD5E1]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-[#0F172A]">{p.name}</td>
                    <td className="px-6 py-4 capitalize">{p.category}</td>
                    <td className="px-6 py-4 font-mono font-bold text-[#22C55E]">₹{p.price}</td>
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
                        className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1 text-xs font-bold text-[#0F172A] hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="rounded-xl border border-red-200 bg-red-50 text-red-600 px-3 py-1 text-xs font-bold hover:bg-red-100"
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

      {/* Selected Operator Modal */}
      {selectedOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#CBD5E1] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
              <h3 className="font-display text-lg font-bold text-[#0F172A]">
                Operator: {selectedOperator.name}
              </h3>
              <button
                onClick={() => setSelectedOperator(null)}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-[#0F172A]">
              <div>Contact: <strong>{selectedOperator.mobile}</strong></div>
              <div>Added Date: <strong>{new Date(selectedOperator.addedAt).toLocaleString()}</strong></div>
              <div>Status: <strong>{selectedOperator.active ? "Active" : "Inactive"}</strong></div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOperator(null)}
                className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#CBD5E1] bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-display text-lg font-bold text-[#0F172A]">
              {editingProduct ? "Edit Product" : "Add New Item"}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Product Name"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-2.5 text-sm text-[#0F172A] outline-none"
              />
              <select
                value={newProdCategory}
                onChange={(e) => setNewProdCategory(e.target.value as "accessory" | "service")}
                className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-2.5 text-sm text-[#0F172A] outline-none"
              >
                <option value="accessory">📦 Accessory</option>
                <option value="service">🔧 Service</option>
              </select>
              <input
                type="number"
                required
                placeholder="Price (₹)"
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-2.5 text-sm text-[#0F172A] outline-none"
              />
              <input
                type="number"
                placeholder="Available Stock"
                value={newProdStock}
                onChange={(e) => setNewProdStock(e.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-2.5 text-sm text-[#0F172A] outline-none"
              />
              <textarea
                placeholder="Description"
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-2.5 text-sm text-[#0F172A] outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2 text-xs font-bold text-[#0F172A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#2563EB] px-5 py-2 text-xs font-bold text-white"
                >
                  Save
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
