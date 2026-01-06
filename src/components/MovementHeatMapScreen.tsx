import { ArrowLeft } from 'lucide-react';
import { Screen } from '../App';

const movementData = [
  { floor: 12, duration: 2, top: 5 },
  { floor: 11, duration: 15, top: 45 },
  { floor: 9, duration: 8, top: 125 },
  { floor: 7, duration: 20, top: 205 },
  { floor: 5, duration: 5, top: 285 },
  { floor: 4, duration: 25, top: 325 },
  { floor: 2, duration: 12, top: 405 },
  { floor: -2, duration: 6, top: 565 },
];

export function MovementHeatMapScreen({ 
  elevatorId, 
  onNavigate,
  onGoBack 
}: { 
  elevatorId: string;
  onNavigate: (screen: Screen) => void;
  onGoBack?: () => void;
}) {
  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onGoBack ? onGoBack() : onNavigate({ name: 'elevator-detail', elevatorId })}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <div className="text-sm text-gray-600">Movement Heat Map</div>
            <div className="text-[#005EB8]">{elevatorId}</div>
          </div>
        </div>
      </div>
      
      {/* Heat Map Visualization */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white border-2 border-gray-400 p-4 relative" style={{ height: '600px' }}>
            {/* Building shaft representation */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-300 -translate-x-1/2" />
            
            {/* Movement dots */}
            {movementData.map((point) => {
              // Calculate dot size based on duration (2-30 range)
              const dotSize = Math.min(Math.max(point.duration * 2 + 16, 24), 60);
              // Calculate opacity based on duration
              const opacity = Math.min(point.duration / 30, 0.9);
              
              return (
                <div key={point.floor} className="absolute left-1/2 -translate-x-1/2 group" style={{ top: `${point.top}px` }}>
                  <div
                    className="rounded-full bg-[#005EB8] cursor-pointer transition-transform hover:scale-110"
                    style={{
                      width: `${dotSize}px`,
                      height: `${dotSize}px`,
                      opacity: opacity,
                      marginLeft: `${-dotSize / 2}px`,
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Floor {point.floor}: {point.duration} min
                  </div>
                  {/* Floor label */}
                  <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 text-gray-600 text-xs">
                    {point.floor}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-4 bg-white border border-gray-300 p-3">
            <div className="text-xs text-gray-600 mb-2">Duration (minutes)</div>
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
        </div>
      </div>
    </div>
  );
}
