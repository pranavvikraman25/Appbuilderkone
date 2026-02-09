import { ArrowLeft, Loader2, MapPin, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../App';
import * as api from '../utils/api';

export function MovementHeatMapScreen({ 
  elevatorId, 
  onNavigate,
  onGoBack 
}: { 
  elevatorId: string;
  onNavigate: (screen: Screen) => void;
  onGoBack?: () => void;
}) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [heatMapData, setHeatMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessions();
  }, [elevatorId]);

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.getAllSessions();
      
      if (response.success) {
        // Filter sessions for this elevator
        const elevatorSessions = response.sessions.filter((s: any) => 
          s.elevatorId === elevatorId && s.status === 'completed'
        );
        setSessions(elevatorSessions);
        
        // Auto-select the most recent session
        if (elevatorSessions.length > 0) {
          await loadHeatMapForSession(elevatorSessions[0].id);
        }
      }
    } catch (error: any) {
      console.error('Failed to load sessions:', error);
      setError(error.message || 'Failed to load heat map data');
    } finally {
      setLoading(false);
    }
  };

  const loadHeatMapForSession = async (sessionId: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.getHeatMapData(sessionId);
      
      if (response.success) {
        setHeatMapData(response);
        setSelectedSession(sessionId);
      }
    } catch (error: any) {
      console.error('Failed to load heat map:', error);
      setError(error.message || 'Failed to load heat map');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => onGoBack ? onGoBack() : onNavigate({ name: 'elevator-detail', elevatorId })}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <div className="text-sm text-gray-600">Movement Heat Map (Admin)</div>
            <div className="text-[#005EB8]">{elevatorId}</div>
          </div>
        </div>

        {/* Session Selector */}
        {sessions.length > 0 && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Select Session:</label>
            <select
              value={selectedSession || ''}
              onChange={(e) => loadHeatMapForSession(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 bg-white text-sm"
            >
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {new Date(session.startTime).toLocaleString()} - {session.userId}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-300 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#005EB8] animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading heat map data...</p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !heatMapData && !error && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Heat Map Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              No completed maintenance sessions found for this elevator. Complete a maintenance session to see heat map data.
            </p>
          </div>
        </div>
      )}

      {/* Heat Map Visualization */}
      {!loading && heatMapData && (
        <div className="flex-1 overflow-auto p-4">
          {/* Session Statistics */}
          <div className="bg-white border border-gray-300 p-4 mb-4">
            <div className="text-sm font-medium text-gray-900 mb-3">Session Statistics</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-gray-600">Total Movements:</div>
                <div className="text-gray-900 font-medium">{heatMapData.totalMovements}</div>
              </div>
              <div>
                <div className="text-gray-600">Duration:</div>
                <div className="text-gray-900 font-medium">{formatDuration(heatMapData.duration || 0)}</div>
              </div>
              <div>
                <div className="text-gray-600">Floors Visited:</div>
                <div className="text-gray-900 font-medium">{heatMapData.floorsVisited?.length || 0}</div>
              </div>
              <div>
                <div className="text-gray-600">Heat Points:</div>
                <div className="text-gray-900 font-medium">{heatMapData.heatMapData?.length || 0}</div>
              </div>
            </div>
          </div>

          {/* Heat Map by Floor */}
          <div className="bg-white border border-gray-300 p-4 mb-4">
            <div className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Time Spent per Floor</span>
            </div>
            <div className="space-y-2">
              {heatMapData.heatMapData && heatMapData.heatMapData.length > 0 ? (
                heatMapData.heatMapData.map((floor: any) => (
                  <div key={floor.floor} className="border border-gray-300 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          Floor {floor.floor}
                        </span>
                        <span className="text-xs text-gray-600">
                          ({floor.visitCount} visits)
                        </span>
                      </div>
                      <span className="text-sm text-[#005EB8] font-medium">
                        {formatDuration(Math.floor(floor.totalTime))}
                      </span>
                    </div>
                    
                    {/* Heat bar */}
                    <div className="relative h-6 bg-gray-200 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#005EB8] to-[#0088cc] transition-all duration-300"
                        style={{ width: `${floor.intensity}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                        {Math.round(floor.intensity)}% intensity
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-gray-500 py-4">
                  No heat map data available
                </div>
              )}
            </div>
          </div>

          {/* Movement Points Details */}
          {heatMapData.movements && heatMapData.movements.length > 0 && (
            <div className="bg-white border border-gray-300 p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">
                Movement Log ({heatMapData.movements.length} points)
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {heatMapData.movements.slice(0, 20).map((movement: any, index: number) => (
                  <div key={index} className="border border-gray-200 p-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-600">Floor {movement.floor}</span>
                      <span className="text-gray-500">
                        {new Date(movement.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      Location: {movement.latitude.toFixed(6)}, {movement.longitude.toFixed(6)}
                    </div>
                  </div>
                ))}
                {heatMapData.movements.length > 20 && (
                  <div className="text-center text-gray-500 py-2">
                    ... and {heatMapData.movements.length - 20} more movements
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
