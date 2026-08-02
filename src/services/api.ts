// API Integration Service for Backend & MongoDB Atlas Database

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || "API request failed" };
    }
    return { success: true, data };
  } catch (err: any) {
    console.warn(`[API Info] ${endpoint} request error:`, err.message);
    return { success: false, error: err.message };
  }
}

// Auth API Calls
export async function apiSendOtp(mobileNumber: string) {
  return apiRequest("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ mobileNumber }),
  });
}

export async function apiVerifyOtp(mobileNumber: string, otp: string, name?: string, stbId?: string) {
  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ mobileNumber, otp, name, stbId }),
  });
}

// Admin API Calls
export async function apiAddOperator(mobileNumber: string, name: string) {
  return apiRequest("/admin/operator/add", {
    method: "POST",
    body: JSON.stringify({ mobileNumber, name }),
  });
}

export async function apiToggleOperator(mobileNumber: string) {
  return apiRequest("/admin/operator/toggle", {
    method: "POST",
    body: JSON.stringify({ mobileNumber }),
  });
}

export async function apiDeleteOperator(id: string) {
  return apiRequest(`/admin/operator/${id}`, {
    method: "DELETE",
  });
}

export async function apiGetOperators() {
  return apiRequest<{ operators: any[] }>("/admin/operators");
}

// Recharges API Calls
export async function apiGetPlans() {
  return apiRequest<{ plans: any[] }>("/plans");
}

export async function apiCreateRecharge(stbId: string, planId: string, amount: number) {
  return apiRequest("/recharge/create", {
    method: "POST",
    body: JSON.stringify({ stbId, planId, amount }),
  });
}

// Complaints API Calls
export async function apiCreateComplaint(payload: any) {
  return apiRequest("/complaint/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Products API Calls
export async function apiGetProducts() {
  return apiRequest<{ products: any[] }>("/products");
}
