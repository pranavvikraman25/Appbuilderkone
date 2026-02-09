import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Open CORS for all origins
app.use("*", cors());
app.use("*", logger(console.log));

// Create Supabase admin client
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Signup route with role assignment
app.post("/make-server-e8702b72/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name || !role) {
      return c.json(
        { error: "Email, password, name, and role are required" },
        400
      );
    }

    // Validate role
    if (role !== "admin" && role !== "maintainer") {
      return c.json({ error: "Role must be 'admin' or 'maintainer'" }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Signup error for ${email}:`, error);
      return c.json({ error: `Failed to create user: ${error.message}` }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    });

    return c.json({
      success: true,
      user: {
        id: data.user.id,
        email,
        name,
        role,
      },
    });
  } catch (error) {
    console.log("Signup error:", error);
    return c.json({ error: `Signup failed: ${error.message}` }, 500);
  }
});

// Login route (returns user data with role)
app.post("/make-server-e8702b72/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Sign in with Supabase Auth (use regular client, not admin)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Login error for ${email}:`, error);
      return c.json({ error: `Login failed: ${error.message}` }, 401);
    }

    // Get user profile from KV store
    const userProfile = await kv.get(`user:${data.user.id}`);

    return c.json({
      success: true,
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userProfile?.name || data.user.user_metadata?.name || email.split('@')[0],
        role: userProfile?.role || data.user.user_metadata?.role || "maintainer",
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    return c.json({ error: `Login failed: ${error.message}` }, 500);
  }
});

// ============================================
// MAINTENANCE SESSION ROUTES
// ============================================

// Start maintenance session
app.post("/make-server-e8702b72/sessions/start", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (!user || authError) {
      console.log("Auth error in start session:", authError);
      return c.json({ error: "Unauthorized - invalid or missing access token" }, 401);
    }

    const { elevatorId, building, location } = await c.req.json();

    if (!elevatorId) {
      return c.json({ error: "Elevator ID is required" }, 400);
    }

    const sessionId = `session:${user.id}:${Date.now()}`;
    const sessionData = {
      id: sessionId,
      userId: user.id,
      elevatorId,
      building: building || "Unknown Building",
      location: location || "Unknown Location",
      startTime: new Date().toISOString(),
      endTime: null,
      status: "in-progress",
      movements: [],
      issues: [],
      floorsVisited: [],
    };

    await kv.set(sessionId, sessionData);
    await kv.set(`active-session:${user.id}`, sessionId);

    console.log(`Session started: ${sessionId} for user ${user.id}`);

    return c.json({
      success: true,
      session: sessionData,
    });
  } catch (error) {
    console.log("Start session error:", error);
    return c.json({ error: `Failed to start session: ${error.message}` }, 500);
  }
});

// Record movement data
app.post("/make-server-e8702b72/sessions/movement", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (!user || authError) {
      console.log("Auth error in record movement:", authError);
      return c.json({ error: "Unauthorized - invalid or missing access token" }, 401);
    }

    const { latitude, longitude, floor, timestamp, accelerometer } = await c.req.json();

    // Get active session
    const activeSessionId = await kv.get(`active-session:${user.id}`);
    if (!activeSessionId) {
      return c.json({ error: "No active session found" }, 400);
    }

    const session = await kv.get(activeSessionId);
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    // Add movement data
    const movement = {
      latitude,
      longitude,
      floor: floor || 0,
      timestamp: timestamp || new Date().toISOString(),
      accelerometer: accelerometer || null,
    };

    session.movements.push(movement);

    // Track floors visited
    if (floor !== undefined && !session.floorsVisited.includes(floor)) {
      session.floorsVisited.push(floor);
    }

    await kv.set(activeSessionId, session);

    return c.json({
      success: true,
      movementRecorded: true,
    });
  } catch (error) {
    console.log("Record movement error:", error);
    return c.json({ error: `Failed to record movement: ${error.message}` }, 500);
  }
});

// Add issue to session
app.post("/make-server-e8702b72/sessions/issue", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { floor, issue, severity, notes } = await c.req.json();

    const activeSessionId = await kv.get(`active-session:${user.id}`);
    if (!activeSessionId) {
      return c.json({ error: "No active session found" }, 400);
    }

    const session = await kv.get(activeSessionId);
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    const issueData = {
      id: `issue:${Date.now()}`,
      floor,
      issue,
      severity: severity || "medium",
      notes: notes || "",
      timestamp: new Date().toISOString(),
    };

    session.issues.push(issueData);
    await kv.set(activeSessionId, session);

    return c.json({
      success: true,
      issue: issueData,
    });
  } catch (error) {
    console.log("Add issue error:", error);
    return c.json({ error: `Failed to add issue: ${error.message}` }, 500);
  }
});

// End maintenance session
app.post("/make-server-e8702b72/sessions/end", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const activeSessionId = await kv.get(`active-session:${user.id}`);
    if (!activeSessionId) {
      return c.json({ error: "No active session found" }, 400);
    }

    const session = await kv.get(activeSessionId);
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    // Update session with end time
    session.endTime = new Date().toISOString();
    session.status = "completed";

    // Calculate duration
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    session.duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // seconds

    await kv.set(activeSessionId, session);
    await kv.del(`active-session:${user.id}`);

    // Add to user's completed sessions list
    const completedSessionsKey = `user-sessions:${user.id}`;
    const existingSessions = (await kv.get(completedSessionsKey)) || [];
    existingSessions.push(session.id);
    await kv.set(completedSessionsKey, existingSessions);

    console.log(`Session ended: ${activeSessionId} for user ${user.id}`);

    return c.json({
      success: true,
      session,
    });
  } catch (error) {
    console.log("End session error:", error);
    return c.json({ error: `Failed to end session: ${error.message}` }, 500);
  }
});

// Get active session
app.get("/make-server-e8702b72/sessions/active", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const activeSessionId = await kv.get(`active-session:${user.id}`);
    if (!activeSessionId) {
      return c.json({ activeSession: null });
    }

    const session = await kv.get(activeSessionId);
    return c.json({
      activeSession: session,
    });
  } catch (error) {
    console.log("Get active session error:", error);
    return c.json({ error: `Failed to get active session: ${error.message}` }, 500);
  }
});

// ============================================
// HEAT MAP ROUTES (ADMIN ACCESS)
// ============================================

// Get heat map data for a specific session
app.get("/make-server-e8702b72/heatmap/:sessionId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role !== "admin") {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }

    const sessionId = c.req.param("sessionId");
    const session = await kv.get(sessionId);

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    // Generate heat map data from movements
    const heatMapData = generateHeatMapFromMovements(session.movements);

    return c.json({
      success: true,
      sessionId,
      elevatorId: session.elevatorId,
      heatMapData,
      movements: session.movements,
      totalMovements: session.movements.length,
      floorsVisited: session.floorsVisited,
      duration: session.duration,
    });
  } catch (error) {
    console.log("Get heat map error:", error);
    return c.json({ error: `Failed to get heat map: ${error.message}` }, 500);
  }
});

// Get all sessions (admin only)
app.get("/make-server-e8702b72/sessions/all", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role !== "admin") {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }

    // Get all session keys
    const allSessions = await kv.getByPrefix("session:");
    
    return c.json({
      success: true,
      sessions: allSessions,
      count: allSessions.length,
    });
  } catch (error) {
    console.log("Get all sessions error:", error);
    return c.json({ error: `Failed to get sessions: ${error.message}` }, 500);
  }
});

// Get user's own sessions
app.get("/make-server-e8702b72/sessions/my-sessions", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const completedSessionsKey = `user-sessions:${user.id}`;
    const sessionIds = (await kv.get(completedSessionsKey)) || [];

    const sessions = [];
    for (const sessionId of sessionIds) {
      const session = await kv.get(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    return c.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.log("Get my sessions error:", error);
    return c.json({ error: `Failed to get sessions: ${error.message}` }, 500);
  }
});

// ============================================
// ELEVATOR MANAGEMENT ROUTES
// ============================================

// Get all elevators
app.get("/make-server-e8702b72/elevators", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const elevators = (await kv.get("elevators")) || [];
    return c.json({
      success: true,
      elevators,
    });
  } catch (error) {
    console.log("Get elevators error:", error);
    return c.json({ error: `Failed to get elevators: ${error.message}` }, 500);
  }
});

// Add new elevator (admin only)
app.post("/make-server-e8702b72/elevators", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role !== "admin") {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }

    const elevator = await c.req.json();
    const elevators = (await kv.get("elevators")) || [];
    elevators.push(elevator);
    await kv.set("elevators", elevators);

    return c.json({
      success: true,
      elevator,
    });
  } catch (error) {
    console.log("Add elevator error:", error);
    return c.json({ error: `Failed to add elevator: ${error.message}` }, 500);
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateHeatMapFromMovements(movements: any[]) {
  if (!movements || movements.length === 0) {
    return [];
  }

  // Group movements by floor and calculate time spent
  const floorTimeMap: { [key: number]: { totalTime: number; points: any[] } } = {};

  for (let i = 0; i < movements.length; i++) {
    const movement = movements[i];
    const floor = movement.floor || 0;

    if (!floorTimeMap[floor]) {
      floorTimeMap[floor] = { totalTime: 0, points: [] };
    }

    // Calculate time spent at this point (time until next movement)
    let timeSpent = 60; // Default 60 seconds if no next point
    if (i < movements.length - 1) {
      const nextMovement = movements[i + 1];
      const currentTime = new Date(movement.timestamp).getTime();
      const nextTime = new Date(nextMovement.timestamp).getTime();
      timeSpent = (nextTime - currentTime) / 1000; // Convert to seconds
    }

    floorTimeMap[floor].totalTime += timeSpent;
    floorTimeMap[floor].points.push({
      latitude: movement.latitude,
      longitude: movement.longitude,
      timeSpent,
      timestamp: movement.timestamp,
    });
  }

  // Convert to heat map data format
  const heatMapData = Object.entries(floorTimeMap).map(([floor, data]) => ({
    floor: parseInt(floor),
    totalTime: data.totalTime,
    intensity: Math.min(100, (data.totalTime / 600) * 100), // Normalize to 0-100 (10 min = 100%)
    points: data.points,
    visitCount: data.points.length,
  }));

  return heatMapData.sort((a, b) => b.totalTime - a.totalTime);
}

// Health check route
app.get("/make-server-e8702b72/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

Deno.serve(app.fetch);
