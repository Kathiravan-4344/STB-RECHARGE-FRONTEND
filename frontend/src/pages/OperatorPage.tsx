import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  useStore,
  approveTxn,
  logout,
  formatName,
  updateProductStatus,
  upsertProduct,
  updateComplaintStatus,
  setState,
  type ProductRequest,
  type Product,
  type ProductRequestStatus,
  type Complaint,
  type ComplaintStatus,
} from "../services/store";
import {
  Tv,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Shield,
  Zap,
  AlertTriangle,
  Package,
  Wrench,
  Truck,
  Phone,
  Plus,
  Edit3,
  Check,
  X,
  ShoppingBag,
  MessageCircle,
  Car,
} from "lucide-react";

function ProductStatusBadge({ status }: { status: ProductRequestStatus }) {
  switch (status) {
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> 🟡 Pending
        </span>
      );
    case "Processing":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" /> 🔵 Processing
        </span>
      );
    case "Out for Delivery":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
          <Truck className="h-3.5 w-3.5" /> 🚚 Out for Delivery
        </span>
      );
    case "Installation Scheduled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-[color:var(--neon-cyan)]">
          <Wrench className="h-3.5 w-3.5" /> 🛠️ Installation Scheduled
        </span>
      );
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> 🟢 Completed
        </span>
      );
    case "Not Available":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
          <AlertTriangle className="h-3.5 w-3.5" /> 🔴 Not Available
        </span>
      );
    default:
      return null;
  }
}

function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  switch (status) {
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> 🟡 Pending
        </span>
      );
    case "Assigned":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" /> 🔵 Assigned
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
          <Car className="h-3.5 w-3.5 animate-bounce text-amber-400" /> 🟠 In Progress
        </span>
      );
    case "Resolved":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> 🟢 Resolved
        </span>
      );
    default:
      return null;
  }
}

export function OperatorPage() {
  const user = useStore((s) => s.user);
  const txns = useStore((s) => s.txns);
  const products = useStore((s) => s.products);
  const productRequests = useStore((s) => s.productRequests);
  const complaints = useStore((s) => s.complaints);
  const navigate = useNavigate();

  // Navigation Menu Tabs: "txns" | "product_requests" | "stock" | "complaints"
  const [activeMenu, setActiveMenu] = useState<
    "txns" | "product_requests" | "stock" | "complaints"
  >("txns");

  // Search & filter state for txns
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "success" | "failed">("all");

  // Search & Filter state for product requests
  const [productReqSearch, setProductReqSearch] = useState("");
  const [productReqStatusFilter, setProductReqStatusFilter] = useState<string>("all");

  // Search & Filter state for complaints
  const [complaintSearch, setComplaintSearch] = useState("");
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<string>("all");

  // Scheduling Product Modal State
  const [schedulingReq, setSchedulingReq] = useState<ProductRequest | null>(null);
  const [techName, setTechName] = useState("Ramesh Kumar");
  const [techPhone, setTechPhone] = useState("9840192837");
  const [schedDate, setSchedDate] = useState("Tomorrow at 11:00 AM");

  // Complaint Technician Assignment Modal State
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [cmpTechName, setCmpTechName] = useState("Ramesh Kumar");
  const [cmpTechPhone, setCmpTechPhone] = useState("9840192837");
  const [cmpExpectedArrival, setCmpExpectedArrival] = useState("In 20 Minutes");

  // Edit Stock State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editStockVal, setEditStockVal] = useState<number>(0);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);

  // Add Product Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<"accessory" | "service">("accessory");
  const [newProdPrice, setNewProdPrice] = useState<number>(150);
  const [newProdStock, setNewProdStock] = useState<number>(10);
  const [newProdDesc, setNewProdDesc] = useState("");

  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user || (user.role !== "operator" && user.role !== "admin")) {
      navigate({ to: "/" });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Summary counts
  const totalCount = txns.length;
  const pendingCount = txns.filter((t) => t.status === "pending").length;
  const approvedCount = txns.filter((t) => t.status === "success").length;
  const failedCount = txns.filter((t) => t.status === "failed").length;

  const pendingProductReqsCount = productRequests.filter((r) => r.status === "Pending").length;
  const lowStockCount = products.filter(
    (p) => p.category === "accessory" && p.availableStock <= 5,
  ).length;
  const pendingComplaintsCount = complaints.filter(
    (c) => c.status === "Pending" || c.status === "Assigned" || c.status === "In Progress",
  ).length;

  // Filtered transactions
  const filteredTxns = txns.filter((t) => {
    const matchesSearch =
      (t.stbId && t.stbId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.customerMobile && t.customerMobile.includes(searchTerm)) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.id && t.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" ? true : t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Product Requests
  const filteredProductRequests = productRequests.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(productReqSearch.toLowerCase()) ||
      r.stbId.toLowerCase().includes(productReqSearch.toLowerCase()) ||
      r.productName.toLowerCase().includes(productReqSearch.toLowerCase()) ||
      r.customerMobile.includes(productReqSearch);
    const matchesStatus =
      productReqStatusFilter === "all" ? true : r.status === productReqStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.customerName.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.stbId.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.issueType.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.customerMobile.includes(complaintSearch);
    const matchesStatus =
      complaintStatusFilter === "all" ? true : c.status === complaintStatusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleRejectTxn(id: string) {
    const updated = txns.map((t) => (t.id === id ? { ...t, status: "failed" as const } : t));
    setState({ txns: updated });
  }

  function handleSaveStockUpdate() {
    if (!editingProduct) return;
    upsertProduct({
      id: editingProduct.id,
      name: editingProduct.name,
      availableStock: editStockVal,
      price: editPriceVal,
    });
    setEditingProduct(null);
  }

  function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newProdName.trim()) return;
    upsertProduct({
      id: "prod-" + Date.now(),
      name: newProdName.trim(),
      category: newProdCategory,
      price: Number(newProdPrice),
      availableStock: Number(newProdStock),
      description: newProdDesc.trim(),
    });
    setShowAddProduct(false);
    setNewProdName("");
    setNewProdDesc("");
  }

  function handleScheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schedulingReq) return;
    updateProductStatus(schedulingReq.id, {
      status: "Installation Scheduled",
      technicianName: techName,
      technicianMobile: techPhone,
      scheduledDate: schedDate,
    });
    setSchedulingReq(null);
  }

  function handleAssignComplaintSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assigningComplaint) return;
    updateComplaintStatus(assigningComplaint.id, {
      status: "Assigned",
      technicianName: cmpTechName.trim(),
      technicianMobile: cmpTechPhone.trim(),
      expectedArrival: cmpExpectedArrival.trim(),
      assignedAt: new Date().toISOString(),
    });
    setAssigningComplaint(null);
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-foreground font-sans selection:bg-primary/30 selection:text-primary">
      {/* Floating background glowing orbs */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-[color:var(--neon-purple)]/20 blur-3xl animate-float" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0e17]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-primary shadow-[0_0_20px_rgba(0,210,255,0.4)]">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-white flex items-center gap-2">
                STB RECHARGE
                <span className="rounded-md border border-[color:var(--neon-cyan)]/40 bg-[color:var(--neon-cyan)]/10 px-2 py-0.5 text-[10px] uppercase font-bold text-[color:var(--neon-cyan)]">
                  Operator Control Center
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>
                  Logged in:{" "}
                  <strong className="font-normal text-white">
                    {formatName(user.name || "Operator Admin")}
                  </strong>{" "}
                  ({user.operatorNumber || "OP-ADMIN"} · +91 {user.mobile})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[color:var(--neon-cyan)]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--neon-cyan)] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--neon-cyan)]"></span>
                  </span>
                  Live Sync Active
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setNow(Date.now())}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Sync Now
            </button>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Top greeting & Navigation Menu Tabs */}
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--neon-cyan)] font-extrabold">
              Welcome back, Operator
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Hi{" "}
              <span className="font-normal text-white">
                {formatName(user.name || "Operator Admin")}
              </span>{" "}
              👋
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Manage recharge transactions, product requests, stock inventory & customer service
              complaints.
            </p>
          </div>

          {/* Operator Panel Navigation Menu Tabs */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveMenu("txns")}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
                activeMenu === "txns"
                  ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Zap className="h-4 w-4" /> Recharge Txns ({pendingCount})
            </button>

            <button
              onClick={() => setActiveMenu("product_requests")}
              className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
                activeMenu === "product_requests"
                  ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Package className="h-4 w-4" /> 📦 Product Requests
              {pendingProductReqsCount > 0 && (
                <span className="ml-1 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[10px] font-black text-black">
                  {pendingProductReqsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu("stock")}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
                activeMenu === "stock"
                  ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <ShoppingBag className="h-4 w-4" /> Stock Management
              {lowStockCount > 0 && (
                <span className="ml-1 rounded-full bg-amber-500/30 border border-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                  ⚠️ {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu("complaints")}
              className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
                activeMenu === "complaints"
                  ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Wrench className="h-4 w-4" /> 🔧 Complaint Management
              {pendingComplaintsCount > 0 && (
                <span className="ml-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-black">
                  {pendingComplaintsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* MENU 1: Recharge Transactions View */}
        {activeMenu === "txns" && (
          <>
            {/* Summary Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d121f]/90 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                    Total Requests
                  </span>
                  <Tv className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-4 font-display text-4xl font-black text-white">{totalCount}</div>
                <div className="mt-1 text-xs text-muted-foreground">All customer transactions</div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-[#0d121f]/90 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest font-semibold text-yellow-400/90">
                    Pending
                  </span>
                  <Clock className="h-5 w-5 text-yellow-400 animate-pulse" />
                </div>
                <div className="mt-4 font-display text-4xl font-black text-yellow-400">
                  {pendingCount}
                </div>
                <div className="mt-1 text-xs text-yellow-400/70">Awaiting operator action</div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#0d121f]/90 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest font-semibold text-emerald-400/90">
                    Approved
                  </span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="mt-4 font-display text-4xl font-black text-emerald-400">
                  {approvedCount}
                </div>
                <div className="mt-1 text-xs text-emerald-400/70">Successfully activated</div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-red-500/20 bg-[#0d121f]/90 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest font-semibold text-red-400/90">
                    Failed
                  </span>
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="mt-4 font-display text-4xl font-black text-red-400">
                  {failedCount}
                </div>
                <div className="mt-1 text-xs text-red-400/70">Rejected or cancelled</div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="mb-6 rounded-3xl border border-white/10 bg-[#0d121f]/80 p-4 backdrop-blur-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search STB ID, Customer Name, Mobile or Txn ID..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-[color:var(--neon-cyan)]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  {(["all", "pending", "success", "failed"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
                        statusFilter === st
                          ? "bg-white/20 text-white"
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Txn Table */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d121f]/90 backdrop-blur-xl shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-muted-foreground">
                  <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-slate-300">
                    <tr>
                      <th className="px-6 py-4 font-bold">Transaction ID</th>
                      <th className="px-6 py-4 font-bold">STB ID & Customer</th>
                      <th className="px-6 py-4 font-bold">Plan Name</th>
                      <th className="px-6 py-4 font-bold">Amount</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTxns.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      filteredTxns.map((t) => (
                        <tr key={t.id} className="hover:bg-white/5 transition">
                          <td className="px-6 py-4 font-mono font-bold text-white">{t.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">
                              {t.customerName || "Customer"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              STB: {t.stbId} · +91 {t.customerMobile}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-white">{t.planName}</td>
                          <td className="px-6 py-4 font-mono font-bold text-[color:var(--neon-cyan)]">
                            ₹{t.amount}
                          </td>
                          <td className="px-6 py-4">
                            {t.status === "pending" && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
                                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />{" "}
                                Pending Approval
                              </span>
                            )}
                            {t.status === "success" && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                              </span>
                            )}
                            {t.status === "failed" && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
                                <XCircle className="h-3.5 w-3.5" /> Rejected
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {t.status === "pending" ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => approveTxn(t.id)}
                                  className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400"
                                >
                                  <Check className="h-3.5 w-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => handleRejectTxn(t.id)}
                                  className="flex items-center gap-1 rounded-xl bg-red-500/20 border border-red-500/40 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30"
                                >
                                  <X className="h-3.5 w-3.5" /> Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 font-mono">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* MENU 2: Product & Service Requests View */}
        {activeMenu === "product_requests" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#0d121f]/80 p-4 backdrop-blur-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={productReqSearch}
                    onChange={(e) => setProductReqSearch(e.target.value)}
                    placeholder="Search Customer Name, STB ID, Product Name, or Mobile..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-[color:var(--neon-cyan)]"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-400 font-bold">Status Filter:</span>
                  {[
                    "all",
                    "Pending",
                    "Processing",
                    "Out for Delivery",
                    "Installation Scheduled",
                    "Completed",
                    "Not Available",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setProductReqStatusFilter(s)}
                      className={`rounded-xl px-3 py-1.5 font-bold transition ${
                        productReqStatusFilter === s
                          ? "bg-[color:var(--neon-cyan)]/20 text-[color:var(--neon-cyan)] border border-[color:var(--neon-cyan)]/40"
                          : "bg-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredProductRequests.length === 0 ? (
                <div className="md:col-span-2 rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-3 font-display text-lg font-bold text-white">
                    No product requests found
                  </h3>
                </div>
              ) : (
                filteredProductRequests.map((req) => {
                  const targetProd = products.find((p) => p.id === req.productId);
                  const isStockAvailable = targetProd ? targetProd.availableStock > 0 : true;

                  return (
                    <div
                      key={req.id}
                      className="rounded-3xl border border-white/15 bg-[#0d121f]/90 p-6 backdrop-blur-xl shadow-xl space-y-4 hover:border-white/30 transition"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                        <div>
                          <div className="text-[11px] font-mono font-bold text-[color:var(--neon-cyan)]">
                            REQ ID: {req.id}
                          </div>
                          <h3 className="font-display text-xl font-bold text-white mt-0.5">
                            {req.customerName}
                          </h3>
                          <div className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                            <span>
                              STB ID: <strong className="text-white font-mono">{req.stbId}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Mobile: <strong className="text-white">{req.customerMobile}</strong>
                            </span>
                          </div>
                        </div>
                        <ProductStatusBadge status={req.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/5 p-4 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                            Product / Service
                          </span>
                          <strong className="text-white font-display text-sm">
                            {req.productName}
                          </strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                            Stock Availability
                          </span>
                          <strong
                            className={
                              isStockAvailable ? "text-emerald-400" : "text-red-400 font-bold"
                            }
                          >
                            {req.category === "service"
                              ? "Service Available"
                              : isStockAvailable
                                ? `In Stock (${targetProd?.availableStock} avail)`
                                : "⚠️ Out of Stock"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                            Quantity & Price
                          </span>
                          <strong className="text-white">
                            {req.quantity} x ₹{req.unitPrice}
                          </strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                            Total Price
                          </span>
                          <strong className="text-[color:var(--neon-cyan)] text-sm font-mono">
                            ₹{req.totalAmount}
                          </strong>
                        </div>
                      </div>

                      {req.description && (
                        <div className="text-xs text-slate-300 bg-black/30 p-3 rounded-xl border border-white/5">
                          <strong className="text-muted-foreground">Requirement Notes: </strong>{" "}
                          {req.description}
                        </div>
                      )}

                      {req.imageUrl && (
                        <div className="flex items-center gap-3">
                          <img
                            src={req.imageUrl}
                            alt="Attached"
                            className="h-16 w-16 rounded-xl object-cover border border-white/20"
                          />
                          <span className="text-xs text-slate-400">Attached photo</span>
                        </div>
                      )}

                      <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-white/10">
                        <a
                          href={`tel:${req.customerMobile}`}
                          className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
                        >
                          <Phone className="h-3.5 w-3.5 text-emerald-400" /> Call
                        </a>

                        <a
                          href={`https://wa.me/91${req.customerMobile}?text=Hi%20${encodeURIComponent(req.customerName)},%20regarding%20your%20request%20${encodeURIComponent(req.productName)}...`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </a>

                        {req.status === "Pending" && (
                          <button
                            onClick={() =>
                              updateProductStatus(req.id, {
                                status: req.category === "service" ? "Processing" : "Out for Delivery",
                              })
                            }
                            className="flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-md"
                          >
                            <Check className="h-3.5 w-3.5" /> Accept Request
                          </button>
                        )}

                        {req.category === "service" && req.status !== "Completed" && (
                          <button
                            onClick={() => setSchedulingReq(req)}
                            className="flex items-center gap-1 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-[color:var(--neon-cyan)] hover:bg-cyan-500/20"
                          >
                            <Wrench className="h-3.5 w-3.5" /> Schedule Tech
                          </button>
                        )}

                        {req.status !== "Completed" && (
                          <button
                            onClick={() => updateProductStatus(req.id, { status: "Completed" })}
                            className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-black hover:bg-emerald-400 shadow-md"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                          </button>
                        )}

                        {req.status !== "Not Available" && req.status !== "Completed" && (
                          <button
                            onClick={() => updateProductStatus(req.id, { status: "Not Available" })}
                            className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20"
                          >
                            <X className="h-3.5 w-3.5" /> Not Available
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* MENU 3: Stock & Inventory Management View */}
        {activeMenu === "stock" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 rounded-3xl border border-white/10 bg-[#0d121f]/80 p-5 backdrop-blur-xl">
              <div>
                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  📦 Operator Stock & Inventory Management
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Maintain product availability, update price & stock quantity.
                </p>
              </div>

              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-105"
              >
                <Plus className="h-4 w-4" /> Add New Product / Service
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d121f]/90 backdrop-blur-xl shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <tbody className="divide-y divide-white/5">
                    <tr className="bg-white/5 text-xs uppercase text-slate-300 font-bold border-b border-white/10">
                      <td className="px-6 py-4">Product Name</td>
                      <td className="px-6 py-4">Category</td>
                      <td className="px-6 py-4">Price</td>
                      <td className="px-6 py-4">Available Stock</td>
                      <td className="px-6 py-4">Sold Quantity</td>
                      <td className="px-6 py-4">Remaining Stock</td>
                      <td className="px-6 py-4 text-right">Actions</td>
                    </tr>

                    {products.map((p) => {
                      const isLowStock = p.category === "accessory" && p.availableStock <= 5;
                      return (
                        <tr key={p.id} className="hover:bg-white/5 transition">
                          <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                            {p.category === "service" ? (
                              <Wrench className="h-4 w-4 text-[color:var(--neon-purple)]" />
                            ) : (
                              <Package className="h-4 w-4 text-[color:var(--neon-cyan)]" />
                            )}
                            <div>
                              <div>{p.name}</div>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {p.description}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span
                              className={`capitalize rounded-full px-2.5 py-0.5 font-bold ${
                                p.category === "service"
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "bg-cyan-500/20 text-cyan-300"
                              }`}
                            >
                              {p.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-white">₹{p.price}</td>
                          <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                            {p.availableStock}
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-400">{p.soldQuantity}</td>
                          <td className="px-6 py-4">
                            {p.category === "accessory" ? (
                              isLowStock ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                                  ⚠️ Low Stock ({p.availableStock} left)
                                </span>
                              ) : (
                                <span className="font-mono text-emerald-400 font-bold">
                                  {p.availableStock} units
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-purple-300 font-medium">
                                Service Available
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setEditStockVal(p.availableStock);
                                setEditPriceVal(p.price);
                              }}
                              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/15"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-[color:var(--neon-cyan)]" /> Edit
                              Price / Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MENU 4: Complaint Management View */}
        {activeMenu === "complaints" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#0d121f]/80 p-4 backdrop-blur-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={complaintSearch}
                    onChange={(e) => setComplaintSearch(e.target.value)}
                    placeholder="Search Complaint ID, Customer Name, STB ID, Category or Mobile..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-400 font-bold">Status Filter:</span>
                  {["all", "Pending", "Assigned", "In Progress", "Resolved"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setComplaintStatusFilter(s)}
                      className={`rounded-xl px-3 py-1.5 font-bold transition ${
                        complaintStatusFilter === s
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Complaints List Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredComplaints.length === 0 ? (
                <div className="md:col-span-2 rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
                  <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-3 font-display text-lg font-bold text-white">
                    No complaints found
                  </h3>
                </div>
              ) : (
                filteredComplaints.map((cmp) => (
                  <div
                    key={cmp.id}
                    className="rounded-3xl border border-white/15 bg-[#0d121f]/90 p-6 backdrop-blur-xl shadow-xl space-y-4 hover:border-white/30 transition"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <div className="text-[11px] font-mono font-bold text-amber-400">
                          CMP ID: {cmp.id}
                        </div>
                        <h3 className="font-display text-xl font-bold text-white mt-0.5">
                          {cmp.customerName}
                        </h3>
                        <div className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                          <span>
                            STB ID: <strong className="text-white font-mono">{cmp.stbId}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Mobile: <strong className="text-white">{cmp.customerMobile}</strong>
                          </span>
                        </div>
                      </div>
                      <ComplaintStatusBadge status={cmp.status} />
                    </div>

                    <div className="rounded-2xl bg-white/5 p-3.5 text-xs space-y-1">
                      <div className="text-amber-400 font-bold uppercase text-[10px]">
                        Issue Type & Category
                      </div>
                      <div className="text-white font-display text-base font-bold">
                        {cmp.category} – {cmp.issueType}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">
                        Preferred Time: <strong className="text-white">{cmp.preferredTime}</strong>{" "}
                        · Created {new Date(cmp.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-black/30 p-3 rounded-xl border border-white/5">
                      <strong className="text-muted-foreground">Description: </strong>{" "}
                      {cmp.description}
                    </div>

                    {cmp.mediaUrl && (
                      <div className="flex items-center gap-3">
                        <img
                          src={cmp.mediaUrl}
                          alt="Complaint Media"
                          className="h-16 w-16 rounded-xl object-cover border border-white/20"
                        />
                        <span className="text-xs text-slate-400">Uploaded image/video proof</span>
                      </div>
                    )}

                    {/* Technician details if assigned */}
                    {cmp.technicianName && (
                      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-white space-y-1">
                        <div className="font-bold text-[color:var(--neon-cyan)] flex items-center gap-1.5">
                          <Car className="h-4 w-4 text-cyan-400" /> Assigned Technician Details
                        </div>
                        <div>
                          Name: <strong>{cmp.technicianName}</strong> (+91 {cmp.technicianMobile})
                        </div>
                        <div>
                          Expected Arrival:{" "}
                          <strong className="text-emerald-400">
                            {cmp.expectedArrival || "In 20 Minutes"}
                          </strong>
                        </div>
                      </div>
                    )}

                    {cmp.rating && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                        <strong>Customer Star Rating: </strong> ⭐ {cmp.rating}/5 – "{cmp.feedback}"
                      </div>
                    )}

                    {/* Operator Complaint Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-white/10">
                      <a
                        href={`tel:${cmp.customerMobile}`}
                        className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
                      >
                        <Phone className="h-3.5 w-3.5 text-emerald-400" /> Call
                      </a>

                      <a
                        href={`https://wa.me/91${cmp.customerMobile}?text=Hello%20${encodeURIComponent(cmp.customerName)},%20regarding%20your%20STB%20complaint%20${encodeURIComponent(cmp.id)}...`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>

                      {cmp.status === "Pending" && (
                        <button
                          onClick={() => updateComplaintStatus(cmp.id, { status: "Assigned" })}
                          className="flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-md"
                        >
                          <Check className="h-3.5 w-3.5" /> ✅ Accept Complaint
                        </button>
                      )}

                      {cmp.status !== "Resolved" && (
                        <button
                          onClick={() => {
                            setAssigningComplaint(cmp);
                            setCmpTechName(cmp.technicianName || "Ramesh Kumar");
                            setCmpTechPhone(cmp.technicianMobile || "9840192837");
                            setCmpExpectedArrival(cmp.expectedArrival || "In 20 Minutes");
                          }}
                          className="flex items-center gap-1 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20"
                        >
                          <Car className="h-3.5 w-3.5" /> 👨‍🔧 Assign Technician
                        </button>
                      )}

                      {cmp.status !== "Resolved" && (
                        <button
                          onClick={() => updateComplaintStatus(cmp.id, { status: "Resolved" })}
                          className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-black hover:bg-emerald-400 shadow-md"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> 🟢 Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal 1: Assign Technician to Complaint Modal */}
      {assigningComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0d121f] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Car className="h-5 w-5 text-amber-400" /> Assign Technician to Complaint
              </h3>
              <button
                onClick={() => setAssigningComplaint(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignComplaintSubmit} className="space-y-3 text-xs">
              <div className="rounded-xl bg-white/5 p-3 text-white">
                <strong>{assigningComplaint.customerName}</strong> (
                {assigningComplaint.customerMobile})<br />
                Complaint: {assigningComplaint.category} – {assigningComplaint.issueType}
                <br />
                STB ID: {assigningComplaint.stbId}
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Technician Full Name</label>
                <input
                  type="text"
                  required
                  value={cmpTechName}
                  onChange={(e) => setCmpTechName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Technician Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={cmpTechPhone}
                  onChange={(e) => setCmpTechPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Expected Arrival Time</label>
                <input
                  type="text"
                  required
                  value={cmpExpectedArrival}
                  onChange={(e) => setCmpExpectedArrival(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningComplaint(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-extrabold text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                >
                  Assign & Dispatch Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Schedule Product Modal */}
      {schedulingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0d121f] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Wrench className="h-5 w-5 text-[color:var(--neon-cyan)]" /> Schedule Product
                Technician
              </h3>
              <button
                onClick={() => setSchedulingReq(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div className="rounded-xl bg-white/5 p-3 text-white">
                <strong>{schedulingReq.customerName}</strong> ({schedulingReq.customerMobile})<br />
                Service: {schedulingReq.productName} · STB: {schedulingReq.stbId}
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Assign Technician Name
                </label>
                <input
                  type="text"
                  required
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-[color:var(--neon-cyan)]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Technician Mobile</label>
                <input
                  type="text"
                  required
                  value={techPhone}
                  onChange={(e) => setTechPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-[color:var(--neon-cyan)]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Scheduled Date & Time Slot
                </label>
                <input
                  type="text"
                  required
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-[color:var(--neon-cyan)]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSchedulingReq(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl gradient-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0d121f] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-[color:var(--neon-cyan)]" /> Update Stock & Price
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  readOnly
                  value={editingProduct.name}
                  className="w-full rounded-xl border border-white/10 bg-white/10 p-2.5 text-sm font-bold text-white outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Update Price (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editPriceVal}
                  onChange={(e) => setEditPriceVal(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-[color:var(--neon-cyan)]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Available Stock Quantity
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editStockVal}
                  onChange={(e) => setEditStockVal(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-[color:var(--neon-cyan)]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStockUpdate}
                  className="rounded-xl gradient-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  Save Stock Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Add New Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0d121f] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-[color:var(--neon-cyan)]" /> Add New Inventory Product
              </h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optical HDMI Cable"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-[color:var(--neon-cyan)]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value as "accessory" | "service")}
                  className="w-full rounded-xl border border-white/10 bg-[#161c2e] p-2.5 text-sm text-white outline-none focus:border-[color:var(--neon-cyan)]"
                >
                  <option value="accessory">📦 Accessory</option>
                  <option value="service">🔧 Installation Service</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-[color:var(--neon-cyan)]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-[color:var(--neon-cyan)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of the product or service..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-[color:var(--neon-cyan)]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl gradient-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OperatorPage;
