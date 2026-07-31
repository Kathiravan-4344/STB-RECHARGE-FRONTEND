// Supabase-backed data access for STB RECHARGE.
// Row <-> app-type mappers plus fetch/mutation helpers used by src/lib/store.ts.
import { supabase } from "@/integrations/supabase/client";
import type {
  Complaint,
  ComplaintStatus,
  Plan,
  Product,
  ProductRequest,
  ProductRequestStatus,
  STB,
  Txn,
  ApprovedOperator,
} from "./store";

type Row = Record<string, any>;

export const AUTH_EMAIL_DOMAIN = "stb-recharge.app";
export const ADMIN_MOBILE = "9080864542";

export function cleanMobile(v: string) {
  return (v || "").trim().replace(/\D/g, "");
}
export function mobileToEmail(mobile: string) {
  return `${cleanMobile(mobile)}@${AUTH_EMAIL_DOMAIN}`;
}

// ---------- mappers ----------
export const toPlan = (r: Row): Plan => ({
  id: r.id,
  name: r.name,
  price: r.price,
  validityDays: r.validity_days,
  category: r.category,
  features: r.features ?? [],
  popular: r.popular ?? false,
  channels: r.channels ?? undefined,
});

export const toProduct = (r: Row): Product => ({
  id: r.id,
  name: r.name,
  category: r.category,
  price: r.price,
  availableStock: r.available_stock,
  soldQuantity: r.sold_quantity,
  description: r.description ?? undefined,
  iconName: r.icon_name ?? undefined,
});

export const toStb = (r: Row): STB => ({
  id: r.id,
  customerName: r.customer_name,
  currentPlan: r.current_plan ?? "No active plan",
  expiry: r.expiry ?? new Date().toISOString(),
  active: r.active,
});

export const toTxn = (r: Row): Txn => ({
  id: r.id,
  planName: r.plan_name,
  amount: r.amount,
  date: r.created_at,
  status: r.status,
  approvedAt: r.approved_at ?? undefined,
  customerName: r.customer_name ?? undefined,
  customerMobile: r.customer_mobile ?? undefined,
  stbId: r.stb_id ?? undefined,
  startedAt: r.started_at ? new Date(r.started_at).getTime() : undefined,
});

export const toProductRequest = (r: Row): ProductRequest => ({
  id: r.id,
  stbId: r.stb_id ?? "",
  customerName: r.customer_name ?? "",
  customerMobile: r.customer_mobile ?? "",
  productId: r.product_id ?? "",
  productName: r.product_name,
  category: r.category,
  quantity: r.quantity,
  unitPrice: r.unit_price,
  totalAmount: r.total_amount,
  description: r.description ?? "",
  imageUrl: r.image_url ?? undefined,
  status: r.status as ProductRequestStatus,
  createdAt: r.created_at,
  technicianName: r.technician_name ?? undefined,
  technicianMobile: r.technician_mobile ?? undefined,
  scheduledDate: r.scheduled_date ?? undefined,
  operatorNote: r.operator_note ?? undefined,
});

export const toComplaint = (r: Row): Complaint => ({
  id: r.id,
  stbId: r.stb_id ?? "",
  customerName: r.customer_name ?? "",
  customerMobile: r.customer_mobile ?? "",
  category: r.category,
  issueType: r.issue_type ?? "",
  description: r.description ?? "",
  mediaUrl: r.media_url ?? undefined,
  preferredTime: r.preferred_time ?? "",
  status: r.status as ComplaintStatus,
  createdAt: r.created_at,
  technicianName: r.technician_name ?? undefined,
  technicianMobile: r.technician_mobile ?? undefined,
  assignedAt: r.assigned_at ?? undefined,
  expectedArrival: r.expected_arrival ?? undefined,
  resolvedAt: r.resolved_at ?? undefined,
  rating: r.rating ?? undefined,
  feedback: r.feedback ?? undefined,
});

export const toOperator = (r: Row): ApprovedOperator => ({
  id: r.id,
  mobile: r.mobile,
  name: r.name ?? "",
  addedAt: r.created_at,
  active: r.active,
});

function warn(scope: string, error: unknown) {
  if (error) console.error(`[db:${scope}]`, error);
}

// ---------- catalogue (public) ----------
export async function fetchCatalogue() {
  const [plans, products] = await Promise.all([
    supabase.from("plans").select("*").eq("active", true).order("price"),
    supabase.from("products").select("*").order("name"),
  ]);
  warn("plans", plans.error);
  warn("products", products.error);
  return {
    plans: (plans.data ?? []).map(toPlan),
    products: (products.data ?? []).map(toProduct),
  };
}

// ---------- per-session data ----------
export async function fetchUserData() {
  const [txns, requests, complaints] = await Promise.all([
    supabase.from("transactions").select("*").order("created_at", { ascending: false }),
    supabase.from("product_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("complaints").select("*").order("created_at", { ascending: false }),
  ]);
  warn("transactions", txns.error);
  warn("product_requests", requests.error);
  warn("complaints", complaints.error);
  return {
    txns: (txns.data ?? []).map(toTxn),
    productRequests: (requests.data ?? []).map(toProductRequest),
    complaints: (complaints.data ?? []).map(toComplaint),
  };
}

export async function fetchAdminData() {
  const [ops, blocked] = await Promise.all([
    supabase.from("approved_operators").select("*").order("created_at", { ascending: false }),
    supabase.from("blocked_customers").select("*"),
  ]);
  return {
    approvedOperators: (ops.data ?? []).map(toOperator),
    blockedCustomers: (blocked.data ?? []).map((r: Row) => r.identifier as string),
  };
}

// ---------- STB ----------
export async function getOrCreateStb(
  id: string,
  fallback: { ownerId?: string; customerName?: string; customerMobile?: string },
): Promise<STB | null> {
  const stbId = id.trim();
  if (!stbId) return null;
  const existing = await supabase.from("stb_accounts").select("*").eq("id", stbId).maybeSingle();
  if (existing.data) return toStb(existing.data);

  const insert = await supabase
    .from("stb_accounts")
    .insert({
      id: stbId,
      owner_id: fallback.ownerId ?? null,
      customer_name: fallback.customerName || "Customer",
      customer_mobile: fallback.customerMobile ?? null,
      current_plan: "No active plan",
      expiry: new Date().toISOString(),
      active: false,
    })
    .select()
    .maybeSingle();
  if (insert.error) {
    // Another concurrent call created it first — just read it back.
    const retry = await supabase.from("stb_accounts").select("*").eq("id", stbId).maybeSingle();
    if (retry.data) return toStb(retry.data);
    warn("stb.insert", insert.error);
  }
  return insert.data ? toStb(insert.data) : null;
}

export async function updateStb(id: string, patch: Row) {
  const { error } = await supabase.from("stb_accounts").update(patch as never).eq("id", id);
  warn("stb.update", error);
}

// ---------- transactions ----------
export async function insertTransaction(row: Row) {
  const { error } = await supabase.from("transactions").insert(row as never);
  warn("txn.insert", error);
}
export async function updateTransaction(id: string, patch: Row) {
  const { error } = await supabase.from("transactions").update(patch as never).eq("id", id);
  warn("txn.update", error);
  return error;
}
export async function deleteAll(table: string) {
  const { error } = await supabase.from(table as any).delete().neq("id", "___none___");
  warn(`${table}.delete`, error);
}

// ---------- requests / complaints ----------
export async function insertProductRequest(row: Row) {
  const { error } = await supabase.from("product_requests").insert(row as never);
  warn("pr.insert", error);
}
export async function updateProductRequest(id: string, patch: Row) {
  const { error } = await supabase.from("product_requests").update(patch as never).eq("id", id);
  warn("pr.update", error);
}
export async function insertComplaint(row: Row) {
  const { error } = await supabase.from("complaints").insert(row as never);
  warn("cmp.insert", error);
}
export async function updateComplaint(id: string, patch: Row) {
  const { error } = await supabase.from("complaints").update(patch as never).eq("id", id);
  warn("cmp.update", error);
}

// ---------- products ----------
export async function upsertProduct(row: Row) {
  const { error } = await supabase.from("products").upsert(row as never);
  warn("product.upsert", error);
}
export async function removeProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  warn("product.delete", error);
}

// ---------- admin lists ----------
export async function upsertOperator(mobile: string, name: string, active = true) {
  const { error } = await supabase
    .from("approved_operators")
    .upsert({ mobile, name, active }, { onConflict: "mobile" });
  warn("operator.upsert", error);
}
export async function setOperatorActive(id: string, active: boolean) {
  const { error } = await supabase.from("approved_operators").update({ active }).eq("id", id);
  warn("operator.update", error);
}
export async function blockCustomer(identifier: string) {
  const { error } = await supabase.from("blocked_customers").insert({ identifier });
  warn("blocked.insert", error);
}
export async function unblockCustomer(identifier: string) {
  const { error } = await supabase
    .from("blocked_customers")
    .delete()
    .eq("identifier", identifier);
  warn("blocked.delete", error);
}
