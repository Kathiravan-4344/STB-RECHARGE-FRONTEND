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

export async function apiCreateRecharge(payload: {
  stbId: string;
  planId?: string;
  planName?: string;
  amount: number;
  customerName?: string;
  customerMobile?: string;
  paymentStatus?: string;
}) {
  return apiRequest<{ rechargeRequest: any }>("/recharge/create", {
    method: "POST",
    body: JSON.stringify({ paymentStatus: "Success", ...payload }),
  });
}

export async function apiGetPendingRecharges() {
  return apiRequest<{ requests: any[] }>("/recharge/pending");
}

export async function apiApproveRecharge(id: string) {
  return apiRequest(`/operator/approve/${id}`, {
    method: "POST",
  });
}

export async function apiRejectRecharge(id: string) {
  return apiRequest(`/operator/reject/${id}`, {
    method: "POST",
  });
}

export async function apiGetRechargeStatus(id: string) {
  return apiRequest<{ status: string; approvedTime?: string }>(`/recharge/status/${id}`);
}

// Complaints API Calls
export async function apiCreateComplaint(payload: any) {
  return apiRequest<{ complaint: any }>("/complaint/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiGetComplaints() {
  return apiRequest<{ complaints: any[] }>("/complaint/all");
}

export async function apiUpdateComplaintStatus(id: string, patch: any) {
  return apiRequest<{ complaint: any }>(`/complaint/update/${id}`, {
    method: "POST",
    body: JSON.stringify(patch),
  });
}

// Products API Calls
export async function apiGetProducts() {
  return apiRequest<{ products: any[] }>("/products");
}

// Product Requests API Calls
export async function apiCreateProductRequest(payload: any) {
  return apiRequest<{ productRequest: any }>("/product-request/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiGetProductRequests() {
  return apiRequest<{ requests: any[] }>("/product-request/all");
}

export async function apiUpdateProductRequestStatus(id: string, patch: any) {
  return apiRequest<{ productRequest: any }>(`/product-request/update/${id}`, {
    method: "POST",
    body: JSON.stringify(patch),
  });
}


