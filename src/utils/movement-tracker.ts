import { recordMovement } from "./api";

export class MovementTracker {
  private watchId: number | null = null;
  private isTracking = false;
  private lastRecordedTime = 0;
  private recordInterval = 10000; // Record every 10 seconds
  private currentFloor = 0;
  private onError: ((error: string) => void) | null = null;

  constructor(onError?: (error: string) => void) {
    this.onError = onError || null;
  }

  setCurrentFloor(floor: number) {
    this.currentFloor = floor;
  }

  startTracking() {
    if (this.isTracking) {
      console.log("Movement tracking already started");
      return;
    }

    if (!navigator.geolocation) {
      const error = "Geolocation is not supported by this browser";
      console.error(error);
      this.onError?.(error);
      return;
    }

    this.isTracking = true;
    console.log("Starting movement tracking...");

    // Request high accuracy position tracking
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.handlePositionUpdate(position);
      },
      (error) => {
        console.error("Geolocation error:", error);
        this.onError?.(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    // Also try to track device motion (accelerometer) if available
    if (window.DeviceMotionEvent) {
      this.startAccelerometerTracking();
    }
  }

  private async handlePositionUpdate(position: GeolocationPosition) {
    const now = Date.now();

    // Only record if enough time has passed since last record
    if (now - this.lastRecordedTime < this.recordInterval) {
      return;
    }

    const { latitude, longitude, accuracy } = position.coords;

    console.log(
      `Recording position: lat=${latitude}, lon=${longitude}, floor=${this.currentFloor}, accuracy=${accuracy}m`
    );

    try {
      await recordMovement(latitude, longitude, this.currentFloor);
      this.lastRecordedTime = now;
    } catch (error) {
      console.error("Failed to record movement:", error);
      this.onError?.(`Failed to record movement: ${error.message}`);
    }
  }

  private startAccelerometerTracking() {
    // Request permission for device motion on iOS 13+
    if (
      typeof (DeviceMotionEvent as any).requestPermission === "function"
    ) {
      (DeviceMotionEvent as any)
        .requestPermission()
        .then((permissionState: string) => {
          if (permissionState === "granted") {
            this.attachMotionListener();
          }
        })
        .catch((error: any) => {
          console.error("Device motion permission error:", error);
        });
    } else {
      // For non-iOS devices or older iOS versions
      this.attachMotionListener();
    }
  }

  private attachMotionListener() {
    window.addEventListener("devicemotion", (event) => {
      const acceleration = event.accelerationIncludingGravity;
      if (acceleration) {
        // Store accelerometer data (could be used to detect elevator movement patterns)
        console.log("Motion detected:", {
          x: acceleration.x,
          y: acceleration.y,
          z: acceleration.z,
        });
      }
    });
  }

  stopTracking() {
    if (!this.isTracking) {
      return;
    }

    console.log("Stopping movement tracking...");

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isTracking = false;
  }

  isCurrentlyTracking() {
    return this.isTracking;
  }

  // Force record current position (useful for floor changes)
  async forceRecordPosition() {
    if (!navigator.geolocation) {
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;
      await recordMovement(latitude, longitude, this.currentFloor);
      console.log(`Forced position record at floor ${this.currentFloor}`);
    } catch (error) {
      console.error("Failed to force record position:", error);
      this.onError?.(`Failed to record position: ${error.message}`);
    }
  }
}
