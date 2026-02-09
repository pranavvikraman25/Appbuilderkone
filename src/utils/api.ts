import { projectId, publicAnonKey } from "./supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e8702b72`;

// Store access token in memory
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Helper function to make authenticated requests
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken || publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// AUTH API
// ============================================

export async function signup(
  email: string,
  password: string,
  name: string,
  role: "admin" | "maintainer"
) {
  try {
    const response = await apiRequest("/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name, role }),
    });
    return response;
  } catch (error) {
    console.error("Signup API error:", error);
    throw error;
  }
}

export async function login(email: string, password: string) {
  try {
    const response = await apiRequest("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.accessToken) {
      setAccessToken(response.accessToken);
    }

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
}

// ============================================
// SESSION API
// ============================================

export async function startMaintenanceSession(
  elevatorId: string,
  building: string,
  location: string
) {
  try {
    const response = await apiRequest("/sessions/start", {
      method: "POST",
      body: JSON.stringify({ elevatorId, building, location }),
    });
    return response;
  } catch (error) {
    console.error("Start session API error:", error);
    throw error;
  }
}

export async function recordMovement(
  latitude: number,
  longitude: number,
  floor: number,
  accelerometer?: any
) {
  try {
    const response = await apiRequest("/sessions/movement", {
      method: "POST",
      body: JSON.stringify({
        latitude,
        longitude,
        floor,
        timestamp: new Date().toISOString(),
        accelerometer,
      }),
    });
    return response;
  } catch (error) {
    console.error("Record movement API error:", error);
    throw error;
  }
}

export async function addIssue(
  floor: number,
  issue: string,
  severity: string,
  notes: string
) {
  try {
    const response = await apiRequest("/sessions/issue", {
      method: "POST",
      body: JSON.stringify({ floor, issue, severity, notes }),
    });
    return response;
  } catch (error) {
    console.error("Add issue API error:", error);
    throw error;
  }
}

export async function endMaintenanceSession() {
  try {
    const response = await apiRequest("/sessions/end", {
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("End session API error:", error);
    throw error;
  }
}

export async function getActiveSession() {
  try {
    const response = await apiRequest("/sessions/active", {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Get active session API error:", error);
    throw error;
  }
}

export async function getMySessions() {
  try {
    const response = await apiRequest("/sessions/my-sessions", {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Get my sessions API error:", error);
    throw error;
  }
}

// ============================================
// HEAT MAP API (ADMIN ONLY)
// ============================================

export async function getHeatMapData(sessionId: string) {
  try {
    const response = await apiRequest(`/heatmap/${sessionId}`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Get heat map API error:", error);
    throw error;
  }
}

export async function getAllSessions() {
  try {
    const response = await apiRequest("/sessions/all", {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Get all sessions API error:", error);
    throw error;
  }
}

// ============================================
// ELEVATOR API
// ============================================

export async function getElevators() {
  try {
    const response = await apiRequest("/elevators", {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Get elevators API error:", error);
    throw error;
  }
}

export async function addElevator(elevator: any) {
  try {
    const response = await apiRequest("/elevators", {
      method: "POST",
      body: JSON.stringify(elevator),
    });
    return response;
  } catch (error) {
    console.error("Add elevator API error:", error);
    throw error;
  }
}
