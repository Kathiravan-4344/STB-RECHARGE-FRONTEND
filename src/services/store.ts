// In-memory data store for STB RECHARGE (Pure Frontend - Supabase removed).
import { useSyncExternalStore } from "react";
import { cleanMobile, cleanContact, mobileToEmail } from "../utils/utils";
import {
  apiAddOperator,
  apiToggleOperator,
  apiDeleteOperator,
  apiGetOperators,
  apiCreateRecharge,
  apiGetPendingRecharges,
<<<<<<< HEAD:frontend/src/services/store.ts
  apiGetOperatorRequests,
=======
>>>>>>> vercel-target/main:src/services/store.ts
  apiApproveRecharge,
  apiRejectRecharge,
  apiGetRechargeStatus,
  apiCreateProductRequest,
  apiGetProductRequests,
  apiUpdateProductRequestStatus,
  apiCreateComplaint,
  apiGetComplaints,
  apiUpdateComplaintStatus,
  apiVerifyOtp,
  apiGetUserProfile,
} from "./api";



export type Plan = {
  id: string;
<<<<<<< HEAD:frontend/src/services/store.ts
  _id?: string;
=======
>>>>>>> vercel-target/main:src/services/store.ts
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
  syncedToBackend?: boolean;
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
<<<<<<< HEAD:frontend/src/services/store.ts
  selectedPlanId: string | null;
  selectedPlanObject?: any;
=======
>>>>>>> vercel-target/main:src/services/store.ts
  approvedOperators: ApprovedOperator[];
  blockedCustomers: string[];
  ready: boolean;
};

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

export const INITIAL_SEED_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "HD Set Top Box Remote",
    category: "accessory",
    price: 250,
    availableStock: 45,
    soldQuantity: 120,
    description: "Universal STB Remote compatible with all HD models",
    iconName: "Tv",
  },
  {
    id: "prod-2",
    name: "4K Ultra HD HDMI Cable 1.5m",
    category: "accessory",
    price: 150,
    availableStock: 60,
    soldQuantity: 85,
    description: "High speed 4K Gold Plated Shielded HDMI Cable",
    iconName: "Zap",
  },
  {
    id: "prod-3",
    name: "Dish Antenna LNB Receiver",
    category: "accessory",
    price: 350,
    availableStock: 30,
    soldQuantity: 42,
    description: "Universal Ku-Band Single LNB for High Signal Reception",
    iconName: "Radio",
  },
  {
    id: "prod-4",
    name: "Coaxial Cable 15m with F-Connectors",
    category: "accessory",
    price: 200,
    availableStock: 50,
    soldQuantity: 65,
    description: "Heavy Duty Shielded RG6 Coaxial Cable with brass connectors",
    iconName: "Cable",
  },
  {
    id: "prod-5",
    name: "12V 2A STB Power Adapter",
    category: "accessory",
    price: 220,
    availableStock: 40,
    soldQuantity: 90,
    description: "Surge Protected Power Supply Adapter for HD STB",
    iconName: "Plug",
  },
  {
    id: "prod-6",
    name: "STB Wall Mounting Bracket Stand",
    category: "accessory",
    price: 180,
    availableStock: 35,
    soldQuantity: 55,
    description: "Heavy Duty Metal Wall Mount Stand with cable slots",
    iconName: "Box",
  },
  {
    id: "prod-7",
    name: "AV 3-RCA Audio Video Cable",
    category: "accessory",
    price: 120,
    availableStock: 45,
    soldQuantity: 38,
    description: "Premium RCA Cable for Standard Definition STB connection",
    iconName: "Sliders",
  },
  {
    id: "prod-8",
    name: "Universal Learning Smart Remote",
    category: "accessory",
    price: 390,
    availableStock: 25,
    soldQuantity: 74,
    description: "Dual TV + STB Smart Remote with button learning mode",
    iconName: "Tv",
  },
  {
    id: "prod-9",
    name: "Dish Antenna Signal Alignment Service",
    category: "service",
    price: 299,
    availableStock: 100,
    soldQuantity: 110,
    description: "Technician Home Visit for Dish Alignment & Cable Signal Tuning",
    iconName: "Wrench",
  },
  {
    id: "prod-10",
    name: "4K Smart Hybrid STB Hardware Upgrade",
    category: "service",
    price: 999,
    availableStock: 15,
    soldQuantity: 28,
    description: "Upgrade old STB to 4K Smart Android Hybrid Box with OTT Apps",
    iconName: "Sparkles",
  },
];

export const INITIAL_SEED_PRODUCT_REQUESTS: ProductRequest[] = [];
export const INITIAL_SEED_COMPLAINTS: Complaint[] = [];
export const INITIAL_APPROVED_OPERATORS: ApprovedOperator[] = [
  {
    id: "op-1",
    mobile: "9080864542",
    name: "Kathiravan V",
    addedAt: new Date().toISOString(),
    active: true,
  },
  {
    id: "op-2",
    mobile: "9787312758",
    name: "KATHIR",
    addedAt: new Date().toISOString(),
    active: true,
  },
];

const defaultState: State = {
  user: null,
  stb: null,
  autoRecharge: { enabled: false },
  pending: null,
  txns: [],
  plans: PLANS,
  products: INITIAL_SEED_PRODUCTS,
  productRequests: INITIAL_SEED_PRODUCT_REQUESTS,
  complaints: INITIAL_SEED_COMPLAINTS,
  appliedCoupon: null,
<<<<<<< HEAD:frontend/src/services/store.ts
  selectedPlanId: null,
  selectedPlanObject: null,
=======
>>>>>>> vercel-target/main:src/services/store.ts
  approvedOperators: INITIAL_APPROVED_OPERATORS,
  blockedCustomers: [],
  ready: true,
};

<<<<<<< HEAD:frontend/src/services/store.ts
export function selectPlan(planOrId: any) {
  if (typeof planOrId === "object" && planOrId !== null) {
    const id = planOrId.id || planOrId._id || (planOrId.price === 300 ? "m3" : planOrId.price === 240 ? "m2" : "m1");
    setState({ selectedPlanId: id, selectedPlanObject: planOrId });
  } else {
    setState({ selectedPlanId: String(planOrId || "") });
  }
}

=======
>>>>>>> vercel-target/main:src/services/store.ts
let state: State = defaultState;
const listeners = new Set<() => void>();

// Local storage key
const STORAGE_KEY = "stb_recharge_local_state_v1";

function loadSavedState(): State {
  if (typeof window === "undefined") return defaultState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed, ready: true };
    }
  } catch (e) {
    console.error("Failed to load local state", e);
  }
  return defaultState;
}

const syncChannel =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel("stb_recharge_sync_channel")
    : null;

function saveState(broadcast = true) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (broadcast && syncChannel) {
      syncChannel.postMessage({ type: "STATE_UPDATED" });
    }
  } catch (e) {
    console.error("Failed to save local state", e);
  }
}

// Listen for instant cross-tab / multi-window sync
if (typeof window !== "undefined") {
  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      if (event.data?.type === "STATE_UPDATED") {
        const saved = loadSavedState();
        state = { ...state, ...saved };
        listeners.forEach((l) => l());
      }
    };
  }

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        state = { ...state, ...parsed };
        listeners.forEach((l) => l());
      } catch (e) {
        console.warn("Failed to sync storage event", e);
      }
    }
  });
}

function emit() {
  saveState();
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

// Booting and session
let booted = false;

export async function syncOperatorsFromBackend() {
  try {
    const res = await apiGetOperators();
    if (res.success && res.data?.operators) {
      const fetched: ApprovedOperator[] = res.data.operators.map((op: any) => ({
        id: op._id || op.id || "op-" + op.mobileNumber,
        mobile: op.mobileNumber || op.mobile,
        name: op.name || "Operator",
        addedAt: op.createdAt || op.addedAt || new Date().toISOString(),
        active: op.isActive !== undefined ? op.isActive : true,
      }));
      
      const mergedMap = new Map<string, ApprovedOperator>();
      INITIAL_APPROVED_OPERATORS.forEach((op) => {
        mergedMap.set(cleanContact(op.mobile), op);
      });
      state.approvedOperators.forEach((op) => {
        mergedMap.set(cleanContact(op.mobile), op);
      });
      fetched.forEach((op) => {
        const key = cleanContact(op.mobile);
        const existing = mergedMap.get(key);
        mergedMap.set(key, { ...(existing || {}), ...op });
      });

      setState({ approvedOperators: Array.from(mergedMap.values()) });
    }
  } catch (e) {
    console.warn("Failed to sync operators from backend", e);
  }
}

export async function syncPendingRechargesFromBackend() {
  try {
<<<<<<< HEAD:frontend/src/services/store.ts
    // Single API endpoint query to avoid duplicate data fetching
    const res = await apiGetOperatorRequests();

    let rawList: any[] = [];
    if (res.success && Array.isArray(res.data?.requests)) {
      rawList = res.data.requests;
    } else if (Array.isArray(res.data)) {
      rawList = res.data;
    } else if (Array.isArray(res)) {
      rawList = res;
    }

    // Deduplicate by ID and Content Signature
    const uniqueMap = new Map<string, any>();
    const seenSignatures = new Set<string>();

    for (const item of rawList) {
      const idKey = String(item._id || item.id || "");
      const stb = String(item.stbId || "").trim().toUpperCase();
      const mobile = String(item.customerMobile || (typeof item.userId === "object" ? item.userId?.mobileNumber : "") || "").trim();
      const amount = Number(item.amount) || 0;
      const status = String(item.status || "Pending").trim();
      const timeMin = Math.floor(new Date(item.createdAt || item.requestTime || Date.now()).getTime() / 60000);

      const signature = `${stb}_${mobile}_${amount}_${status}_${timeMin}`;

      if (idKey && !uniqueMap.has(idKey) && !seenSignatures.has(signature)) {
        uniqueMap.set(idKey, item);
        seenSignatures.add(signature);
      }
    }
    const backendRequests = Array.from(uniqueMap.values());

    if (backendRequests.length > 0 || res.success) {
      const backendTxns: Txn[] = backendRequests.map((r: any) => {
        const id = r._id || r.id;
        const planName =
          (typeof r.planId === "object" ? r.planId?.name : null) ||
          r.planName ||
          (typeof r.plan === "object" ? r.plan?.name : null) ||
          "STB Recharge";
        const amount =
          r.amount ||
          (typeof r.planId === "object" ? r.planId?.price : null) ||
          0;
        const rawStatus = String(r.status || "").toLowerCase();
        const status =
          rawStatus === "approved" || rawStatus === "success"
            ? "success"
            : rawStatus === "rejected" || rawStatus === "failed"
              ? "failed"
              : "pending";
        const date = r.requestTime || r.createdAt || new Date().toISOString();
        const customerName =
          (typeof r.userId === "object" ? r.userId?.name : null) ||
          r.customerName ||
          "Customer";
        const customerMobile =
          (typeof r.userId === "object" ? r.userId?.mobileNumber : null) ||
          r.customerMobile ||
          "";
        const stbId =
          r.stbId ||
          (typeof r.userId === "object" ? r.userId?.stbId : null) ||
          "";
=======
    // 1. Auto-retry unsynced local pending transactions
    const unsynced = state.txns.filter(
      (t) => t.status === "pending" && !t.syncedToBackend && !t.id.match(/^[0-9a-fA-F]{24}$/)
    );

    for (const t of unsynced) {
      try {
        const res = await apiCreateRecharge({
          stbId: t.stbId || "1234567890",
          planName: t.planName,
          amount: t.amount,
          customerName: t.customerName,
          customerMobile: t.customerMobile,
          paymentStatus: "Success",
        });

        const backendId =
          res.data?.rechargeRequest?._id ||
          (res.data as any)?.data?.rechargeRequest?._id ||
          (res.data as any)?.rechargeRequest?.id;

        if (res.success && backendId) {
          const updatedTxns = state.txns.map((item) =>
            item.id === t.id ? { ...item, id: backendId, syncedToBackend: true } : item
          );
          const currentPending = state.pending;
          const isPendingMatch = currentPending?.txnId === t.id;
          setState({
            txns: updatedTxns,
            pending: isPendingMatch && currentPending ? { ...currentPending, txnId: backendId } : state.pending,
          });
        }
      } catch (retryErr) {
        console.warn("[Auto-Retry Recharge Warning]", retryErr);
      }
    }

    // 2. Fetch latest recharges from backend MongoDB
    const res = await apiGetPendingRecharges();
    const backendRequests = res.data?.requests || (res.data as any)?.data?.requests;
    if (res.success && Array.isArray(backendRequests)) {
      const backendTxns: Txn[] = backendRequests.map((r: any) => {
        const id = r._id || r.id;
        const planName = r.planId?.name || r.planName || "STB Recharge";
        const amount = r.amount || r.planId?.price || 0;
        const status = r.status === "Approved" ? "success" : r.status === "Rejected" ? "failed" : "pending";
        const date = r.requestTime || r.createdAt || new Date().toISOString();
        const customerName = r.customerName || r.userId?.name || "Customer";
        const customerMobile = r.customerMobile || r.userId?.mobileNumber || "";
        const stbId = r.stbId || r.userId?.stbId || "";
>>>>>>> vercel-target/main:src/services/store.ts
        return {
          id,
          planName,
          amount,
          date,
          status,
          approvedAt: r.approvedTime,
          customerName,
          customerMobile,
          stbId,
          startedAt: new Date(date).getTime(),
          syncedToBackend: true,
        };
      });

      const recentLocalPending = state.txns.filter(
<<<<<<< HEAD:frontend/src/services/store.ts
        (t) => (t.status || "").toLowerCase() === "pending" && !t.syncedToBackend && !backendTxns.some((b) => b.id === t.id)
=======
        (t) => t.status === "pending" && !t.syncedToBackend && !backendTxns.some((b) => b.id === t.id)
>>>>>>> vercel-target/main:src/services/store.ts
      );

      const mergedTxns = [...recentLocalPending, ...backendTxns].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      let currentPending = state.pending;
      if (currentPending) {
        const match = mergedTxns.find((t) => t.id === currentPending?.txnId);
<<<<<<< HEAD:frontend/src/services/store.ts
        if (match && (match.status || "").toLowerCase() !== "pending") {
          currentPending = null;
          if (((match.status || "").toLowerCase() === "success" || (match.status || "").toLowerCase() === "approved") && state.stb) {
=======
        if (match && match.status !== "pending") {
          currentPending = null;
          if (match.status === "success" && state.stb) {
>>>>>>> vercel-target/main:src/services/store.ts
            state = {
              ...state,
              stb: {
                ...state.stb,
                currentPlan: match.planName,
                expiry: new Date(Date.now() + 30 * 86400000).toISOString(),
                active: true,
              },
            };
          }
        }
      }

<<<<<<< HEAD:frontend/src/services/store.ts
      setState({ txns: [...mergedTxns], pending: currentPending });
=======
      setState({ txns: mergedTxns, pending: currentPending });
>>>>>>> vercel-target/main:src/services/store.ts
    }
  } catch (e) {
    console.warn("Failed to sync pending recharges from backend", e);
  }
}

export async function syncProductRequestsFromBackend() {
  try {
    const res = await apiGetProductRequests();
    if (res.success && res.data?.requests) {
      const backendReqs: ProductRequest[] = res.data.requests.map((r: any) => ({
        id: r._id || r.id,
        stbId: r.stbId || "STB-UNKNOWN",
        customerName: r.customerName || "Customer",
        customerMobile: r.customerMobile || "",
        productId: r.productId,
        productName: r.productName,
        category: r.category || "accessory",
        quantity: r.quantity || 1,
        unitPrice: r.unitPrice || 0,
        totalAmount: r.totalAmount || 0,
        description: r.description || "",
        imageUrl: r.imageUrl || "",
        status: r.status || "Pending",
        createdAt: r.createdAt || new Date().toISOString(),
        technicianName: r.technicianName,
        technicianMobile: r.technicianMobile,
        scheduledDate: r.scheduledDate,
        operatorNote: r.operatorNote,
      }));

      const merged = backendReqs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setState({ productRequests: merged });
    }
  } catch (e) {
    console.warn("Failed to sync product requests from backend", e);
  }
}

export async function syncComplaintsFromBackend() {
  try {
    const res = await apiGetComplaints();
    if (res.success && res.data?.complaints) {
      const backendCmps: Complaint[] = res.data.complaints.map((c: any) => ({
        id: c._id || c.id,
        stbId: c.stbId || "STB-UNKNOWN",
        customerName: c.customerName || "Customer",
        customerMobile: c.customerMobile || "",
        category: c.category || "General Issues",
        issueType: c.issueType || "",
        description: c.description || "",
        mediaUrl: c.mediaUrl || "",
        preferredTime: c.preferredTime || "Anytime",
        status: c.status || "Pending",
        createdAt: c.createdAt || new Date().toISOString(),
        technicianName: c.technicianName,
        technicianMobile: c.technicianMobile,
        assignedAt: c.assignedAt,
        expectedArrival: c.expectedArrival,
        resolvedAt: c.resolvedAt,
        rating: c.rating,
        feedback: c.feedback,
      }));

      const merged = backendCmps.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setState({ complaints: merged });
    }
  } catch (e) {
    console.warn("Failed to sync complaints from backend", e);
  }
}


export async function syncAccountFromBackend(mobileNumber?: string) {
  const targetMobile = mobileNumber || state.user?.mobile;
  if (!targetMobile) return;

  try {
    const res = await apiGetUserProfile(targetMobile);
    if (res.success && res.data?.user) {
      const uData = res.data.user;
      const rechargesData = res.data.recharges || [];
      const prodReqsData = res.data.productRequests || [];
      const complaintsData = res.data.complaints || [];

      const isOpApproved = isOperatorApproved(uData.mobileNumber || targetMobile);
      let resolvedRole: User["role"] = uData.role || state.user?.role || "customer";
      if (uData.mobileNumber === "9080864542" || targetMobile === "9080864542") {
        resolvedRole = "admin";
      } else if (isOpApproved || uData.role === "operator") {
        resolvedRole = "operator";
      }

      const updatedUser: User = {
        ...(state.user || {}),
        id: uData.id || uData._id || `usr-${uData.mobileNumber}`,
        mobile: uData.mobileNumber || targetMobile,
        name: uData.name || state.user?.name || (resolvedRole === "operator" ? "Operator" : "Customer"),
        stbId: uData.stbId || state.user?.stbId || `STB-${uData.mobileNumber.slice(-6)}`,
        role: resolvedRole,
      };


      const defaultExpiry = new Date(Date.now() + 15 * 86400000).toISOString();
      const expiryDate = uData.expiryDate
        ? new Date(uData.expiryDate).toISOString()
        : state.stb?.expiry || defaultExpiry;

      const updatedStb: STB = {
        id: updatedUser.stbId || "1234567890",
        customerName: updatedUser.name || "Customer",
        currentPlan: uData.currentPlan || state.stb?.currentPlan || "Basic Tamil Silver Pack Monthly Rs 240",
        expiry: expiryDate,
        active: uData.status !== "Inactive",
      };

      const userTxns: Txn[] = rechargesData.map((r: any) => ({
        id: r._id || r.id,
        planName: r.planId?.name || r.planName || "STB Recharge",
        amount: r.amount || r.planId?.price || 0,
        date: r.requestTime || r.createdAt || new Date().toISOString(),
        status: r.status === "Approved" ? "success" : r.status === "Rejected" ? "failed" : "pending",
        approvedAt: r.approvedTime,
        customerName: r.customerName || updatedUser.name,
        customerMobile: r.customerMobile || updatedUser.mobile,
        stbId: r.stbId || updatedUser.stbId,
        startedAt: new Date(r.requestTime || r.createdAt).getTime(),
      }));

      const userProdReqs: ProductRequest[] = prodReqsData.map((r: any) => ({
        id: r._id || r.id,
        stbId: r.stbId || updatedUser.stbId || "STB-UNKNOWN",
        customerName: r.customerName || updatedUser.name || "Customer",
        customerMobile: r.customerMobile || updatedUser.mobile || "",
        productId: r.productId,
        productName: r.productName,
        category: r.category || "accessory",
        quantity: r.quantity || 1,
        unitPrice: r.unitPrice || 0,
        totalAmount: r.totalAmount || 0,
        description: r.description || "",
        imageUrl: r.imageUrl || "",
        status: r.status || "Pending",
        createdAt: r.createdAt || new Date().toISOString(),
        technicianName: r.technicianName,
        technicianMobile: r.technicianMobile,
        scheduledDate: r.scheduledDate,
        operatorNote: r.operatorNote,
      }));

      const userComplaints: Complaint[] = complaintsData.map((c: any) => ({
        id: c._id || c.id,
        stbId: c.stbId || updatedUser.stbId || "STB-UNKNOWN",
        customerName: c.customerName || updatedUser.name || "Customer",
        customerMobile: c.customerMobile || updatedUser.mobile || "",
        category: c.category || "General Issues",
        issueType: c.issueType || "",
        description: c.description || "",
        mediaUrl: c.mediaUrl || "",
        preferredTime: c.preferredTime || "Anytime",
        status: c.status || "Pending",
        createdAt: c.createdAt || new Date().toISOString(),
        technicianName: c.technicianName,
        technicianMobile: c.technicianMobile,
        assignedAt: c.assignedAt,
        expectedArrival: c.expectedArrival,
        resolvedAt: c.resolvedAt,
        rating: c.rating,
        feedback: c.feedback,
      }));

      if (updatedUser.role === "customer") {
        setState({
          user: updatedUser,
          stb: updatedStb,
          txns: userTxns,
          productRequests: userProdReqs,
          complaints: userComplaints,
          ready: true,
        });
      } else {
        setState({
          user: updatedUser,
          stb: updatedStb,
          ready: true,
        });
      }
    }
  } catch (err) {
    console.warn("Failed to sync account from backend", err);
  }
}

let pollTimer: any = null;

export async function initStore() {
  if (booted || typeof window === "undefined") return;
  booted = true;
  state = loadSavedState();
  setState({ ready: true });

  if (state.user?.mobile) {
    syncAccountFromBackend(state.user.mobile);
  }

  syncOperatorsFromBackend();
  syncPendingRechargesFromBackend();
  syncProductRequestsFromBackend();
  syncComplaintsFromBackend();

  if (!pollTimer) {
    pollTimer = setInterval(() => {
      if (state.user?.mobile) {
        syncAccountFromBackend(state.user.mobile);
      }
      syncPendingRechargesFromBackend();
      syncProductRequestsFromBackend();
      syncComplaintsFromBackend();
    }, 4000);
  }
}


export async function refreshUserData() {
  setState({ ready: true });
  if (state.user?.mobile) {
    await syncAccountFromBackend(state.user.mobile);
  }
}

export async function refreshAdminData() {
  setState({ ready: true });
  syncOperatorsFromBackend();
}

export async function refreshCatalogue() {
  setState({ ready: true });
}

// Auth helpers
export function sendOtp(mobile: string) {
  console.log(`[STB Local Auth] OTP for ${mobile} is ready`);
  return Promise.resolve();
}

export function isOperatorApproved(contact: string): boolean {
  if (!contact) return false;
  const cleaned = cleanContact(contact);
  const digitsOnly = cleanMobile(contact);
  const trimmed = contact.trim().toLowerCase();

  if (digitsOnly === "9080864542" || digitsOnly === "9787312758" || cleaned === "9080864542" || cleaned === "9787312758") return true;

  return state.approvedOperators.some((op) => {
    if (!op.active) return false;
    const opCleaned = cleanContact(op.mobile);
    const opDigits = cleanMobile(op.mobile);
    const opCleanStr = op.mobile.trim().toLowerCase();
    return (
      (cleaned.length > 0 && opCleaned === cleaned) ||
      (digitsOnly.length > 0 && opDigits === digitsOnly) ||
      (opDigits.length >= 5 && digitsOnly.includes(opDigits)) ||
      (opDigits.length >= 5 && opDigits.includes(digitsOnly)) ||
      opCleanStr === trimmed
    );
  });
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
  const isEmail = mobile.includes("@");
  const cleanedMobile = isEmail ? mobile.trim().toLowerCase() : cleanMobile(mobile);
  if (otp.trim().length < 4) return false;
  if (!isEmail && cleanedMobile.length < 10 && cleanedMobile !== "9080864542") return false;

  await syncOperatorsFromBackend();

  let effectiveRole: User["role"] = role;
  if (cleanedMobile === "9080864542") {
    effectiveRole = "admin";
  } else if (isOperatorApproved(mobile)) {
    effectiveRole = "operator";
  }

  if (isCustomerBlocked(mobile) && effectiveRole === "customer") {
    return false;
  }

  try {
    const res = await apiVerifyOtp(cleanedMobile, otp, name, extra?.stbId);
    if (res.success && res.data?.user?.role) {
      effectiveRole = res.data.user.role as User["role"];
    }
  } catch (e) {
    console.warn("Backend verify OTP warning:", e);
  }

  const user: User = {
    id: `usr-${cleanedMobile}`,
    mobile: cleanedMobile,
    name: name || (effectiveRole === "admin" ? "Kathiravan V" : "Customer"),
    email: extra?.email || (isEmail ? mobile : mobileToEmail(cleanedMobile)),
    stbId: extra?.stbId || `STB-${cleanedMobile.slice(-6)}`,
    operatorNumber: extra?.operatorNumber,
    role: effectiveRole,
  };

  const stb: STB = {
    id: user.stbId || "1234567890",
    customerName: user.name || "Customer",
    currentPlan: "Basic Tamil Silver Pack Monthly Rs 240",
    expiry: new Date(Date.now() + 15 * 86400000).toISOString(),
    active: true,
  };

  setState({ user, stb, ready: true });
  await syncAccountFromBackend(cleanedMobile);
  return true;
}


export async function logout() {
<<<<<<< HEAD:frontend/src/services/store.ts
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("stb_recharge_jwt_token");
      sessionStorage.clear();
    } catch (e) {
      console.warn("Storage clear error on logout", e);
    }
  }
  state = {
    ...defaultState,
    user: null,
    stb: null,
    pending: null,
    txns: [],
    appliedCoupon: null,
    ready: true,
  };
  emit();
=======
  setState({ user: null, stb: null, pending: null, appliedCoupon: null, ready: true });
>>>>>>> vercel-target/main:src/services/store.ts
}

// STB management
export async function fetchStb(id: string): Promise<STB | null> {
  if (state.user?.mobile) {
    await syncAccountFromBackend(state.user.mobile);
  }
  return state.stb;
}


// Transactions & Recharge Flow
export async function startPayment(
  planId: string,
  amount: number,
  planName: string,
  customDetails?: { stbId?: string; customerName?: string; customerMobile?: string },
) {
  const localTxnId = "TXN" + Math.floor(Math.random() * 900000 + 100000);
  const now = Date.now();
  const user = state.user;
  const stb = state.stb;

<<<<<<< HEAD:frontend/src/services/store.ts
  const rawStbId = customDetails?.stbId || stb?.id || user?.stbId || "1234567890";
  const targetStbId = rawStbId.trim().toUpperCase();
=======
  const targetStbId = customDetails?.stbId || stb?.id || user?.stbId || "1234567890";
>>>>>>> vercel-target/main:src/services/store.ts
  const targetCustomerName = customDetails?.customerName || user?.name || "Customer";
  const targetCustomerMobile = customDetails?.customerMobile || user?.mobile || "";

  const pending = { txnId: localTxnId, planName, amount, startedAt: now };

  const newTxn: Txn = {
    id: localTxnId,
    planName,
    amount,
    date: new Date(now).toISOString(),
    status: "pending",
    customerName: targetCustomerName,
    customerMobile: targetCustomerMobile,
    stbId: targetStbId,
    startedAt: now,
<<<<<<< HEAD:frontend/src/services/store.ts
    syncedToBackend: true, // Prevent concurrent auto-retry loop duplicate creation
=======
    syncedToBackend: false,
>>>>>>> vercel-target/main:src/services/store.ts
  };

  setState({
    pending,
    txns: [newTxn, ...state.txns],
  });

  try {
    const res = await apiCreateRecharge({
<<<<<<< HEAD:frontend/src/services/store.ts
      userId: user?.id,
=======
>>>>>>> vercel-target/main:src/services/store.ts
      stbId: targetStbId,
      planId,
      planName,
      amount,
      customerName: targetCustomerName,
      customerMobile: targetCustomerMobile,
      paymentStatus: "Success",
    });

    const backendId =
      res.data?.rechargeRequest?._id ||
      (res.data as any)?.data?.rechargeRequest?._id ||
      (res.data as any)?.rechargeRequest?.id;

    if (res.success && backendId) {
      const currentPending = state.pending;
      const isPendingMatch = currentPending?.txnId === localTxnId;
      const updatedTxns = state.txns.map((t) =>
<<<<<<< HEAD:frontend/src/services/store.ts
        t.id === localTxnId ? { ...t, id: backendId, stbId: targetStbId, syncedToBackend: true } : t,
=======
        t.id === localTxnId ? { ...t, id: backendId, syncedToBackend: true } : t,
>>>>>>> vercel-target/main:src/services/store.ts
      );
      setState({
        txns: updatedTxns,
        pending: isPendingMatch && currentPending ? { ...currentPending, txnId: backendId } : state.pending,
      });
    } else {
      console.warn("apiCreateRecharge info:", res.error || "Backend request queued");
    }
  } catch (err: any) {
    console.warn("Failed to save recharge to backend:", err.message);
  }
}

export async function approveTxn(txnId: string) {
  const now = new Date().toISOString();
  const updatedTxns = state.txns.map((t) =>
    t.id === txnId ? { ...t, status: "success" as const, approvedAt: now } : t,
  );
  const target = updatedTxns.find((t) => t.id === txnId);

  let newStb = state.stb;
  if (target && newStb) {
    newStb = {
      ...newStb,
      currentPlan: target.planName,
      expiry: new Date(Date.now() + 30 * 86400000).toISOString(),
      active: true,
    };
  }

  const isPendingCleared = state.pending?.txnId === txnId;
  setState({
    txns: updatedTxns,
    stb: newStb,
    pending: isPendingCleared ? null : state.pending,
  });

  apiApproveRecharge(txnId);
}

export async function rejectTxn(txnId: string) {
  const updatedTxns = state.txns.map((t) =>
    t.id === txnId ? { ...t, status: "failed" as const } : t,
  );
  const isPendingCleared = state.pending?.txnId === txnId;
  setState({
    txns: updatedTxns,
    pending: isPendingCleared ? null : state.pending,
  });

  apiRejectRecharge(txnId);
}


// Product Requests
export async function requestProduct(payload: {
  productId: string;
  quantity?: number;
  description: string;
  imageUrl?: string;
  stbId?: string;
  customerName?: string;
  customerMobile?: string;
}) {
  const u = state.user;
  const stb = state.stb;
  const prod = state.products.find((p) => p.id === payload.productId);

  const localId = "REQ" + Math.floor(Math.random() * 900000 + 100000);
  const req: ProductRequest = {
    id: localId,
    stbId: payload.stbId || stb?.id || u?.stbId || "1234567890",
    customerName: payload.customerName || u?.name || "Customer",
    customerMobile: payload.customerMobile || u?.mobile || "",
    productId: payload.productId,
    productName: prod?.name || "Accessory/Service Request",
    category: prod?.category || "accessory",
    quantity: payload.quantity || 1,
    unitPrice: prod?.price || 0,
    totalAmount: (prod?.price || 0) * (payload.quantity || 1),
    description: payload.description,
    imageUrl: payload.imageUrl,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  setState({ productRequests: [req, ...state.productRequests] });

  try {
    const res = await apiCreateProductRequest(req);
    if (res.success && res.data?.productRequest?._id) {
      const backendId = res.data.productRequest._id;
      const updated = state.productRequests.map((r) => (r.id === localId ? { ...r, id: backendId } : r));
      setState({ productRequests: updated });
    }
  } catch (err) {
    console.warn("Failed to save product request to backend", err);
  }
}

export async function updateProductStatus(
  id: string,
  patch: Partial<ProductRequest> & { status: ProductRequestStatus },
) {
  const updated = state.productRequests.map((r) => (r.id === id ? { ...r, ...patch } : r));
  setState({ productRequests: updated });

  try {
    await apiUpdateProductRequestStatus(id, patch);
  } catch (err) {
    console.warn("Failed to update product request status on backend", err);
  }
}

// Complaints
export async function fileComplaint(payload: {
  category: string;
  issueType: string;
  description: string;
  mediaUrl?: string;
  preferredTime: string;
  stbId?: string;
  customerName?: string;
  customerMobile?: string;
}) {
  const u = state.user;
  const stb = state.stb;

  const localId = "CMP" + Math.floor(Math.random() * 900000 + 100000);
  const cmp: Complaint = {
    id: localId,
    stbId: payload.stbId || stb?.id || u?.stbId || "1234567890",
    customerName: payload.customerName || u?.name || "Customer",
    customerMobile: payload.customerMobile || u?.mobile || "",
    category: payload.category,
    issueType: payload.issueType,
    description: payload.description,
    mediaUrl: payload.mediaUrl,
    preferredTime: payload.preferredTime,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  setState({ complaints: [cmp, ...state.complaints] });

  try {
    const res = await apiCreateComplaint(cmp);
    if (res.success && res.data?.complaint?._id) {
      const backendId = res.data.complaint._id;
      const updated = state.complaints.map((c) => (c.id === localId ? { ...c, id: backendId } : c));
      setState({ complaints: updated });
    }
  } catch (err) {
    console.warn("Failed to save complaint to backend", err);
  }
}

export async function updateComplaintStatus(
  id: string,
  patch: Partial<Complaint> & { status: ComplaintStatus },
) {
  const updated = state.complaints.map((c) => (c.id === id ? { ...c, ...patch } : c));
  setState({ complaints: updated });

  try {
    await apiUpdateComplaintStatus(id, patch);
  } catch (err) {
    console.warn("Failed to update complaint status on backend", err);
  }
}

export async function rateComplaint(id: string, rating: number, feedback?: string) {
  const updated = state.complaints.map((c) => (c.id === id ? { ...c, rating, feedback } : c));
  setState({ complaints: updated });

  try {
    await apiUpdateComplaintStatus(id, { rating, feedback });
  } catch (err) {
    console.warn("Failed to submit rating on backend", err);
  }
}

// Settings & Coupons
export function toggleAutoRecharge(planId?: string) {
  setState({
    autoRecharge: {
      enabled: !state.autoRecharge.enabled,
      planId: planId ?? state.autoRecharge.planId,
    },
  });
}

export function applyCoupon(code: string): { success: boolean; discount: number; message: string } {
  const clean = code.trim().toUpperCase();
  if (clean === "SAVE50") {
    setState({ appliedCoupon: clean });
    return { success: true, discount: 50, message: "Rs 50 discount applied!" };
  }
  if (clean === "STB10") {
    setState({ appliedCoupon: clean });
    return { success: true, discount: 10, message: "10% discount applied!" };
  }
  return { success: false, discount: 0, message: "Invalid promo code" };
}

// Admin Operations
export async function upsertOperator(mobile: string, name: string, active = true): Promise<{ success: boolean; message?: string }> {
  const cleaned = cleanContact(mobile);
  if (!cleaned) {
    return { success: false, message: "Invalid mobile number or email address" };
  }
  const exists = state.approvedOperators.find((o) => cleanContact(o.mobile) === cleaned);
  let updatedOps: ApprovedOperator[];
  if (exists) {
    updatedOps = state.approvedOperators.map((o) =>
      cleanContact(o.mobile) === cleaned ? { ...o, mobile: cleaned, name, active } : o,
    );
  } else {
    updatedOps = [
      ...state.approvedOperators,
      { id: "op-" + Date.now(), mobile: cleaned, name, addedAt: new Date().toISOString(), active },
    ];
  }
  setState({ approvedOperators: updatedOps });

  try {
    const res = await apiAddOperator(cleaned, name);
    if (!res.success) {
      console.warn("Backend add operator warning:", res.error);
      return { success: false, message: res.error || "Failed to save operator to server database" };
    }
    return { success: true };
  } catch (err: any) {
    console.warn("apiAddOperator error:", err);
    return { success: false, message: err.message || "Network request failed" };
  }
}

export async function setOperatorActive(id: string, active: boolean) {
  const op = state.approvedOperators.find((o) => o.id === id);
  const updated = state.approvedOperators.map((o) => (o.id === id ? { ...o, active } : o));
  setState({ approvedOperators: updated });
  if (op) {
    apiToggleOperator(op.mobile);
  }
}

export async function removeApprovedOperator(id: string) {
  setState({ approvedOperators: state.approvedOperators.filter((o) => o.id !== id) });
  apiDeleteOperator(id);
}

export async function blockCustomer(identifier: string) {
  const cleaned = identifier.trim();
  if (!state.blockedCustomers.includes(cleaned)) {
    setState({ blockedCustomers: [...state.blockedCustomers, cleaned] });
  }
}

export async function unblockCustomer(identifier: string) {
  const cleaned = identifier.trim();
  setState({
    blockedCustomers: state.blockedCustomers.filter((c) => c !== cleaned),
  });
}

export async function upsertProduct(prod: Partial<Product> & { id: string; name: string }) {
  const exists = state.products.find((p) => p.id === prod.id);
  let updated: Product[];
  if (exists) {
    updated = state.products.map((p) => (p.id === prod.id ? { ...p, ...prod } : p));
  } else {
    const newP: Product = {
      id: prod.id,
      name: prod.name,
      category: prod.category || "accessory",
      price: prod.price || 100,
      availableStock: prod.availableStock || 50,
      soldQuantity: prod.soldQuantity || 0,
      description: prod.description,
      iconName: prod.iconName,
    };
    updated = [...state.products, newP];
  }
  setState({ products: updated });
}

export async function removeProduct(id: string) {
  setState({ products: state.products.filter((p) => p.id !== id) });
}

export async function resetAllData() {
  setState({ ...defaultState, ready: true });
}

export function formatName(name?: string) {
  if (!name) return "Customer";
  return name.trim();
}
