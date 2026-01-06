import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Screen } from '../App';

const elevatorIssuesData = [
  { 
    elevatorId: 'ELV-001', 
    building: 'Tower A',
    floors: [
      { floor: 11, issues: [{ id: 1, description: 'Door sensor misalignment', status: 'open' }] },
      { floor: 9, issues: [
        { id: 2, description: 'Unusual vibration detected', status: 'open' },
        { id: 3, description: 'Call button not responding', status: 'resolved' },
      ]},
      { floor: 7, issues: [{ id: 4, description: 'Floor indicator flickering', status: 'open' }] },
      { floor: 4, issues: [
        { id: 5, description: 'Emergency light dim', status: 'open' },
        { id: 6, description: 'Handrail loose', status: 'resolved' },
        { id: 7, description: 'Door closing delay', status: 'open' },
      ]},
      { floor: 2, issues: [{ id: 8, description: 'Floor leveling issue', status: 'resolved' }] },
      { floor: -2, issues: [{ id: 9, description: 'Water leak detected', status: 'open' }] },
    ]
  },
  { 
    elevatorId: 'ELV-002', 
    building: 'Tower A',
    floors: [
      { floor: 5, issues: [{ id: 10, description: 'Panel scratches', status: 'open' }] },
    ]
  },
  { 
    elevatorId: 'ELV-003', 
    building: 'Office Building B',
    floors: [
      { floor: 8, issues: [
        { id: 11, description: 'Lighting flicker', status: 'open' },
        { id: 12, description: 'Button wear', status: 'resolved' },
      ]},
      { floor: 3, issues: [{ id: 13, description: 'Door alignment', status: 'open' }] },
    ]
  },
];

export function AllIssuesOverview({ 
  onNavigate,
  onGoBack 
}: { 
  onNavigate: (screen: Screen) => void;
  onGoBack?: () => void;
}) {
  const [expandedElevators, setExpandedElevators] = useState<string[]>([]);
  
  const toggleElevator = (elevatorId: string) => {
    setExpandedElevators(prev => 
      prev.includes(elevatorId) 
        ? prev.filter(id => id !== elevatorId)
        : [...prev, elevatorId]
    );
  };
  
  const getTotalIssues = (floors: any[]) => {
    return floors.reduce((sum, floor) => sum + floor.issues.length, 0);
  };
  
  const getOpenIssues = (floors: any[]) => {
    return floors.reduce((sum, floor) => 
      sum + floor.issues.filter((i: any) => i.status === 'open').length, 0
    );
  };
  
  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onGoBack ? onGoBack() : onNavigate({ name: 'dashboard' })}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <div className="text-sm text-gray-600">All Issues Overview</div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {elevatorIssuesData.map((elevator) => {
          const isExpanded = expandedElevators.includes(elevator.elevatorId);
          const totalIssues = getTotalIssues(elevator.floors);
          const openIssues = getOpenIssues(elevator.floors);
          
          return (
            <div key={elevator.elevatorId} className="bg-white border border-gray-300">
              {/* Elevator Header */}
              <div
                onClick={() => toggleElevator(elevator.elevatorId)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#005EB8]">{elevator.elevatorId}</span>
                    {openIssues > 0 && (
                      <div className="w-2 h-2 rounded-full bg-red-600" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{elevator.building}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {openIssues} open / {totalIssues} total issues
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              {/* Floor Details */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  {elevator.floors.map((floor) => (
                    <div key={floor.floor} className="p-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Floor {floor.floor}</span>
                        <span className="text-xs text-gray-500">
                          {floor.issues.filter((i: any) => i.status === 'open').length} / {floor.issues.length} open
                        </span>
                      </div>
                      
                      <div className="space-y-2 ml-4">
                        {floor.issues.map((issue: any) => (
                          <div key={issue.id} className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                              issue.status === 'open' ? 'bg-red-600' : 'bg-green-600'
                            }`} />
                            <div className="flex-1">
                              <div className={`text-xs ${
                                issue.status === 'resolved' ? 'text-gray-500 line-through' : 'text-gray-700'
                              }`}>
                                {issue.description}
                              </div>
                              <div className="text-xs text-gray-400 capitalize mt-0.5">
                                {issue.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
