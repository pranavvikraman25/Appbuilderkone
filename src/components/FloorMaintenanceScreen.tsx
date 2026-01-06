import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Screen } from '../App';

const mockIssues = [
  { id: 1, description: 'Door sensor misalignment', resolved: false },
  { id: 2, description: 'Unusual vibration detected', resolved: false },
  { id: 3, description: 'Call button not responding', resolved: true },
  { id: 4, description: 'Floor indicator flickering', resolved: false },
];

export function FloorMaintenanceScreen({ 
  elevatorId, 
  floor, 
  onNavigate,
  onGoBack 
}: { 
  elevatorId: string; 
  floor: number;
  onNavigate: (screen: Screen) => void;
  onGoBack?: () => void;
}) {
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [issues, setIssues] = useState(mockIssues);
  const [startTime] = useState(new Date());
  
  const handleStartMaintenance = () => {
    setIsMaintenanceActive(true);
  };
  
  const handleEndMaintenance = () => {
    const endTime = new Date();
    const sessionData = {
      elevatorId,
      startTime,
      endTime,
      floorsVisited: [{ floor, duration: Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60) }],
      issuesResolved: issues.filter(i => i.resolved).length,
    };
    onNavigate({ name: 'report-summary', sessionData });
  };
  
  const toggleIssue = (id: number) => {
    setIssues(issues.map(issue => 
      issue.id === id ? { ...issue, resolved: !issue.resolved } : issue
    ));
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
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {!isMaintenanceActive ? (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={handleStartMaintenance}
              className="bg-[#005EB8] text-white px-8 py-4 border-2 border-[#005EB8] hover:bg-[#004a94] transition-colors"
            >
              Start Maintenance
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-300 p-3 text-sm text-green-800">
              Maintenance session active
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-3">Issues on this floor:</div>
              <div className="space-y-2">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="bg-white border border-gray-300 p-3 flex items-start gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={issue.resolved}
                      onChange={() => toggleIssue(issue.id)}
                      className="mt-1 w-4 h-4 accent-[#005EB8]"
                    />
                    <div className="flex-1">
                      <div className={`text-sm ${issue.resolved ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                        {issue.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Actions */}
      {isMaintenanceActive && (
        <div className="bg-white border-t border-gray-300 p-4">
          <button
            onClick={handleEndMaintenance}
            className="w-full bg-[#005EB8] text-white px-4 py-3 hover:bg-[#004a94] transition-colors"
          >
            End Maintenance
          </button>
        </div>
      )}
    </div>
  );
}