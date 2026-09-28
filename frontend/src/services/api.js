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

export async function requestLoginOtp(email) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyLoginOtp(email, otp) {
  return apiRequest("/auth/login/verify", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function getCurrentUser() {
  return apiRequest("/auth/me", {
    method: "GET",
  });
}

export async function logoutUser() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

export async function registerUser({ name, email, role }) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      role,
    }),
  });
}

export async function verifyRegistrationOtp(email, otp) {
  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
    }),
  });
}