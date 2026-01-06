import { ArrowLeft } from 'lucide-react';
import { Screen } from '../App';

// Simulated movement zones within elevator car
const movementZones = [
  { x: 45, y: 30, duration: 120, label: 'Control panel' },
  { x: 120, y: 80, duration: 480, label: 'Door mechanism' },
  { x: 70, y: 140, duration: 240, label: 'Floor buttons' },
  { x: 150, y: 180, duration: 90, label: 'Inspection' },
  { x: 100, y: 240, duration: 360, label: 'Safety check' },
];

export function FloorSpecificHeatMap({ 
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
  // Navigate back function - will go back to the previous screen
  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      onNavigate({ name: 'dashboard' });
    }
  };
  
  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="flex items-center gap-3">
          <button onClick={handleBack}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <div className="text-sm text-gray-600">Floor {floor} Heat Map</div>
            <div className="text-[#005EB8]">{elevatorId}</div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="text-xs text-gray-500 mb-4 text-center">
          Heat intensity is based on time spent, not exact position
        </div>
        
        <div className="max-w-md mx-auto">
          {/* Elevator car outline */}
          <div className="bg-white border-2 border-gray-400 p-4 relative" style={{ height: '400px', width: '240px' }}>
            {/* Elevator car interior representation */}
            <div className="absolute inset-4 border border-gray-300 bg-gray-50">
              {/* Movement zones */}
              {movementZones.map((zone, index) => {
                const intensity = Math.min(zone.duration / 600, 1);
                const dotSize = Math.min(Math.max(zone.duration / 8, 20), 50);
                const mins = Math.floor(zone.duration / 60);
                const secs = zone.duration % 60;
                const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                
                return (
                  <div 
                    key={index} 
                    className="absolute group"
                    style={{ 
                      left: `${zone.x}px`, 
                      top: `${zone.y}px`,
                    }}
                  >
                    <div
                      className="rounded-full bg-[#005EB8] cursor-pointer"
                      style={{
                        width: `${dotSize}px`,
                        height: `${dotSize}px`,
                        opacity: 0.3 + (intensity * 0.6),
                        marginLeft: `${-dotSize / 2}px`,
                        marginTop: `${-dotSize / 2}px`,
                      }}
                    />
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {zone.label}: {timeFormatted}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Door outline */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-400" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 -mt-4">
              Door
            </div>
          </div>
          
          {/* Legend */}
          <div className="bg-white border border-gray-300 p-3 mt-4">
            <div className="text-xs text-gray-600 mb-2">Duration (time spent)</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#005EB8]" style={{ opacity: 0.3 }} />
                <span className="text-xs text-gray-600">Short</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#005EB8]" style={{ opacity: 0.6 }} />
                <span className="text-xs text-gray-600">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#005EB8]" style={{ opacity: 0.9 }} />
                <span className="text-xs text-gray-600">Long</span>
              </div>
            </div>
          </div>
          
          {/* Footer note */}
          <div className="text-xs text-gray-500 mt-4 text-center">
            Based on phone sensor activity and timestamps
          </div>
        </div>
      </div>
    </div>
  );
}