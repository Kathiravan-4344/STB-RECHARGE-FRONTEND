// Lightweight mock store for STB Recharge prototype.
// Persists via localStorage. No backend.
import { useEffect, useState, useSyncExternalStore } from "react";

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
  startedAt?: number; // ms timestamp
};

export type STB = {
  id: string;
  customerName: string;
  currentPlan: string;
  expiry: string; // ISO
  active: boolean;
};

export type User = {
  mobile: string;
  name?: string;
  email?: string;
  operatorNumber?: string;
  role: "operator" | "customer";
};

export type State = {
  user: User | null;
  stb: STB | null;
  autoRecharge: { enabled: boolean; planId?: string };
  pending: { txnId: string; planName: string; amount: number; startedAt: number } | null;
  txns: Txn[];
  products: Product[];
  productRequests: ProductRequest[];
  complaints: Complaint[];
  appliedCoupon: string | null;
};

const KEY = "stb_recharge_state_v1";

const INITIAL_SEED_TXNS: Txn[] = [
  {
    id: "TXN849120",
    planName: "Basic Tamil Silver Pack Monthly Rs 240",
    amount: 240,
    date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    startedAt: Date.now() - 10 * 60 * 1000,
    status: "pending",
    customerName: "Rahul Sharma",
    customerMobile: "9876543210",
    stbId: "1234567890",
  },
  {
    id: "TXN731945",
    planName: "Basic Tamil HD Packs Rs 300",
    amount: 300,
    date: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    startedAt: Date.now() - 35 * 60 * 1000,
    status: "pending",
    customerName: "Priya Verma",
    customerMobile: "9988776655",
    stbId: "9999999999",
  },
  {
    id: "TXN612840",
    planName: "Basic Tamil Pack Monthly Rs 220",
    amount: 220,
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    startedAt: Date.now() - 2 * 3600 * 1000,
    status: "success",
    approvedAt: new Date(Date.now() - 1.9 * 3600 * 1000).toISOString(),
    customerName: "Anand Kumar",
    customerMobile: "9765432109",
    stbId: "5544332211",
  },
  {
    id: "TXN489123",
    planName: "Sports Pack Rs 49",
    amount: 49,
    date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    startedAt: Date.now() - 5 * 3600 * 1000,
    status: "failed",
    customerName: "Karthik Raja",
    customerMobile: "9123456780",
    stbId: "7788990011",
  },
];

export const INITIAL_SEED_PRODUCTS: Product[] = [
  { id: "p1", name: "HDMI Cable", category: "accessory", price: 150, availableStock: 15, soldQuantity: 8, description: "High-speed 1.5m 4K HDMI cable for crisp video & clear audio." },
  { id: "p2", name: "AV Cable", category: "accessory", price: 100, availableStock: 12, soldQuantity: 5, description: "3-RCA Red White Yellow Audio-Video Cable." },
  { id: "p3", name: "Remote Control", category: "accessory", price: 250, availableStock: 5, soldQuantity: 14, description: "Universal STB Remote with learning keys." },
  { id: "p4", name: "STB Adapter / Power Supply", category: "accessory", price: 200, availableStock: 8, soldQuantity: 6, description: "12V 1.5A original STB power adapter." },
  { id: "p5", name: "Set Top Box Replacement", category: "accessory", price: 799, availableStock: 4, soldQuantity: 2, description: "HD Digital STB unit swap with warranty." },
  { id: "p6", name: "Dish Cable", category: "accessory", price: 180, availableStock: 25, soldQuantity: 10, description: "Heavy-duty RG6 Coaxial cable (per 10 meters)." },
  { id: "p7", name: "Connector", category: "accessory", price: 40, availableStock: 50, soldQuantity: 30, description: "F-type waterproof coaxial cable connector pack." },
  { id: "p8", name: "Splitter", category: "accessory", price: 120, availableStock: 18, soldQuantity: 7, description: "2-Way Signal Splitter for multi-connection." },
  { id: "p9", name: "Other Accessories", category: "accessory", price: 150, availableStock: 20, soldQuantity: 3, description: "Wall brackets, clip sets, and cable ties." },
  
  // Installation services
  { id: "s1", name: "New STB Installation", category: "service", price: 350, availableStock: 99, soldQuantity: 12, description: "Full new connection setup with dish alignment & box activation." },
  { id: "s2", name: "Cable Replacement", category: "service", price: 200, availableStock: 99, soldQuantity: 8, description: "Inspection and re-wiring of old RG6 co-axial cables." },
  { id: "s3", name: "Extra Connection Request", category: "service", price: 500, availableStock: 99, soldQuantity: 4, description: "Multi-TV extension installation with secondary box." },
  { id: "s4", name: "STB Replacement Installation", category: "service", price: 300, availableStock: 99, soldQuantity: 6, description: "On-site swapping and re-configuration of replacement STB." },
  { id: "s5", name: "HDMI/AV Setup", category: "service", price: 150, availableStock: 99, soldQuantity: 15, description: "TV display calibration and audio output configuration." },
];

export const INITIAL_SEED_PRODUCT_REQUESTS: ProductRequest[] = [
  {
    id: "PR-90412",
    stbId: "1234567890",
    customerName: "Rahul Sharma",
    customerMobile: "9876543210",
    productId: "p3",
    productName: "Remote Control",
    category: "accessory",
    quantity: 1,
    unitPrice: 250,
    totalAmount: 250,
    description: "Buttons are un-responsive on my current STB remote control.",
    status: "Pending",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "PR-88124",
    stbId: "9999999999",
    customerName: "Priya Verma",
    customerMobile: "9988776655",
    productId: "p1",
    productName: "HDMI Cable",
    category: "accessory",
    quantity: 2,
    unitPrice: 150,
    totalAmount: 300,
    description: "Need 2 long HDMI cables for living room wall mount.",
    status: "Out for Delivery",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "PR-77310",
    stbId: "5544332211",
    customerName: "Anand Kumar",
    customerMobile: "9765432109",
    productId: "s1",
    productName: "New STB Installation",
    category: "service",
    quantity: 1,
    unitPrice: 350,
    totalAmount: 350,
    description: "Shifting to new apartment. Need full dish alignment & installation.",
    status: "Installation Scheduled",
    technicianName: "Ramesh Kumar",
    technicianMobile: "9840192837",
    scheduledDate: "Tomorrow at 11:00 AM",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_SEED_COMPLAINTS: Complaint[] = [
  {
    id: "CMP-90142",
    stbId: "1234567890",
    customerName: "Rahul Sharma",
    customerMobile: "9876543210",
    category: "TV Issues",
    issueType: "No Signal",
    description: "Screen displays E48-32 No Signal error code since morning rain.",
    preferredTime: "Immediate Emergency",
    status: "In Progress",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    technicianName: "Ramesh Kumar",
    technicianMobile: "9840192837",
    assignedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    expectedArrival: "In 15 Minutes",
  },
  {
    id: "CMP-88105",
    stbId: "9999999999",
    customerName: "Priya Verma",
    customerMobile: "9988776655",
    category: "STB Issues",
    issueType: "STB Power Problem",
    description: "Red power light is blinking rapidly and box won't boot up.",
    preferredTime: "Evening (4 PM - 7 PM)",
    status: "Pending",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "CMP-77012",
    stbId: "5544332211",
    customerName: "Anand Kumar",
    customerMobile: "9765432109",
    category: "Cable Connection Issues",
    issueType: "Cable Cut",
    description: "Coaxial wire cut near terrace wall due to tree branch.",
    preferredTime: "Morning (9 AM - 12 PM)",
    status: "Resolved",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    technicianName: "Suresh Babu",
    technicianMobile: "9710293847",
    assignedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    rating: 5,
    feedback: "Excellent technician! Fixed the cable splice quickly and checked all channels.",
  },
];

const defaultState: State = {
  user: null,
  stb: null,
  autoRecharge: { enabled: false },
  pending: null,
  txns: INITIAL_SEED_TXNS,
  products: INITIAL_SEED_PRODUCTS,
  productRequests: INITIAL_SEED_PRODUCT_REQUESTS,
  complaints: INITIAL_SEED_COMPLAINTS,
  appliedCoupon: null,
};

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      txns: parsed.txns && parsed.txns.length > 0 ? parsed.txns : INITIAL_SEED_TXNS,
      products: parsed.products && parsed.products.length > 0 ? parsed.products : INITIAL_SEED_PRODUCTS,
      productRequests: parsed.productRequests && parsed.productRequests.length > 0 ? parsed.productRequests : INITIAL_SEED_PRODUCT_REQUESTS,
      complaints: parsed.complaints && parsed.complaints.length > 0 ? parsed.complaints : INITIAL_SEED_COMPLAINTS,
    };
  } catch {
    return defaultState;
  }
}
function save() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}
function emit() { listeners.forEach((l) => l()); }

export function getState() { return state; }
export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  save(); emit();
}
export function subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); }

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => subscribe(l),
    () => selector(state),
    () => selector(defaultState),
  );
}

// ---------- Mock actions ----------
export function sendOtp(mobile: string) {
  // pretend to send
  console.log(`[MOCK OTP] Sent 123456 to ${mobile}`);
  return Promise.resolve();
}
export function verifyOtp(
  mobile: string,
  otp: string,
  name?: string,
  role: "operator" | "customer" = "customer",
  extra?: { email?: string; operatorNumber?: string }
) {
  if (otp === "123456" || otp.length === 6) {
    const displayName = name || (role === "operator" ? "Operator Admin" : "Customer");
    setState({
      user: {
        mobile,
        name: displayName,
        role,
        email: extra?.email,
        operatorNumber: extra?.operatorNumber,
      },
    });
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

export function logout() {
  setState({ user: null, stb: null, pending: null });
}

const MOCK_STB: Record<string, STB> = {
  "1234567890": {
    id: "1234567890",
    customerName: "Rahul Sharma",
    currentPlan: "Premium HD Monthly",
    expiry: new Date(Date.now() + 3 * 86400000).toISOString(),
    active: true,
  },
  "9999999999": {
    id: "9999999999",
    customerName: "Priya Verma",
    currentPlan: "Basic Pack",
    expiry: new Date(Date.now() - 2 * 86400000).toISOString(),
    active: false,
  },
};

export function fetchStb(id: string): Promise<STB | null> {
  const cleaned = id.trim();
  const stb = MOCK_STB[cleaned] ?? {
    id: cleaned,
    customerName: "Guest Customer",
    currentPlan: "Standard SD Pack",
    expiry: new Date(Date.now() + 5 * 86400000).toISOString(),
    active: true,
  };
  setState({ stb });
  return Promise.resolve(stb);
}

export const PLANS: Plan[] = [
  { id: "m1", name: "Basic Tamil Pack Monthly Rs 220", price: 220, validityDays: 30, category: "Monthly", features: ["150+ SD Channels", "Standard Definition", "1 STB"], channels: 150 },
  { id: "m2", name: "Basic Tamil Silver Pack Monthly Rs 240", price: 240, validityDays: 30, category: "Monthly", features: ["300+ HD Channels", "Full HD Quality", "OTT App bundle"], popular: true, channels: 300 },
  { id: "m3", name: "Basic Tamil HD Packs Rs 300", price: 300, validityDays: 30, category: "Monthly", features: ["400+ Channels", "4K where available", "3 months validity"], channels: 400 },
  { id: "c1", name: "Sports Pack Rs 49", price: 49, validityDays: 30, category: "Channels", features: ["Star Sports HD", "Sony Sports", "Willow Cricket"], channels: 18 },
  { id: "c2", name: "HD Movies Pack Rs 79", price: 79, validityDays: 30, category: "Channels", features: ["Star Movies", "&pictures HD", "Sony Pix"], channels: 22 },
  { id: "c3", name: "Kids Pack Rs 49", price: 49, validityDays: 30, category: "Channels", features: ["Cartoon Network", "Nick HD+", "Disney"], channels: 12 },
  { id: "a1", name: "OTT Add-on (Hotstar)", price: 99, validityDays: 30, category: "Add-on", features: ["Disney+ Hotstar Mobile", "1 device"] },
  { id: "a2", name: "Regional Bhasha Pack", price: 59, validityDays: 30, category: "Add-on", features: ["25+ regional channels"] },
];

export function startPayment(planId: string, amount: number, planName: string) {
  const txnId = "TXN" + Math.floor(Math.random() * 900000 + 100000);
  const now = Date.now();
  const currentUser = state.user;
  const currentStb = state.stb;

  const newTxn: Txn = {
    id: txnId,
    planName,
    amount,
    date: new Date(now).toISOString(),
    startedAt: now,
    status: "pending",
    customerName: currentUser?.name || currentStb?.customerName || "Customer",
    customerMobile: currentUser?.mobile || "9876543210",
    stbId: currentStb?.id || "1234567890",
  };

  setState((s) => ({
    pending: { txnId, planName, amount, startedAt: now },
    txns: [newTxn, ...s.txns],
  }));
  return txnId;
}

export function approvePending(txnId: string) {
  setState((s) => {
    const nowIso = new Date().toISOString();
    const targetTxn = s.txns.find((t) => t.id === txnId);

    const updatedTxns = s.txns.map((t) => (t.id === txnId ? { ...t, status: "success" as const, approvedAt: nowIso } : t));
    const isCurrentPending = s.pending?.txnId === txnId;

    return {
      pending: isCurrentPending ? null : s.pending,
      txns: updatedTxns,
      stb: s.stb && (isCurrentPending || (targetTxn && s.stb.id === targetTxn.stbId))
        ? {
          ...s.stb,
          active: true,
          currentPlan: targetTxn?.planName || s.stb.currentPlan,
          expiry: new Date(Date.now() + 30 * 86400000).toISOString(),
        }
        : s.stb,
    };
  });
}

export function rejectPending(txnId: string) {
  setState((s) => ({
    pending: s.pending?.txnId === txnId ? null : s.pending,
    txns: s.txns.map((t) => (t.id === txnId ? { ...t, status: "failed" as const } : t)),
  }));
}

// countdown hook
export function useCountdown(startedAt: number, durationMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const remaining = Math.max(0, startedAt + durationMs - now);
  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);
  return { remaining, label: `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`, pct: 1 - remaining / durationMs };
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

// ---------- Product & Service Request Actions ----------
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
  const targetProduct = state.products.find((p) => p.id === input.productId);
  const productName = targetProduct?.name || "Product / Service";
  const category = targetProduct?.category || "accessory";
  const unitPrice = targetProduct?.price || 0;
  const totalAmount = unitPrice * input.quantity;

  const newReq: ProductRequest = {
    id: reqId,
    stbId: input.stbId,
    customerName: input.customerName,
    customerMobile: input.customerMobile,
    productId: input.productId,
    productName,
    category,
    quantity: input.quantity,
    unitPrice,
    totalAmount,
    description: input.description,
    imageUrl: input.imageUrl,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  setState((s) => ({
    productRequests: [newReq, ...s.productRequests],
  }));

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
  }
) {
  setState((s) => {
    const updatedRequests = s.productRequests.map((req) => {
      if (req.id !== id) return req;
      return {
        ...req,
        status,
        ...(details?.technicianName !== undefined && { technicianName: details.technicianName }),
        ...(details?.technicianMobile !== undefined && { technicianMobile: details.technicianMobile }),
        ...(details?.scheduledDate !== undefined && { scheduledDate: details.scheduledDate }),
        ...(details?.operatorNote !== undefined && { operatorNote: details.operatorNote }),
      };
    });

    // If marked Completed, update stock and sold quantity for accessories
    const req = s.productRequests.find((r) => r.id === id);
    let updatedProducts = s.products;
    if (req && status === "Completed" && req.status !== "Completed") {
      updatedProducts = s.products.map((p) => {
        if (p.id === req.productId) {
          const newAvailable = Math.max(0, p.availableStock - req.quantity);
          return {
            ...p,
            availableStock: newAvailable,
            soldQuantity: p.soldQuantity + req.quantity,
          };
        }
        return p;
      });
    }

    return {
      productRequests: updatedRequests,
      products: updatedProducts,
    };
  });
}

export function addProduct(product: Omit<Product, "id" | "soldQuantity">): Product {
  const newId = "p" + (state.products.length + 1) + "_" + Math.floor(Math.random() * 1000);
  const newProduct: Product = {
    ...product,
    id: newId,
    soldQuantity: 0,
  };
  setState((s) => ({
    products: [...s.products, newProduct],
  }));
  return newProduct;
}

export function updateProductStock(id: string, availableStock: number, price?: number) {
  setState((s) => ({
    products: s.products.map((p) =>
      p.id === id
        ? { ...p, availableStock, ...(price !== undefined ? { price } : {}) }
        : p
    ),
  }));
}

// ---------- Complaint Actions ----------
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
    stbId: input.stbId,
    customerName: input.customerName,
    customerMobile: input.customerMobile,
    category: input.category,
    issueType: input.issueType,
    description: input.description,
    mediaUrl: input.mediaUrl,
    preferredTime: input.preferredTime,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  setState((s) => ({
    complaints: [newComplaint, ...s.complaints],
  }));

  return newComplaint;
}

export function updateComplaintStatus(
  id: string,
  status: ComplaintStatus,
  details?: {
    technicianName?: string;
    technicianMobile?: string;
    expectedArrival?: string;
  }
) {
  setState((s) => ({
    complaints: s.complaints.map((c) => {
      if (c.id !== id) return c;
      const nowIso = new Date().toISOString();
      return {
        ...c,
        status,
        ...(details?.technicianName && { technicianName: details.technicianName }),
        ...(details?.technicianMobile && { technicianMobile: details.technicianMobile }),
        ...(details?.expectedArrival && { expectedArrival: details.expectedArrival }),
        ...(status === "Assigned" || status === "In Progress" ? { assignedAt: c.assignedAt || nowIso } : {}),
        ...(status === "Resolved" ? { resolvedAt: nowIso } : {}),
      };
    }),
  }));
}

export function assignTechnicianToComplaint(
  id: string,
  technicianName: string,
  technicianMobile: string,
  expectedArrival: string
) {
  updateComplaintStatus(id, "In Progress", {
    technicianName,
    technicianMobile,
    expectedArrival,
  });
}

export function submitComplaintRating(id: string, rating: number, feedback: string) {
  setState((s) => ({
    complaints: s.complaints.map((c) =>
      c.id === id ? { ...c, rating, feedback } : c
    ),
  }));
}
