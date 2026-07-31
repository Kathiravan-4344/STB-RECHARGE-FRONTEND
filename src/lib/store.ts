// Data layer for STB RECHARGE — backed by Lovable Cloud (database + auth + realtime).
// Keeps a synchronous in-memory cache so components stay simple, while every
// mutation is persisted and every change is streamed back over realtime.
import { useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as db from "./db";

export type Plan = {
  id: string;
  name: string;
  price: number;
  validityDays: number;
  category: "Monthly" | "Channels" | "Add-on";
  features: string[];
  popular?: boolean;
  channels?: number;
};

export type Product = {
  id: string;
  name: string;
  category: "accessory" | "service";
  price: number;
  availableStock: number;
  soldQuantity: number;
  description?: string;
  iconName?: string;
};

export type ProductRequestStatus =
  | "Pending"
  | "Processing"
  | "Out for Delivery"
  | "Installation Scheduled"
  | "Completed"
  | "Not Available";

export type ProductRequest = {
  id: string;
  stbId: string;
  customerName: string;
  customerMobile: string;
  productId: string;
  productName: string;
  category: "accessory" | "service";
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  description: string;
  imageUrl?: string;
  status: ProductRequestStatus;
  createdAt: string;
  technicianName?: string;
  technicianMobile?: string;
  scheduledDate?: string;
  operatorNote?: string;
};

export type ComplaintStatus = "Pending" | "Assigned" | "In Progress" | "Resolved";

export type Complaint = {
  id: string;
  stbId: string;
  customerName: string;
  customerMobile: string;
  category: "TV Issues" | "STB Issues" | "Cable Connection Issues" | "Recharge Issues" | string;
  issueType: string;
  description: string;
  mediaUrl?: string;
  preferredTime: string;
  status: ComplaintStatus;
  createdAt: string;
  technicianName?: string;
  technicianMobile?: string;
  assignedAt?: string;
  expectedArrival?: string;
  resolvedAt?: string;
  rating?: number;
  feedback?: string;
};

export type Txn = {
  id: string;
  planName: string;
  amount: number;
  date: string;
  status: "pending" | "success" | "failed";
  approvedAt?: string;
  customerName?: string;
  customerMobile?: string;
  stbId?: string;
  startedAt?: number;
};

export type STB = {
  id: string;
  customerName: string;
  currentPlan: string;
  expiry: string;
  active: boolean;
};

export type ApprovedOperator = {
  id: string;
  mobile: string;
  name: string;
  addedAt: string;
  active: boolean;
};

export type User = {
  id?: string;
  mobile: string;
  name?: string;
  email?: string;
  operatorNumber?: string;
  stbId?: string;
  role: "operator" | "customer" | "admin";
};

export type State = {
  user: User | null;
  stb: STB | null;
  autoRecharge: { enabled: boolean; planId?: string };
  pending: { txnId: string; planName: string; amount: number; startedAt: number } | null;
  txns: Txn[];
  plans: Plan[];
  products: Product[];
  productRequests: ProductRequest[];
  complaints: Complaint[];
  appliedCoupon: string | null;
  approvedOperators: ApprovedOperator[];
  blockedCustomers: string[];
  ready: boolean;
};

// Fallback catalogue used before the database responds (also the seeded values).
export const PLANS: Plan[] = [
  {
    id: "m1",
    name: "Basic Tamil Pack Monthly Rs 220",
    price: 220,
    validityDays: 30,
    category: "Monthly",
    features: ["150+ SD Channels", "Standard Definition", "1 STB"],
    channels: 150,
  },
  {
    id: "m2",
    name: "Basic Tamil Silver Pack Monthly Rs 240",
    price: 240,
    validityDays: 30,
    category: "Monthly",
    features: ["300+ HD Channels", "Full HD Quality", "OTT App bundle"],
    popular: true,
    channels: 300,
  },
  {
    id: "m3",
    name: "Basic Tamil HD Packs Rs 300",
    price: 300,
    validityDays: 30,
    category: "Monthly",
    features: ["400+ Channels", "4K where available", "3 months validity"],
    channels: 400,
  },
  {
    id: "c1",
    name: "Sports Pack Rs 49",
    price: 49,
    validityDays: 30,
    category: "Channels",
    features: ["Star Sports HD", "Sony Sports", "Willow Cricket"],
    channels: 18,
  },
  {
    id: "c2",
    name: "HD Movies Pack Rs 79",
    price: 79,
    validityDays: 30,
    category: "Channels",
    features: ["Star Movies", "&pictures HD", "Sony Pix"],
    channels: 22,
  },
  {
    id: "c3",
    name: "Kids Pack Rs 49",
    price: 49,
    validityDays: 30,
    category: "Channels",
    features: ["Cartoon Network", "Nick HD+", "Disney"],
    channels: 12,
  },
  {
    id: "a1",
    name: "OTT Add-on (Hotstar)",
    price: 99,
    validityDays: 30,
    category: "Add-on",
    features: ["Disney+ Hotstar Mobile", "1 device"],
  },
  {
    id: "a2",
    name: "Regional Bhasha Pack",
    price: 59,
    validityDays: 30,
    category: "Add-on",
    features: ["25+ regional channels"],
  },
];

export const INITIAL_SEED_PRODUCTS: Product[] = [];
export const INITIAL_SEED_PRODUCT_REQUESTS: ProductRequest[] = [];
export const INITIAL_SEED_COMPLAINTS: Complaint[] = [];
export const INITIAL_APPROVED_OPERATORS: ApprovedOperator[] = [];

const defaultState: State = {
  user: null,
  stb: null,
  autoRecharge: { enabled: false },
  pending: null,
  txns: [],
  plans: PLANS,
  products: [],
  productRequests: [],
  complaints: [],
  appliedCoupon: null,
  approvedOperators: [],
  blockedCustomers: [],
  ready: false,
};

let state: State = defaultState;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}
export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  emit();
}
export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => subscribe(l),
    () => selector(state),
    () => selector(defaultState),
  );
}

// ---------------- bootstrap + realtime ----------------
let booted = false;

export async function initStore() {
  if (booted || typeof window === "undefined") return;
  booted = true;

  const catalogue = await db.fetchCatalogue();
  setState({
    plans: catalogue.plans.length ? catalogue.plans : PLANS,
    products: catalogue.products,
  });

  const { data } = await supabase.auth.getSession();
  if (data.session) await hydrateSession();
  else setState({ ready: true });

  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      setState({ ...defaultState, plans: state.plans, products: state.products, ready: true });
    }
  });

  supabase
    .channel("stb-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () =>
      refreshUserData(),
    )
    .on("postgres_changes", { event: "*", schema: "public", table: "product_requests" }, () =>
      refreshUserData(),
    )
    .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () =>
      refreshUserData(),
    )
    .on("postgres_changes", { event: "*", schema: "public", table: "stb_accounts" }, () =>
      refreshStb(),
    )
    .subscribe();
}

async function loadProfile(userId: string, email?: string) {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  const roleList = (roles ?? []).map((r: { role: string }) => r.role);
  const role: User["role"] = roleList.includes("admin")
    ? "admin"
    : roleList.includes("operator")
      ? "operator"
      : "customer";
  const user: User = {
    id: userId,
    mobile: profile?.mobile ?? "",
    name: profile?.name ?? undefined,
    email: profile?.email ?? email,
    stbId: profile?.stb_id ?? undefined,
    operatorNumber: profile?.operator_number ?? undefined,
    role,
  };
  setState({ user });
  return user;
}

async function hydrateSession() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    setState({ ready: true });
    return;
  }
  const user = await loadProfile(data.user.id, data.user.email ?? undefined);
  await refreshUserData();
  if (user.role === "admin") await refreshAdminData();
  if (user.stbId) await fetchStb(user.stbId);
  setState({ ready: true });
}

export async function refreshUserData() {
  const rows = await db.fetchUserData();
  const pendingTxn = rows.txns.find((t) => t.status === "pending");
  setState({
    txns: rows.txns,
    productRequests: rows.productRequests,
    complaints: rows.complaints,
    pending: pendingTxn
      ? {
          txnId: pendingTxn.id,
          planName: pendingTxn.planName,
          amount: pendingTxn.amount,
          startedAt: pendingTxn.startedAt ?? new Date(pendingTxn.date).getTime(),
        }
      : null,
  });
}

export async function refreshAdminData() {
  const rows = await db.fetchAdminData();
  setState({
    approvedOperators: rows.approvedOperators,
    blockedCustomers: rows.blockedCustomers,
  });
}

export async function refreshCatalogue() {
  const catalogue = await db.fetchCatalogue();
  setState({
    plans: catalogue.plans.length ? catalogue.plans : PLANS,
    products: catalogue.products,
  });
}

async function refreshStb() {
  const id = state.stb?.id ?? state.user?.stbId;
  if (id) await fetchStb(id);
}

// ---------------- auth ----------------
export function sendOtp(mobile: string) {
  // The 6-digit code doubles as the account PIN for this mobile number.
  console.log(`[STB] Enter your 6-digit PIN for ${mobile}`);
  return Promise.resolve();
}

export function isOperatorApproved(contact: string): boolean {
  const digitsOnly = db.cleanMobile(contact);
  // The approved list is admin-only data; when it isn't loaded, let the server
  // decide during verifyOtp (claim_role) instead of blocking here.
  if (state.approvedOperators.length === 0) return true;
  return state.approvedOperators.some(
    (op) =>
      op.active &&
      (op.mobile === digitsOnly || (digitsOnly.length >= 5 && op.mobile.includes(digitsOnly))),
  );
}

export function isCustomerBlocked(identifier: string): boolean {
  if (!identifier) return false;
  const cleaned = identifier.trim().toLowerCase();
  return state.blockedCustomers.some((c) => c.toLowerCase() === cleaned);
}

export async function verifyOtp(
  mobile: string,
  otp: string,
  name?: string,
  role: "operator" | "customer" | "admin" = "customer",
  extra?: { email?: string; operatorNumber?: string; stbId?: string },
): Promise<boolean> {
  const cleanedMobile = db.cleanMobile(mobile);
  if (cleanedMobile.length < 10 || otp.trim().length < 6) return false;

  const email = db.mobileToEmail(cleanedMobile);
  const password = `stb-${otp.trim()}`;

  let signIn = await supabase.auth.signInWithPassword({ email, password });

  if (signIn.error) {
    const signUp = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { mobile: cleanedMobile, name: name || "Customer", stb_id: extra?.stbId ?? null },
      },
    });
    if (signUp.error) {
      console.error("[auth]", signUp.error.message);
      return false;
    }
    signIn = await supabase.auth.signInWithPassword({ email, password });
    if (signIn.error) {
      console.error("[auth]", signIn.error.message);
      return false;
    }
  }

  const userId = signIn.data.user?.id;
  if (!userId) return false;

  // Server decides the real role from the admin number / approved-operator list.
  const { data: claimed, error: claimError } = await supabase.rpc("claim_role", {
    _mobile: cleanedMobile,
  });
  if (claimError) console.error("[auth:role]", claimError.message);
  const effectiveRole = (claimed as User["role"]) ?? "customer";

  if (role === "admin" && effectiveRole !== "admin") {
    await supabase.auth.signOut();
    return false;
  }
  if (role === "operator" && effectiveRole === "customer") {
    await supabase.auth.signOut();
    return false;
  }

  const { data: blocked } = await supabase.rpc("is_blocked", { _identifier: cleanedMobile });
  const { data: blockedStb } = extra?.stbId
    ? await supabase.rpc("is_blocked", { _identifier: extra.stbId })
    : { data: false };
  if ((blocked || blockedStb) && effectiveRole === "customer") {
    await supabase.auth.signOut();
    return false;
  }

  await supabase
    .from("profiles")
    .update({
      name: name || undefined,
      mobile: cleanedMobile,
      stb_id: extra?.stbId ?? undefined,
      operator_number: extra?.operatorNumber ?? undefined,
    })
    .eq("id", userId);

  await hydrateSession();
  if (extra?.stbId) await fetchStb(extra.stbId);
  return true;
}

export async function logout() {
  await supabase.auth.signOut();
  setState({ ...defaultState, plans: state.plans, products: state.products, ready: true });
}

// ---------------- STB ----------------
export async function fetchStb(id: string): Promise<STB | null> {
  const stb = await db.getOrCreateStb(id, {
    ownerId: state.user?.id,
    customerName: state.user?.name || "Customer",
    customerMobile: state.user?.mobile,
  });
  if (stb) setState({ stb });
  return stb;
}

// ---------------- recharge flow ----------------
export function startPayment(planId: string, amount: number, planName: string) {
  const txnId = "TXN" + Math.floor(Math.random() * 900000 + 100000);
  const now = Date.now();
  const user = state.user;
  const stb = state.stb;

  const newTxn: Txn = {
    id: txnId,
    planName,
    amount,
    date: new Date(now).toISOString(),
    startedAt: now,
    status: "pending",
    customerName: user?.name || stb?.customerName || "Customer",
    customerMobile: user?.mobile,
    stbId: stb?.id,
  };

  setState((s) => ({
    pending: { txnId, planName, amount, startedAt: now },
    txns: [newTxn, ...s.txns],
  }));

  void db.insertTransaction({
    id: txnId,
    user_id: user?.id ?? null,
    stb_id: stb?.id ?? null,
    plan_id: planId,
    plan_name: planName,
    amount,
    status: "pending",
    customer_name: newTxn.customerName,
    customer_mobile: newTxn.customerMobile ?? null,
    coupon: state.appliedCoupon,
    started_at: new Date(now).toISOString(),
  });

  return txnId;
}

export async function approvePending(txnId: string) {
  const nowIso = new Date().toISOString();
  const target = state.txns.find((t) => t.id === txnId);

  setState((s) => ({
    pending: s.pending?.txnId === txnId ? null : s.pending,
    txns: s.txns.map((t) =>
      t.id === txnId ? { ...t, status: "success" as const, approvedAt: nowIso } : t,
    ),
  }));

  const error = await db.updateTransaction(txnId, { status: "success", approved_at: nowIso });
  if (error) {
    // Only operators/admins may approve — roll back to the server truth.
    await refreshUserData();
    return false;
  }

  if (target?.stbId) {
    const expiry = new Date(Date.now() + 30 * 86400000).toISOString();
    await db.updateStb(target.stbId, {
      active: true,
      current_plan: target.planName,
      expiry,
    });
    if (state.stb?.id === target.stbId) {
      setState((s) => ({
        stb: s.stb ? { ...s.stb, active: true, currentPlan: target.planName, expiry } : s.stb,
      }));
    }
  }
  return true;
}

export async function rejectPending(txnId: string) {
  setState((s) => ({
    pending: s.pending?.txnId === txnId ? null : s.pending,
    txns: s.txns.map((t) => (t.id === txnId ? { ...t, status: "failed" as const } : t)),
  }));
  const error = await db.updateTransaction(txnId, { status: "failed" });
  if (error) {
    await refreshUserData();
    return false;
  }
  return true;
}

// ---------------- operators / blocked customers ----------------
export function addApprovedOperator(mobile: string, name?: string) {
  const cleaned = db.cleanMobile(mobile);
  if (cleaned.length !== 10) {
    return { success: false, message: "Enter a valid 10-digit mobile number." };
  }
  const existing = state.approvedOperators.find((op) => op.mobile === cleaned);
  if (existing && existing.active) {
    return { success: false, message: `Operator ${cleaned} is already approved.` };
  }
  void db
    .upsertOperator(cleaned, name?.trim() || `Operator (${cleaned.slice(-4)})`, true)
    .then(refreshAdminData);
  return {
    success: true,
    message: existing
      ? `Operator ${cleaned} re-activated.`
      : `Operator ${cleaned} added to approved list.`,
  };
}

export function toggleOperatorStatus(id: string) {
  const op = state.approvedOperators.find((o) => o.id === id);
  if (!op) return;
  setState((s) => ({
    approvedOperators: s.approvedOperators.map((o) =>
      o.id === id ? { ...o, active: !o.active } : o,
    ),
  }));
  void db.setOperatorActive(id, !op.active).then(refreshAdminData);
}

export function removeApprovedOperator(_id: string) {
  return { success: false, message: "Operator numbers are permanent and cannot be deleted." };
}

export function toggleBlockCustomer(identifier: string) {
  const cleaned = identifier.trim();
  if (!cleaned) return;
  const isBlocked = state.blockedCustomers.includes(cleaned);
  setState((s) => ({
    blockedCustomers: isBlocked
      ? s.blockedCustomers.filter((c) => c !== cleaned)
      : [...s.blockedCustomers, cleaned],
  }));
  void (isBlocked ? db.unblockCustomer(cleaned) : db.blockCustomer(cleaned)).then(refreshAdminData);
}

// ---------------- history maintenance (admin) ----------------
export function clearRechargeHistory() {
  setState({ txns: [], pending: null });
  void db.deleteAll("transactions");
}
export function clearProductOrderHistory() {
  setState({ productRequests: [] });
  void db.deleteAll("product_requests");
}
export function clearComplaintHistory() {
  setState({ complaints: [] });
  void db.deleteAll("complaints");
}
export function clearAllFakeEntries() {
  void refreshUserData();
}

// ---------------- products ----------------
export function updateProduct(id: string, patch: Partial<Product>) {
  setState((s) => ({
    products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  }));
  const row: Record<string, unknown> = { id };
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.price !== undefined) row.price = patch.price;
  if (patch.availableStock !== undefined) row.available_stock = patch.availableStock;
  if (patch.soldQuantity !== undefined) row.sold_quantity = patch.soldQuantity;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.iconName !== undefined) row.icon_name = patch.iconName;
  void db.upsertProduct(row);
}

export function deleteProduct(id: string) {
  setState((s) => ({
    products: s.products.filter((p) => p.id !== id),
    productRequests: s.productRequests.filter((pr) => pr.productId !== id),
  }));
  void db.removeProduct(id);
}

export function addProduct(product: Omit<Product, "id" | "soldQuantity">): Product {
  const newId = "p" + Date.now().toString(36) + Math.floor(Math.random() * 1000);
  const newProduct: Product = { ...product, id: newId, soldQuantity: 0 };
  setState((s) => ({ products: [...s.products, newProduct] }));
  void db.upsertProduct({
    id: newId,
    name: newProduct.name,
    category: newProduct.category,
    price: newProduct.price,
    available_stock: newProduct.availableStock,
    sold_quantity: 0,
    description: newProduct.description ?? null,
    icon_name: newProduct.iconName ?? null,
  });
  return newProduct;
}

export function updateProductStock(id: string, availableStock: number, price?: number) {
  updateProduct(id, { availableStock, ...(price !== undefined ? { price } : {}) });
}

// ---------------- product & service requests ----------------
export function createProductRequest(input: {
  stbId: string;
  customerName: string;
  customerMobile: string;
  productId: string;
  quantity: number;
  description: string;
  imageUrl?: string;
}): ProductRequest {
  const reqId = "PR-" + Math.floor(Math.random() * 90000 + 10000);
  const target = state.products.find((p) => p.id === input.productId);
  const unitPrice = target?.price || 0;

  const newReq: ProductRequest = {
    id: reqId,
    stbId: input.stbId,
    customerName: input.customerName,
    customerMobile: input.customerMobile,
    productId: input.productId,
    productName: target?.name || "Product / Service",
    category: target?.category || "accessory",
    quantity: input.quantity,
    unitPrice,
    totalAmount: unitPrice * input.quantity,
    description: input.description,
    imageUrl: input.imageUrl,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  setState((s) => ({ productRequests: [newReq, ...s.productRequests] }));

  void db.insertProductRequest({
    id: reqId,
    user_id: state.user?.id ?? null,
    stb_id: newReq.stbId,
    customer_name: newReq.customerName,
    customer_mobile: newReq.customerMobile,
    product_id: newReq.productId,
    product_name: newReq.productName,
    category: newReq.category,
    quantity: newReq.quantity,
    unit_price: newReq.unitPrice,
    total_amount: newReq.totalAmount,
    description: newReq.description,
    image_url: newReq.imageUrl ?? null,
    status: "Pending",
  });

  return newReq;
}

export function updateProductRequestStatus(
  id: string,
  status: ProductRequestStatus,
  details?: {
    technicianName?: string;
    technicianMobile?: string;
    scheduledDate?: string;
    operatorNote?: string;
  },
) {
  const req = state.productRequests.find((r) => r.id === id);

  setState((s) => ({
    productRequests: s.productRequests.map((r) =>
      r.id === id
        ? {
            ...r,
            status,
            ...(details?.technicianName !== undefined && {
              technicianName: details.technicianName,
            }),
            ...(details?.technicianMobile !== undefined && {
              technicianMobile: details.technicianMobile,
            }),
            ...(details?.scheduledDate !== undefined && { scheduledDate: details.scheduledDate }),
            ...(details?.operatorNote !== undefined && { operatorNote: details.operatorNote }),
          }
        : r,
    ),
  }));

  void db.updateProductRequest(id, {
    status,
    ...(details?.technicianName !== undefined && { technician_name: details.technicianName }),
    ...(details?.technicianMobile !== undefined && { technician_mobile: details.technicianMobile }),
    ...(details?.scheduledDate !== undefined && { scheduled_date: details.scheduledDate }),
    ...(details?.operatorNote !== undefined && { operator_note: details.operatorNote }),
  });

  if (req && status === "Completed" && req.status !== "Completed") {
    const product = state.products.find((p) => p.id === req.productId);
    if (product) {
      updateProduct(product.id, {
        availableStock: Math.max(0, product.availableStock - req.quantity),
        soldQuantity: product.soldQuantity + req.quantity,
      });
    }
  }
}

// ---------------- complaints ----------------
export function createComplaint(input: {
  stbId: string;
  customerName: string;
  customerMobile: string;
  category: string;
  issueType: string;
  description: string;
  mediaUrl?: string;
  preferredTime: string;
}): Complaint {
  const cmpId = "CMP-" + Math.floor(Math.random() * 90000 + 10000);
  const newComplaint: Complaint = {
    id: cmpId,
    ...input,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  setState((s) => ({ complaints: [newComplaint, ...s.complaints] }));

  void db.insertComplaint({
    id: cmpId,
    user_id: state.user?.id ?? null,
    stb_id: input.stbId,
    customer_name: input.customerName,
    customer_mobile: input.customerMobile,
    category: input.category,
    issue_type: input.issueType,
    description: input.description,
    media_url: input.mediaUrl ?? null,
    preferred_time: input.preferredTime,
    status: "Pending",
  });

  return newComplaint;
}

export function updateComplaintStatus(
  id: string,
  status: ComplaintStatus,
  details?: {
    technicianName?: string;
    technicianMobile?: string;
    expectedArrival?: string;
  },
) {
  const nowIso = new Date().toISOString();
  const current = state.complaints.find((c) => c.id === id);

  setState((s) => ({
    complaints: s.complaints.map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            ...(details?.technicianName && { technicianName: details.technicianName }),
            ...(details?.technicianMobile && { technicianMobile: details.technicianMobile }),
            ...(details?.expectedArrival && { expectedArrival: details.expectedArrival }),
            ...(status === "Assigned" || status === "In Progress"
              ? { assignedAt: c.assignedAt || nowIso }
              : {}),
            ...(status === "Resolved" ? { resolvedAt: nowIso } : {}),
          }
        : c,
    ),
  }));

  void db.updateComplaint(id, {
    status,
    ...(details?.technicianName && { technician_name: details.technicianName }),
    ...(details?.technicianMobile && { technician_mobile: details.technicianMobile }),
    ...(details?.expectedArrival && { expected_arrival: details.expectedArrival }),
    ...(status === "Assigned" || status === "In Progress"
      ? { assigned_at: current?.assignedAt || nowIso }
      : {}),
    ...(status === "Resolved" ? { resolved_at: nowIso } : {}),
  });
}

export function assignTechnicianToComplaint(
  id: string,
  technicianName: string,
  technicianMobile: string,
  expectedArrival: string,
) {
  updateComplaintStatus(id, "In Progress", {
    technicianName,
    technicianMobile,
    expectedArrival,
  });
}

export function submitComplaintRating(id: string, rating: number, feedback: string) {
  setState((s) => ({
    complaints: s.complaints.map((c) => (c.id === id ? { ...c, rating, feedback } : c)),
  }));
  void db.updateComplaint(id, { rating, feedback });
}

// ---------------- misc helpers ----------------
export function useCountdown(startedAt: number, durationMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const remaining = Math.max(0, startedAt + durationMs - now);
  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);
  return {
    remaining,
    label: `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`,
    pct: 1 - remaining / durationMs,
  };
}

export function formatName(str?: string): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
