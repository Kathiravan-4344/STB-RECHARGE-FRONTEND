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

export type Txn = {
  id: string;
  planName: string;
  amount: number;
  date: string;
  status: "pending" | "success" | "failed";
  approvedAt?: string;
};

export type STB = {
  id: string;
  customerName: string;
  currentPlan: string;
  expiry: string; // ISO
  active: boolean;
};

export type State = {
  user: { mobile: string } | null;
  stb: STB | null;
  autoRecharge: { enabled: boolean; planId?: string };
  pending: { txnId: string; planName: string; amount: number; startedAt: number } | null;
  txns: Txn[];
  appliedCoupon: string | null;
};

const KEY = "stb_recharge_state_v1";

const defaultState: State = {
  user: null,
  stb: null,
  autoRecharge: { enabled: false },
  pending: null,
  txns: [],
  appliedCoupon: null,
};

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
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
export function verifyOtp(mobile: string, otp: string) {
  if (otp === "123456" || otp.length === 6) {
    setState({ user: { mobile } });
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
  { id: "m1", name: "Basic SD Monthly", price: 199, validityDays: 30, category: "Monthly", features: ["150+ SD Channels", "Standard Definition", "1 STB"], channels: 150 },
  { id: "m2", name: "Premium HD Monthly", price: 399, validityDays: 30, category: "Monthly", features: ["300+ HD Channels", "Full HD Quality", "OTT App bundle"], popular: true, channels: 300 },
  { id: "m3", name: "Ultra HD Quarterly", price: 1099, validityDays: 90, category: "Monthly", features: ["400+ Channels", "4K where available", "3 months validity"], channels: 400 },
  { id: "c1", name: "Sports Pack", price: 149, validityDays: 30, category: "Channels", features: ["Star Sports HD", "Sony Sports", "Willow Cricket"], channels: 18 },
  { id: "c2", name: "Movies+ Pack", price: 129, validityDays: 30, category: "Channels", features: ["Star Movies", "&pictures HD", "Sony Pix"], channels: 22 },
  { id: "c3", name: "Kids Pack", price: 79, validityDays: 30, category: "Channels", features: ["Cartoon Network", "Nick HD+", "Disney"], channels: 12 },
  { id: "a1", name: "OTT Add-on (Hotstar)", price: 99, validityDays: 30, category: "Add-on", features: ["Disney+ Hotstar Mobile", "1 device"] },
  { id: "a2", name: "Regional Bhasha Pack", price: 59, validityDays: 30, category: "Add-on", features: ["25+ regional channels"] },
];

export function startPayment(planId: string, amount: number, planName: string) {
  const txnId = "TXN" + Math.floor(Math.random() * 900000 + 100000);
  const now = Date.now();
  setState((s) => ({
    pending: { txnId, planName, amount, startedAt: now },
    txns: [{ id: txnId, planName, amount, date: new Date(now).toISOString(), status: "pending" }, ...s.txns],
  }));
  // auto approve after 12 seconds for demo
  setTimeout(() => approvePending(txnId), 12000);
  return txnId;
}
export function approvePending(txnId: string) {
  setState((s) => {
    if (!s.pending || s.pending.txnId !== txnId) return {};
    const now = new Date().toISOString();
    return {
      pending: null,
      txns: s.txns.map((t) => t.id === txnId ? { ...t, status: "success", approvedAt: now } : t),
      stb: s.stb ? { ...s.stb, active: true, currentPlan: s.pending.planName, expiry: new Date(Date.now() + 30 * 86400000).toISOString() } : s.stb,
    };
  });
}
export function rejectPending(txnId: string) {
  setState((s) => ({
    pending: null,
    txns: s.txns.map((t) => t.id === txnId ? { ...t, status: "failed" } : t),
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
