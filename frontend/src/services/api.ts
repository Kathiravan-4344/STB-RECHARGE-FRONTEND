/// <reference types="vite/client" />
// API Integration Service for Backend & MongoDB Atlas Database

function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  const backendTarget = import.meta.env.VITE_BACKEND_TARGET;

  // Explicit remote production URL (e.g. https://.../api)
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl;
  }

  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    // If mobile or remote client is accessing via IP address or non-localhost domain
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      if (envUrl && envUrl.startsWith("http")) {
        return envUrl.replace("localhost", hostname).replace("127.0.0.1", hostname);
      }
      if (backendTarget && backendTarget.startsWith("http")) {
        return `${backendTarget.replace("localhost", hostname).replace("127.0.0.1", hostname)}/api`;
      }
    }
  }

  return envUrl || "/api";
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
  const primaryBaseUrl = getApiBaseUrl();
  const url = primaryBaseUrl.endsWith("/")
    ? `${primaryBaseUrl.slice(0, -1)}${endpoint}`
    : `${primaryBaseUrl}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || "API request failed" };
    }
    return { success: true, data };
  } catch (primaryErr: any) {
    console.warn(`[API Info] Primary fetch failed for ${endpoint} (${url}):`, primaryErr.message);

    // Fallback: If running on mobile/remote device, retry directly against backend port 5000 on host IP
    if (
      typeof window !== "undefined" &&
      window.location &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      const fallbackUrl = `${window.location.protocol}//${window.location.hostname}:5000/api${endpoint}`;
      try {
        console.info(`[API Fallback] Retrying request to direct host backend: ${fallbackUrl}`);
        const res = await fetch(fallbackUrl, { ...options, headers });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.message || "API request failed" };
        }
        return { success: true, data };
      } catch (fallbackErr: any) {
        console.warn(`[API Info] Fallback fetch also failed (${fallbackUrl}):`, fallbackErr.message);
      }
    }

    return { success: false, error: primaryErr.message || "Failed to fetch from backend server" };
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
  return apiRequest<{ token: string; user: any }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ mobileNumber, otp, name, stbId }),
  });
}

export async function apiGetUserProfile(mobileNumber: string) {
  return apiRequest<{
    user: any;
    recharges: any[];
    productRequests: any[];
    complaints: any[];
  }>(`/auth/profile/${encodeURIComponent(mobileNumber)}`);
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


