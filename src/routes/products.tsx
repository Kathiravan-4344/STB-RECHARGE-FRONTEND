import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  useStore,
  createProductRequest,
  type Product,
  type ProductRequest,
  type ProductRequestStatus,
} from "@/lib/store";
import {
  Package,
  Wrench,
  ShoppingBag,
  Tv,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Upload,
  Plus,
  Minus,
  Check,
  Send,
  X,
  User,
  Phone,
  Shield,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "STB Accessories & Services — STB RECHARGE" },
      {
        name: "description",
        content:
          "Request STB accessories, cables, replacement remotes and book installation services.",
      },
    ],
  }),
  component: ProductsPage,
});

function StatusBadge({ status }: { status: ProductRequestStatus }) {
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
          <AlertCircle className="h-3.5 w-3.5" /> 🔴 Not Available
        </span>
      );
    default:
      return null;
  }
}

function ProductsPage() {
  const user = useStore((s) => s.user);
  const stb = useStore((s) => s.stb);
  const products = useStore((s) => s.products);
  const productRequests = useStore((s) => s.productRequests);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user, navigate]);

  // Tab: "request" or "my_requests"
  const [activeTab, setActiveTab] = useState<"request" | "my_requests">("request");

  // Category filter for form: "all" | "accessory" | "service"
  const [categoryFilter, setCategoryFilter] = useState<"all" | "accessory" | "service">("all");

  // Selection
  const [selectedProductId, setSelectedProductId] = useState<string>("p1");
  const [quantity, setQuantity] = useState<number>(1);
  const [stbIdInput, setStbIdInput] = useState<string>(stb?.id ?? "1234567890");
  const [nameInput, setNameInput] = useState<string>(user?.name || stb?.customerName || "");
  const [mobileInput, setMobileInput] = useState<string>(user?.mobile || "9876543210");
  const [description, setDescription] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Success message state
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Auto update selection if product list changes
  useEffect(() => {
    if (!selectedProduct && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProduct]);

  const unitPrice = selectedProduct?.price ?? 0;
  const totalPrice = unitPrice * quantity;

  // Filtered products list by category
  const filteredProducts = products.filter((p) => {
    if (categoryFilter === "all") return true;
    return p.category === categoryFilter;
  });

  // Filter user's requests by mobile or STB ID
  const userRequests = productRequests.filter(
    (r) =>
      (user?.mobile && r.customerMobile === user.mobile) ||
      (stb?.id && r.stbId === stb.id) ||
      r.customerMobile === mobileInput,
  );

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!stbIdInput.trim()) {
      alert("Please enter a valid STB ID");
      return;
    }

    if (!nameInput.trim()) {
      alert("Please enter Customer Name");
      return;
    }

    if (!mobileInput.trim() || mobileInput.trim().length < 10) {
      alert("Please enter a valid Mobile Number");
      return;
    }

    createProductRequest({
      stbId: stbIdInput.trim(),
      customerName: nameInput.trim(),
      customerMobile: mobileInput.trim(),
      productId: selectedProduct.id,
      quantity,
      description: description.trim(),
      imageUrl: imagePreview || undefined,
    });

    setSuccessMsg(
      `Your request for "${selectedProduct.name}" has been sent to the operator successfully!`,
    );
    setDescription("");
    setImagePreview(null);
    setQuantity(1);

    setTimeout(() => {
      setActiveTab("my_requests");
    }, 1500);
  }

  return (
    <AppShell>
      {/* Top Banner Header */}
      <section className="rounded-3xl glass-strong p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--neon-cyan)]/30 bg-[color:var(--neon-cyan)]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[color:var(--neon-cyan)]">
              <ShoppingBag className="h-3.5 w-3.5" /> Accessories & Service Module
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              🛒 Product & Service Request
            </h1>
            <p className="mt-1.5 text-sm text-slate-300 max-w-xl">
              Need replacement cables, STB remotes, power adapters, or installation setup? Select
              your product, review real-time pricing, and send requests directly to your local
              operator.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("request")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "request"
                  ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Package className="h-4 w-4" /> New Request
            </button>
            <button
              onClick={() => setActiveTab("my_requests")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "my_requests"
                  ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Clock className="h-4 w-4" /> Track Status ({userRequests.length})
            </button>
          </div>
        </div>
      </section>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="rounded-lg p-1 hover:bg-emerald-500/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {activeTab === "request" ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left Column: Product & Service Catalog Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Category Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[color:var(--neon-cyan)]" /> Choose Product or
                Service
              </h2>
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className={`rounded-lg px-3 py-1.5 font-bold transition ${
                    categoryFilter === "all"
                      ? "bg-white/20 text-white"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  All Items
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("accessory")}
                  className={`rounded-lg px-3 py-1.5 font-bold transition ${
                    categoryFilter === "accessory"
                      ? "bg-[color:var(--neon-cyan)]/20 text-[color:var(--neon-cyan)]"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  📦 Accessories
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("service")}
                  className={`rounded-lg px-3 py-1.5 font-bold transition ${
                    categoryFilter === "service"
                      ? "bg-[color:var(--neon-purple)]/20 text-[color:var(--neon-purple)]"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  🔧 Services
                </button>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              {filteredProducts.map((p) => {
                const isSelected = p.id === selectedProductId;
                const isLowStock =
                  p.category === "accessory" && p.availableStock <= 5 && p.availableStock > 0;
                const isOutOfStock = p.category === "accessory" && p.availableStock === 0;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProductId(p.id)}
                    className={`group relative text-left rounded-2xl border p-4 transition-all duration-200 ${
                      isSelected
                        ? "border-[color:var(--neon-cyan)] bg-[color:var(--neon-cyan)]/10 shadow-[0_0_20px_rgba(0,210,255,0.25)]"
                        : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-xl border border-white/10 bg-white/10 p-2 text-white">
                        {p.category === "service" ? (
                          <Wrench className="h-5 w-5 text-[color:var(--neon-purple)]" />
                        ) : (
                          <Package className="h-5 w-5 text-[color:var(--neon-cyan)]" />
                        )}
                      </span>
                      <div className="text-right">
                        <div className="font-display text-lg font-bold text-white">₹{p.price}</div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                          {p.category === "service" ? "Service Fee" : "Unit Price"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 font-display text-base font-bold text-white group-hover:text-[color:var(--neon-cyan)] transition-colors">
                      {p.name}
                    </div>

                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">{p.description}</p>

                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 text-xs">
                      {p.category === "accessory" ? (
                        isOutOfStock ? (
                          <span className="text-red-400 font-bold flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" /> Out of stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            ⚠️ Low Stock: {p.availableStock} left
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" /> In Stock ({p.availableStock})
                          </span>
                        )
                      ) : (
                        <span className="text-[color:var(--neon-purple)] font-medium flex items-center gap-1">
                          🔧 Technician Service
                        </span>
                      )}

                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[color:var(--neon-cyan)]">
                          Selected <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Product Request Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl glass-strong border border-white/15 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    📝 Product Request Form
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Submit request to your operator
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-[color:var(--neon-cyan)]">
                  {selectedProduct?.category === "service" ? "Service" : "Accessory"}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* 1. STB ID Auto Fetch */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    STB ID (Auto fetched)
                  </label>
                  <div className="relative">
                    <Tv className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={stbIdInput}
                      onChange={(e) =>
                        setStbIdInput(e.target.value.replace(/\D/g, "").slice(0, 12))
                      }
                      placeholder="ENTER STB ID"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm font-bold text-white outline-none focus:border-[color:var(--neon-cyan)]"
                    />
                  </div>
                </div>

                {/* 2. Customer Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Customer Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm font-bold text-white outline-none focus:border-[color:var(--neon-cyan)]"
                    />
                  </div>
                </div>

                {/* 3. Mobile Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={mobileInput}
                      onChange={(e) =>
                        setMobileInput(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm font-bold text-white outline-none focus:border-[color:var(--neon-cyan)]"
                    />
                  </div>
                </div>

                {/* 4. Selected Product Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Selected Product / Service
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedProduct?.name || ""}
                    className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 px-3 text-sm font-extrabold text-[color:var(--neon-cyan)] outline-none cursor-not-allowed"
                  />
                </div>

                {/* 5. Quantity counter */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/15 active:scale-95"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-display text-xl font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/15 active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* 6. Requirement Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Requirement Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe issue, room location, or preferred time for installation..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-[color:var(--neon-cyan)]"
                  />
                </div>

                {/* 7. Optional Image Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Upload Image (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 p-3 text-xs font-bold text-slate-300 transition hover:border-[color:var(--neon-cyan)] hover:bg-white/10">
                      <Upload className="h-4 w-4 text-[color:var(--neon-cyan)]" />
                      <span>{imagePreview ? "Change Photo" : "Upload Damage / TV Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-white/20">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setImagePreview(null)}
                          className="absolute top-0 right-0 grid h-4 w-4 place-items-center bg-black/70 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ⭐ 1️⃣ Product Price Display Box */}
                <div className="rounded-2xl border border-[color:var(--neon-cyan)]/30 bg-[color:var(--neon-cyan)]/5 p-4 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--neon-cyan)]">
                    ⭐ Product Price Display
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Product Name:</span>
                    <span className="font-bold text-white">{selectedProduct?.name}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Unit Price:</span>
                    <span className="font-bold text-white">₹{unitPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Quantity:</span>
                    <span className="font-bold text-white">{quantity}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 font-display text-base font-extrabold text-white">
                    <span>Total Amount:</span>
                    <span className="text-[color:var(--neon-cyan)]">₹{totalPrice}</span>
                  </div>
                </div>

                {/* Send Request Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.01] active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" /> Send Request
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Real-Time Request Status Tracker View */
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              🔄 Product & Service Requests Status
            </h2>
            <span className="text-xs text-muted-foreground font-semibold">
              Live Operator Sync Active
            </span>
          </div>

          {userRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-3 font-display text-lg font-bold text-white">No requests found</h3>
              <p className="mt-1 text-sm text-slate-400">
                You haven't submitted any accessory or installation requests yet.
              </p>
              <button
                onClick={() => setActiveTab("request")}
                className="mt-4 rounded-xl gradient-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
              >
                Create Product Request
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-white/15 glass-strong p-5 space-y-4 hover:border-white/30 transition"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                    <div>
                      <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400">
                        REQUEST ID: <span className="text-white">{req.id}</span>
                      </div>
                      <div className="mt-1 font-display text-lg font-bold text-white">
                        {req.productName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        STB ID: {req.stbId} · {new Date(req.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs rounded-xl bg-white/5 p-3">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">
                        Unit Price
                      </span>
                      <strong className="text-white font-mono">₹{req.unitPrice}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Qty</span>
                      <strong className="text-white font-mono">{req.quantity}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">
                        Total
                      </span>
                      <strong className="text-[color:var(--neon-cyan)] font-mono">
                        ₹{req.totalAmount}
                      </strong>
                    </div>
                  </div>

                  {req.description && (
                    <div className="text-xs text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5">
                      <span className="text-muted-foreground font-bold">Notes: </span>
                      {req.description}
                    </div>
                  )}

                  {req.imageUrl && (
                    <div className="flex items-center gap-3">
                      <img
                        src={req.imageUrl}
                        alt="Attached photo"
                        className="h-16 w-16 rounded-xl object-cover border border-white/20"
                      />
                      <span className="text-xs text-muted-foreground font-medium">
                        Image attached
                      </span>
                    </div>
                  )}

                  {/* Technician assignment details if scheduled */}
                  {req.status === "Installation Scheduled" && (
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs space-y-1">
                      <div className="font-bold text-[color:var(--neon-cyan)] flex items-center gap-1.5">
                        <Wrench className="h-4 w-4" /> Operator Technician Assigned
                      </div>
                      <div className="text-white">
                        Technician: <strong>{req.technicianName || "Ramesh Kumar"}</strong> (
                        {req.technicianMobile || "9840192837"})
                      </div>
                      <div className="text-slate-300">
                        Scheduled Slot:{" "}
                        <strong>{req.scheduledDate || "Tomorrow at 11:00 AM"}</strong>
                      </div>
                    </div>
                  )}

                  {req.operatorNote && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                      <strong>Operator Remark: </strong> {req.operatorNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
