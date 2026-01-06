import { ArrowLeft } from 'lucide-react';
import { Screen } from '../App';

const elevatorMovementData = [
  { elevatorId: 'ELV-001', floors: [
    { floor: 12, duration: 120 },
    { floor: 10, duration: 480 },
    { floor: 7, duration: 1200 },
    { floor: 4, duration: 300 },
    { floor: 2, duration: 720 },
    { floor: -1, duration: 180 },
  ]},
  { elevatorId: 'ELV-003', floors: [
    { floor: 8, duration: 240 },
    { floor: 5, duration: 900 },
    { floor: 3, duration: 600 },
    { floor: 1, duration: 360 },
  ]},
];

export function MovementHeatMapOverview({ 
  onNavigate,
  onGoBack 
}: { 
  onNavigate: (screen: Screen) => void;
  onGoBack?: () => void;
}) {
  const getFloorPosition = (floor: number) => {
    // Map floor numbers to vertical positions (0-600px range)
    const minFloor = -2;
    const maxFloor = 12;
    const range = maxFloor - minFloor;
    return ((maxFloor - floor) / range) * 560 + 20;
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
            <div className="text-sm text-gray-600">Movement Heat Map Overview</div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="text-xs text-gray-500 mb-4 text-center">
          Heat intensity is based on time spent, not exact position
        </div>
        
        {elevatorMovementData.map((elevator) => (
          <div key={elevator.elevatorId} className="mb-8">
            <div className="text-sm text-gray-700 mb-3">{elevator.elevatorId}</div>
            
            <div className="bg-white border-2 border-gray-400 p-4 relative" style={{ height: '600px' }}>
              {/* Vertical shaft line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-300 -translate-x-1/2" />
              
              {/* Movement indicators */}
              {elevator.floors.map((point) => {
                const position = getFloorPosition(point.floor);
                const intensity = Math.min(point.duration / 1500, 1);
                const barWidth = Math.min(Math.max(point.duration / 10, 40), 120);
                const mins = Math.floor(point.duration / 60);
                const secs = point.duration % 60;
                const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                
                return (
                  <div key={point.floor} className="absolute left-1/2 -translate-x-1/2" style={{ top: `${position}px` }}>
                    {/* Floor label above bar */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 text-xs text-gray-700 font-medium whitespace-nowrap">
                      Floor {point.floor}
                    </div>
                    
                    {/* Heat bar */}
                    <div
                      className="bg-[#005EB8] h-3"
                      style={{
                        width: `${barWidth}px`,
                        opacity: 0.3 + (intensity * 0.6),
                        marginLeft: `${-barWidth / 2}px`,
                      }}
                    />
                    
                    {/* Duration label */}
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                      {timeFormatted}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Legend */}
        <div className="bg-white border border-gray-300 p-3 mt-4">
          <div className="text-xs text-gray-600 mb-2">Duration Intensity</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-3 bg-[#005EB8]" style={{ opacity: 0.3 }} />
              <span className="text-xs text-gray-600">Short</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-3 bg-[#005EB8]" style={{ opacity: 0.6 }} />
              <span className="text-xs text-gray-600">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-3 bg-[#005EB8]" style={{ opacity: 0.9 }} />
              <span className="text-xs text-gray-600">Long</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}