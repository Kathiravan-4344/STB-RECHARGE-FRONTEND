/// <reference types="vite/client" />
// API Integration Service for Backend & MongoDB Atlas Database

function getApiBaseUrl(): string {
  let envUrl =
    import.meta.env.VITE_API_URL ||
    (import.meta as any).env?.NEXT_PUBLIC_API_URL ||
    (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_API_URL : undefined) ||
    "";

  if (typeof envUrl === "string" && envUrl.trim().length > 0) {
    let clean = envUrl.trim();
    // Remove accidental copy-pasted string fragments like "https://domain.com/api or /api"
    if (clean.includes(" or ")) {
      clean = clean.split(" or ")[0].trim();
    }
    // Remove encoded spaces (%20), quotes, and trailing slashes
    clean = clean
      .replace(/%20/g, "")
      .replace(/^["']|["']$/g, "")
      .replace(/\/+$/, "");

    if (clean.length > 0) {
      if (!clean.endsWith("/api")) {
        clean += "/api";
      }
      return clean;
    }
  }
  return "/api";
}

async function parseResponseData(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await res.json();
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return { message: text || `HTTP ${res.status} Server Error` };
  }
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
    const data = await parseResponseData(res);
    if (!res.ok) {
      return { success: false, error: data.message || `API request failed (HTTP ${res.status})` };
    }
    return { success: true, data };
  } catch (primaryErr: any) {
    console.warn(`[API Info] Primary fetch failed for ${endpoint} (${url}):`, primaryErr.message);

    // Fallback: Retry direct backend port 5000 if frontend is running on dev port (5173/3000) on laptop or mobile
    if (
      typeof window !== "undefined" &&
      window.location &&
      window.location.port &&
      window.location.port !== "5000" &&
      !url.includes(":5000")
    ) {
      const host = window.location.hostname === "localhost" ? "127.0.0.1" : window.location.hostname;
      const fallbackUrl = `${window.location.protocol}//${host}:5000/api${endpoint}`;
      try {
        console.info(`[API Fallback] Retrying request to backend server on port 5000: ${fallbackUrl}`);
        const res = await fetch(fallbackUrl, { ...options, headers });
        const data = await parseResponseData(res);
        if (!res.ok) {
          return { success: false, error: data.message || `API request failed (HTTP ${res.status})` };
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
  userId?: string;
}) {
  console.log("Calling recharge API");
  return apiRequest<{ rechargeRequest: any }>("/recharge/create", {
    method: "POST",
    body: JSON.stringify({ paymentStatus: "Success", ...payload }),
  });
}

export async function apiGetPendingRecharges() {
  return apiRequest<{ requests: any[] }>("/recharge/pending");
}

export async function apiGetOperatorRequests() {
  console.log("API URL:", getApiBaseUrl());
  console.log("Fetching operator data...");
  return apiRequest<{ requests: any[] }>("/operator/requests");
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


