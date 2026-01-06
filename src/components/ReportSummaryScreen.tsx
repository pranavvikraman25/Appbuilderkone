import { ArrowLeft, Download, Map } from 'lucide-react';
import { Screen } from '../App';

export function ReportSummaryScreen({ 
  sessionData, 
  onNavigate,
  onGoBack 
}: { 
  sessionData: any;
  onNavigate: (screen: Screen) => void;
  onGoBack?: () => void;
}) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatDuration = (startTime: Date, endTime: Date) => {
    const totalSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  const duration = formatDuration(sessionData.startTime, sessionData.endTime);
  
  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onGoBack ? onGoBack() : onNavigate({ name: 'dashboard' })}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <div className="text-sm text-gray-600">Session Report</div>
            <div className="text-[#005EB8]">{sessionData.elevatorId}</div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Session Summary Card */}
        <div className="bg-white border border-gray-300 p-4">
          <div className="text-sm text-gray-600 mb-3">Session Summary</div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Date</span>
              <span className="text-sm text-gray-900">{formatDate(sessionData.startTime)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Start Time</span>
              <span className="text-sm text-gray-900">{formatTime(sessionData.startTime)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">End Time</span>
              <span className="text-sm text-gray-900">{formatTime(sessionData.endTime)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Duration</span>
              <span className="text-sm text-gray-900">{duration}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Issues Resolved</span>
              <span className="text-sm text-green-700">{sessionData.issuesResolved}</span>
            </div>
          </div>
        </div>
        
        {/* Floors Visited */}
        <div className="bg-white border border-gray-300 p-4">
          <div className="text-sm text-gray-600 mb-3">Floors Visited</div>
          
          <div className="space-y-2">
            {sessionData.floorsVisited.map((visit: any, index: number) => {
              const mins = Math.floor(visit.duration);
              const secs = Math.floor((visit.duration - mins) * 60);
              const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
              return (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span className="text-sm text-gray-900">Floor {visit.floor}</span>
                  <span className="text-sm text-gray-600">{timeFormatted}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Movement Heat Map */}
        <div className="bg-white border border-gray-300 p-4">
          <div className="text-sm text-gray-600 mb-3">Movement Analysis</div>
          
          {sessionData.floorsVisited.map((visit: any, index: number) => (
            <button
              key={index}
              onClick={() => onNavigate({ name: 'floor-specific-heatmap', elevatorId: sessionData.elevatorId, floor: visit.floor })}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-400 hover:border-[#005EB8] transition-colors mb-2"
            >
              <span className="text-sm text-gray-700">View Floor {visit.floor} Heat Map</span>
              <Map className="w-4 h-4 text-gray-600" />
            </button>
          ))}
          
          <div className="text-xs text-gray-500 mt-2 text-center">
            Heat maps show where the maintainer worked during the session
          </div>
        </div>
        
        {/* Export Options */}
        <div className="bg-white border border-gray-300 p-4">
          <div className="text-sm text-gray-600 mb-3">Export Report</div>
          
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-400 hover:border-[#005EB8] transition-colors">
              <span className="text-sm text-gray-700">Generate TXT Report</span>
              <Download className="w-4 h-4 text-gray-600" />
            </button>
            
            <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-400 hover:border-[#005EB8] transition-colors">
              <span className="text-sm text-gray-700">Generate DOCX Report</span>
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-3 text-center">
            Reports are stored locally on the device
          </div>
        </div>
      </div>
      
      {/* Bottom Actions */}
      <div className="bg-white border-t border-gray-300 p-4">
        <button
          onClick={() => onNavigate({ name: 'dashboard' })}
          className="w-full bg-[#005EB8] text-white px-4 py-3 hover:bg-[#004a94] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}