import { ArrowLeft, Plus, Check, X, StopCircle, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Screen } from '../App';
import { MovementTracker } from '../utils/movement-tracker';
import * as api from '../utils/api';

const mockIssues = [
  { id: 1, description: 'Door sensor misalignment', resolved: false },
  { id: 2, description: 'Unusual vibration detected', resolved: false },
  { id: 3, description: 'Call button not responding', resolved: true },
  { id: 4, description: 'Floor indicator flickering', resolved: false },
];

export function FloorMaintenanceScreen({ 
  elevatorId, 
  floor,
  userRole,
  activeSession,
  onNavigate,
  onGoBack,
  onSessionEnd
}: { 
  elevatorId: string; 
  floor: number;
  userRole: 'admin' | 'maintainer';
  activeSession?: any;
  onNavigate: (screen: Screen) => void;
  onGoBack?: () => void;
  onSessionEnd?: () => void;
}) {
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [issues, setIssues] = useState(mockIssues);
  const [newIssue, setNewIssue] = useState('');
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [startTime] = useState(new Date());
  const [trackingError, setTrackingError] = useState('');
  const [isEndingSession, setIsEndingSession] = useState(false);
  
  const movementTracker = useRef<MovementTracker | null>(null);

  useEffect(() => {
    // Initialize movement tracker
    movementTracker.current = new MovementTracker((error) => {
      setTrackingError(error);
    });

    // Set current floor
    movementTracker.current.setCurrentFloor(floor);

    // Start tracking if there's an active session
    if (activeSession) {
      setIsMaintenanceActive(true);
      movementTracker.current.startTracking();
    }

    // Cleanup on unmount
    return () => {
      if (movementTracker.current) {
        movementTracker.current.stopTracking();
      }
    };
  }, [floor, activeSession]);

  // Update floor when it changes
  useEffect(() => {
    if (movementTracker.current) {
      movementTracker.current.setCurrentFloor(floor);
      // Force record position when floor changes
      if (isMaintenanceActive) {
        movementTracker.current.forceRecordPosition();
      }
    }
  }, [floor, isMaintenanceActive]);

  const handleStartMaintenance = () => {
    if (!activeSession) {
      setTrackingError('No active session. Please start from elevator detail screen.');
      return;
    }
    
    setIsMaintenanceActive(true);
    if (movementTracker.current) {
      movementTracker.current.startTracking();
    }
  };

  const handleEndMaintenance = async () => {
    setIsEndingSession(true);
    
    try {
      // Stop tracking
      if (movementTracker.current) {
        movementTracker.current.stopTracking();
      }

      // End session on backend
      const response = await api.endMaintenanceSession();
      
      if (response.success && response.session) {
        // For maintainers, navigate to report summary then back to dashboard
        // For admins, navigate to report summary
        onNavigate({ name: 'report-summary', sessionData: response.session });
        
        // Call the session end callback (will redirect maintainers to dashboard)
        if (onSessionEnd) {
          onSessionEnd();
        }
      }
    } catch (error: any) {
      console.error('Failed to end maintenance:', error);
      setTrackingError(error.message || 'Failed to end maintenance');
    } finally {
      setIsEndingSession(false);
    }
  };

  const toggleIssue = async (id: number) => {
    const updatedIssues = issues.map(issue => 
      issue.id === id ? { ...issue, resolved: !issue.resolved } : issue
    );
    setIssues(updatedIssues);

    // Record issue resolution in backend if resolved
    const issue = updatedIssues.find(i => i.id === id);
    if (issue && issue.resolved) {
      try {
        await api.addIssue(floor, issue.description, 'medium', 'Resolved by technician');
      } catch (error) {
        console.error('Failed to record issue:', error);
      }
    }
  };

  const handleAddIssue = async () => {
    if (!newIssue.trim()) return;

    const issue = {
      id: issues.length + 1,
      description: newIssue,
      resolved: false,
    };

    setIssues([...issues, issue]);
    
    // Record in backend
    try {
      await api.addIssue(floor, newIssue, 'high', 'Reported by technician');
    } catch (error) {
      console.error('Failed to add issue:', error);
    }

    setNewIssue('');
    setShowAddIssue(false);
  };

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onGoBack ? onGoBack() : onNavigate({ name: 'elevator-detail', elevatorId })}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <div className="text-sm text-gray-600">Floor {floor}</div>
            <div className="text-[#005EB8]">{elevatorId}</div>
          </div>
          {isMaintenanceActive && (
            <div className="ml-auto">
              <div className="px-3 py-1 bg-green-500 text-white text-xs flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>Tracking</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Error */}
      {trackingError && (
        <div className="bg-yellow-50 border-b border-yellow-300 p-3 text-sm text-yellow-800">
          ⚠️ {trackingError}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {!isMaintenanceActive ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Floor {floor} Maintenance</h3>
              <p className="text-sm text-gray-600">Start maintenance to begin tracking</p>
            </div>
            <button
              onClick={handleStartMaintenance}
              disabled={!activeSession}
              className="bg-[#005EB8] text-white px-8 py-4 border-2 border-[#005EB8] hover:bg-[#004a94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeSession ? 'Start Maintenance' : 'No Active Session'}
            </button>
            {!activeSession && (
              <p className="text-xs text-gray-500 text-center max-w-xs">
                Please start a maintenance session from the elevator detail screen first
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-300 p-3 text-sm text-green-800 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Maintenance session active - Your movement is being tracked</span>
            </div>

            {/* Session Info */}
            <div className="bg-white border border-gray-300 p-4">
              <div className="text-sm text-gray-600 mb-2">Session Information</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Floor:</span>
                  <span className="text-gray-900 font-medium">Floor {floor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="text-gray-900">{startTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Elevator ID:</span>
                  <span className="text-gray-900">{elevatorId}</span>
                </div>
              </div>
            </div>

            {/* Issues List */}
            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-700">Issues</div>
                <button
                  onClick={() => setShowAddIssue(!showAddIssue)}
                  className="p-1 border border-gray-300 hover:border-[#005EB8] transition-colors"
                >
                  {showAddIssue ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>

              {/* Add Issue Form */}
              {showAddIssue && (
                <div className="mb-3 p-3 bg-gray-50 border border-gray-300 space-y-2">
                  <input
                    type="text"
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    placeholder="Describe the issue..."
                    className="w-full px-3 py-2 border border-gray-300 bg-white text-sm"
                  />
                  <button
                    onClick={handleAddIssue}
                    className="w-full bg-[#005EB8] text-white px-4 py-2 text-sm hover:bg-[#004a94] transition-colors"
                  >
                    Add Issue
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => toggleIssue(issue.id)}
                    className="flex items-start gap-3 p-2 border border-gray-300 cursor-pointer hover:border-[#005EB8] transition-colors"
                  >
                    <div
                      className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${
                        issue.resolved
                          ? 'border-green-600 bg-green-600'
                          : 'border-gray-400'
                      }`}
                    >
                      {issue.resolved && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm flex-1 ${issue.resolved ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {issue.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Helper */}
            <div className="bg-blue-50 border border-blue-300 p-3 text-xs text-gray-700">
              💡 Use the back button to navigate to other floors. Your tracking will continue automatically.
            </div>

            {/* End Maintenance Button */}
            <button
              onClick={handleEndMaintenance}
              disabled={isEndingSession}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <StopCircle className="w-5 h-5" />
              <span>{isEndingSession ? 'Ending Session...' : 'End Maintenance Session'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
