import { useState, useEffect } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { ElevatorDetailScreen } from "./components/ElevatorDetailScreen";
import { FloorMaintenanceScreen } from "./components/FloorMaintenanceScreen";
import { MovementHeatMapScreen } from "./components/MovementHeatMapScreen";
import { ReportSummaryScreen } from "./components/ReportSummaryScreen";
import { MovementHeatMapOverview } from "./components/MovementHeatMapOverview";
import { AllIssuesOverview } from "./components/AllIssuesOverview";
import { SavedReports } from "./components/SavedReports";
import { FloorSpecificHeatMap } from "./components/FloorSpecificHeatMap";
import { LoginScreen } from "./components/LoginScreen";
import { AddElevatorScreen } from "./components/AddElevatorScreen";
import { KMPWebViewScreen } from "./components/KMPWebViewScreen";
import { HealthMonitorScreen } from "./components/HealthMonitorScreen";
import { MaintainerProfileScreen } from "./components/MaintainerProfileScreen";
import * as api from "./utils/api";
import { setAccessToken } from "./utils/api";

export type Screen =
  | { name: "splash" }
  | { name: "dashboard" }
  | { name: "elevator-detail"; elevatorId: string }
  | {
      name: "floor-maintenance";
      elevatorId: string;
      floor: number;
    }
  | { name: "movement-heatmap"; elevatorId: string }
  | { name: "report-summary"; sessionData: any }
  | { name: "movement-heatmap-overview" }
  | { name: "all-issues-overview" }
  | { name: "saved-reports" }
  | {
      name: "floor-specific-heatmap";
      elevatorId: string;
      floor: number;
    }
  | { name: "login" }
  | { name: "add-elevator" }
  | { name: "kmp-webview" }
  | { name: "health-monitor" }
  | { name: "maintainer-profile" };

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>({
    name: "splash",
  });
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "maintainer">("maintainer");
  const [accessToken, setAccessTokenState] = useState("");
  const [isVibrating, setIsVibrating] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [elevators, setElevators] = useState([
    {
      id: "ELV-001",
      building: "Tower A",
      location: "Helsinki Central",
      status: "active",
    },
    {
      id: "ELV-002",
      building: "Tower A",
      location: "Helsinki Central",
      status: "inactive",
    },
    {
      id: "ELV-003",
      building: "Office Building B",
      location: "Espoo Campus",
      status: "active",
    },
    {
      id: "ELV-004",
      building: "Residential C",
      location: "Tampere North",
      status: "active",
    },
    {
      id: "ELV-005",
      building: "Shopping Mall D",
      location: "Vantaa District",
      status: "inactive",
    },
  ]);

  // Load elevators from backend when logged in
  useEffect(() => {
    if (isLoggedIn && accessToken) {
      loadElevators();
      checkActiveSession();
    }
  }, [isLoggedIn, accessToken]);

  const loadElevators = async () => {
    try {
      const response = await api.getElevators();
      if (response.success && response.elevators.length > 0) {
        setElevators(response.elevators);
      } else {
        // Seed default elevators if none exist (only for admins)
        if (userRole === 'admin') {
          console.log('Seeding default elevators...');
          for (const elevator of elevators) {
            try {
              await api.addElevator(elevator);
            } catch (error) {
              console.error('Failed to seed elevator:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to load elevators:", error);
      // Keep default elevators if backend fails
    }
  };

  const checkActiveSession = async () => {
    try {
      const response = await api.getActiveSession();
      if (response.activeSession) {
        setActiveSession(response.activeSession);
      }
    } catch (error) {
      console.error("Failed to check active session:", error);
    }
  };

  // Health monitor - vibration every 30 minutes
  useEffect(() => {
    if (!isLoggedIn) return;

    const vibrationInterval = setInterval(() => {
      setIsVibrating(true);
      // Trigger vibration if browser supports it
      if (navigator.vibrate) {
        // Vibrate in pattern: 500ms on, 200ms off, repeated
        const pattern = [500, 200, 500, 200, 500, 200, 500];
        navigator.vibrate(pattern);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Listen for volume button events (simulated with keyboard for web)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'VolumeUp' || e.key === 'VolumeDown' || e.key === 'AudioVolumeUp' || e.key === 'AudioVolumeDown') && isVibrating) {
        setIsVibrating(false);
        if (navigator.vibrate) {
          navigator.vibrate(0); // Stop vibration
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(vibrationInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoggedIn, isVibrating]);

  // Navigate function with history tracking
  const handleNavigate = (screen: Screen) => {
    setNavigationHistory([...navigationHistory, currentScreen]);
    setCurrentScreen(screen);
  };

  // Go back function
  const handleGoBack = () => {
    if (navigationHistory.length > 0) {
      const previousScreen = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(navigationHistory.slice(0, -1));
      setCurrentScreen(previousScreen);
    } else {
      setCurrentScreen({ name: "dashboard" });
    }
  };

  // Auto-transition from splash to login/dashboard
  useState(() => {
    if (currentScreen.name === "splash") {
      const timeout = setTimeout(() => {
        handleNavigate({
          name: isLoggedIn ? "dashboard" : "login",
        });
      }, 2500);
      return () => clearTimeout(timeout);
    }
  });

  const handleLogin = (email: string, name: string, role: 'admin' | 'maintainer', token: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setUserName(name);
    setUserRole(role);
    setAccessTokenState(token);
    setAccessToken(token); // Set in API utility
    setNavigationHistory([]);
    setCurrentScreen({ name: "dashboard" });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    setUserName("");
    setUserRole("maintainer");
    setAccessTokenState("");
    setAccessToken(null); // Clear from API utility
    setActiveSession(null);
    setNavigationHistory([]);
    setCurrentScreen({ name: "login" });
  };

  const handleAddElevator = async (elevator: any) => {
    try {
      // Add to backend
      const response = await api.addElevator(elevator);
      if (response.success) {
        setElevators([...elevators, elevator]);
      }
    } catch (error) {
      console.error("Failed to add elevator:", error);
      // Still add locally even if backend fails
      setElevators([...elevators, elevator]);
    }
    setCurrentScreen({ name: "dashboard" });
  };

  const handleAcknowledgeHealth = () => {
    setIsVibrating(false);
    if (navigator.vibrate) {
      navigator.vibrate(0); // Stop vibration
    }
  };

  return (
    <div className="size-full bg-white flex items-center justify-center">
      {/* Mobile frame container */}
      <div className="w-full max-w-[390px] h-full max-h-[844px] bg-white shadow-2xl overflow-hidden relative">
        {currentScreen.name === "splash" && (
          <SplashScreen
            onComplete={() =>
              setCurrentScreen({ name: "dashboard" })
            }
          />
        )}

        {currentScreen.name === "dashboard" && (
          <DashboardScreen
            onNavigate={handleNavigate}
            onGoBack={handleGoBack}
            isLoggedIn={isLoggedIn}
            userEmail={userEmail}
            userName={userName}
            userRole={userRole}
            onLogout={handleLogout}
            elevators={elevators}
            isVibrating={isVibrating}
            activeSession={activeSession}
          />
        )}

        {currentScreen.name === "elevator-detail" && (
          <ElevatorDetailScreen
            elevatorId={currentScreen.elevatorId}
            userRole={userRole}
            onNavigate={handleNavigate}
            onGoBack={handleGoBack}
            onSessionStart={setActiveSession}
          />
        )}

        {currentScreen.name === "floor-maintenance" && (
          <FloorMaintenanceScreen
            elevatorId={currentScreen.elevatorId}
            floor={currentScreen.floor}
            userRole={userRole}
            activeSession={activeSession}
            onNavigate={handleNavigate}
            onGoBack={handleGoBack}
            onSessionEnd={() => {
              setActiveSession(null);
              // Maintainers go back to dashboard after ending session
              if (userRole === "maintainer") {
                setNavigationHistory([]);
                setCurrentScreen({ name: "dashboard" });
              }
            }}
          />
        )}

        {currentScreen.name === "movement-heatmap" && userRole === "admin" && (
          <MovementHeatMapScreen
            elevatorId={currentScreen.elevatorId}
            onNavigate={handleNavigate}
            onGoBack={handleGoBack}
          />
        )}

        {currentScreen.name === "report-summary" && (
          <ReportSummaryScreen
            sessionData={currentScreen.sessionData}
            onNavigate={handleNavigate}
            onGoBack={handleGoBack}
          />
        )}

        {currentScreen.name === "movement-heatmap-overview" && userRole === "admin" && (
          <MovementHeatMapOverview
            onNavigate={handleNavigate}
            onGoBack={handleGoBack}
          />
        )}

        {currentScreen.name === "all-issues-overview" && (
          <AllIssuesOverview 
            onNavigate={handleNavigate} 
            onGoBack={handleGoBack}
          />
        )}

        {currentScreen.name === "saved-reports" && (
          <SavedReports 
            onNavigate={handleNavigate} 
            onGoBack={handleGoBack}
          />
        )}

        {currentScreen.name === "floor-specific-heatmap" && userRole === "admin" && (
          <FloorSpecificHeatMap
            elevatorId={currentScreen.elevatorId}
            floor={currentScreen.floor}
            onNavigate={handleNavigate}
            onGoBack={handleGoBack}
          />
        )}

        {currentScreen.name === "login" && (
          <LoginScreen
            onLogin={handleLogin}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen.name === "add-elevator" && (
          <AddElevatorScreen
            onAddElevator={handleAddElevator}
            onNavigate={handleNavigate}
            onGoBack={handleGoBack}
          />
        )}

        {currentScreen.name === "kmp-webview" && (
          <KMPWebViewScreen 
            onNavigate={handleNavigate}
            onGoBack={handleGoBack}
          />
        )}

        {currentScreen.name === "health-monitor" && (
          <HealthMonitorScreen
            onNavigate={handleNavigate}
            onAcknowledge={handleAcknowledgeHealth}
          />
        )}

        {currentScreen.name === "maintainer-profile" && (
          <MaintainerProfileScreen
            onNavigate={handleNavigate}
            userEmail={userEmail}
            userName={userName}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
}