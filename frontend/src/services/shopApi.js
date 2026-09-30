const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function getOwnerShops() {
  return apiRequest("/shops/me", { method: "GET" });
}

export async function getPublicShops() {
  return apiRequest("/shops/public", { method: "GET" });
}

export async function getPublicShopDetails(shopId) {
  return apiRequest(`/shops/public/${shopId}`, { method: "GET" });
}

export async function createShop(shopInput) {
  return apiRequest("/shops", {
    method: "POST",
    body: JSON.stringify(shopInput),
  });
}

export async function updateShop(shopId, shopInput) {
  return apiRequest(`/shops/${shopId}`, {
    method: "PATCH",
    body: JSON.stringify(shopInput),
  });
}

export async function deleteShop(shopId) {
  return apiRequest(`/shops/${shopId}`, { method: "DELETE" });
}

export async function getShopServices(shopId) {
  return apiRequest(`/shops/${shopId}/services`, { method: "GET" });
}

export async function createShopService(shopId, serviceInput) {
  return apiRequest(`/shops/${shopId}/services`, {
    method: "POST",
    body: JSON.stringify(serviceInput),
  });
}

export async function deleteShopService(shopId, serviceId) {
  return apiRequest(`/shops/${shopId}/services/${serviceId}`, { method: "DELETE" });
}

export async function getPendingShopRequests() {
  return apiRequest("/shops/admin/requests", { method: "GET" });
}

export async function getAdminShopStats() {
  return apiRequest("/shops/admin/stats", { method: "GET" });
}

export async function reviewShopRequest(shopId, action, rejectionReason = "") {
  return apiRequest(`/shops/admin/${shopId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      action,
      rejection_reason: rejectionReason,
    }),
  });
}
