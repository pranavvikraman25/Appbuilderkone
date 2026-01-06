import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Screen } from '../App';

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
  onNavigate,
  onGoBack 
}: { 
  elevatorId: string; 
  onNavigate: (screen: Screen) => void;
  onGoBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'floors' | 'issues'>('floors');
  
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
