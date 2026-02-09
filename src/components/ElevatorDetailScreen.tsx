import { ArrowLeft, Play, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Screen } from '../App';
import * as api from '../utils/api';

const floorsData = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2];
const issuesData = [
  { floor: 12, count: 0 },
  { floor: 11, count: 1 },
  { floor: 10, count: 0 },
  { floor: 9, count: 2 },
  { floor: 8, count: 0 },
  { floor: 7, count: 1 },
  { floor: 6, count: 0 },
  { floor: 5, count: 0 },
  { floor: 4, count: 3 },
  { floor: 3, count: 0 },
  { floor: 2, count: 1 },
  { floor: 1, count: 0 },
  { floor: 0, count: 0 },
  { floor: -1, count: 0 },
  { floor: -2, count: 1 },
];

export function ElevatorDetailScreen({ 
  elevatorId,
  userRole,
  onNavigate,
  onGoBack,
  onSessionStart
}: { 
  elevatorId: string;
  userRole: 'admin' | 'maintainer';
  onNavigate: (screen: Screen) => void;
  onGoBack?: () => void;
  onSessionStart?: (session: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<'floors' | 'issues'>('floors');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartMaintenance = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get elevator details
      const elevator = {
        id: elevatorId,
        building: 'Tower A', // Would normally fetch this
        location: 'Helsinki Central'
      };

      const response = await api.startMaintenanceSession(
        elevatorId,
        elevator.building,
        elevator.location
      );

      if (response.success && response.session) {
        onSessionStart?.(response.session);
        // Navigate to first floor
        onNavigate({ 
          name: 'floor-maintenance', 
          elevatorId, 
          floor: floorsData[0]
        });
      }
    } catch (error: any) {
      console.error('Failed to start maintenance:', error);
      setError(error.message || 'Failed to start maintenance');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onGoBack ? onGoBack() : onNavigate({ name: 'dashboard' })}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <span className="text-[#005EB8]">{elevatorId}</span>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-300">
          <button
            onClick={() => setActiveTab('floors')}
            className={`flex-1 pb-2 text-sm ${
              activeTab === 'floors'
                ? 'border-b-2 border-[#005EB8] text-[#005EB8]'
                : 'text-gray-600'
            }`}
          >
            Floors
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`flex-1 pb-2 text-sm ${
              activeTab === 'issues'
                ? 'border-b-2 border-[#005EB8] text-[#005EB8]'
                : 'text-gray-600'
            }`}
          >
            Issues
          </button>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-300 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-white border-b border-gray-300 p-4 space-y-2">
        <button
          onClick={handleStartMaintenance}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5" />
          <span>{loading ? 'Starting...' : 'Start Maintenance Session'}</span>
        </button>
        
        {userRole === 'admin' && (
          <button
            onClick={() => onNavigate({ name: 'movement-heatmap', elevatorId })}
            className="w-full bg-[#005EB8] hover:bg-[#004a94] text-white px-4 py-3 flex items-center justify-center gap-2 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            <span>View Heat Map (Admin)</span>
          </button>
        )}
        
        <p className="text-xs text-gray-500 text-center">
          {userRole === 'maintainer' 
            ? 'Movement tracking will begin automatically' 
            : 'Track and view maintainer movements'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'floors' && (
          <div className="p-4 space-y-2">
            {floorsData.map((floor) => (
              <div
                key={floor}
                onClick={() => onNavigate({ 
                  name: 'floor-maintenance', 
                  elevatorId, 
                  floor 
                })}
                className="bg-white border border-gray-300 p-4 flex items-center justify-between cursor-pointer hover:border-[#005EB8] transition-colors"
              >
                <span className="text-gray-700">Floor {floor}</span>
                <div className="text-gray-400 text-sm">→</div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'issues' && (
          <div className="p-4 space-y-2">
            {issuesData.map((item) => (
              <div
                key={item.floor}
                className="bg-white border border-gray-300 p-4 flex items-center justify-between"
              >
                <span className="text-gray-700">Floor {item.floor}</span>
                <div className="flex items-center gap-2">
                  {item.count > 0 ? (
                    <>
                      <span className="text-red-600">{item.count}</span>
                      <div className="w-2 h-2 rounded-full bg-red-600" />
                    </>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
