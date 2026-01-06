import { ArrowLeft, FileText } from 'lucide-react';
import { Screen } from '../App';

const savedReports = [
  {
    id: 1,
    elevatorId: 'ELV-001',
    date: new Date(2024, 11, 14, 9, 30),
    endDate: new Date(2024, 11, 14, 11, 15),
    floorsVisited: [12, 10, 7, 4, 2, -1],
    duration: 105 * 60, // in seconds
    issuesResolved: 4,
  },
  {
    id: 2,
    elevatorId: 'ELV-003',
    date: new Date(2024, 11, 13, 14, 0),
    endDate: new Date(2024, 11, 13, 15, 22),
    floorsVisited: [8, 5, 3, 1],
    duration: 82 * 60 + 15,
    issuesResolved: 2,
  },
  {
    id: 3,
    elevatorId: 'ELV-001',
    date: new Date(2024, 11, 12, 10, 15),
    endDate: new Date(2024, 11, 12, 11, 45),
    floorsVisited: [11, 9, 4],
    duration: 90 * 60 + 32,
    issuesResolved: 3,
  },
  {
    id: 4,
    elevatorId: 'ELV-004',
    date: new Date(2024, 11, 11, 8, 0),
    endDate: new Date(2024, 11, 11, 9, 18),
    floorsVisited: [6, 5, 4, 3, 2, 1],
    duration: 78 * 60 + 45,
    issuesResolved: 1,
  },
  {
    id: 5,
    elevatorId: 'ELV-002',
    date: new Date(2024, 11, 10, 13, 30),
    endDate: new Date(2024, 11, 10, 14, 25),
    floorsVisited: [5],
    duration: 55 * 60 + 12,
    issuesResolved: 1,
  },
];

export function SavedReports({ 
  onNavigate,
  onGoBack 
}: { 
  onNavigate: (screen: Screen) => void;
  onGoBack?: () => void;
}) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };
  
  const handleReportClick = (report: any) => {
    const sessionData = {
      elevatorId: report.elevatorId,
      startTime: report.date,
      endTime: report.endDate,
      floorsVisited: report.floorsVisited.map((floor: number) => ({
        floor,
        duration: report.duration / report.floorsVisited.length / 60, // rough estimate
      })),
      issuesResolved: report.issuesResolved,
    };
    onNavigate({ name: 'report-summary', sessionData });
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
            <div className="text-sm text-gray-600">Saved Reports</div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        <div className="text-xs text-gray-500 mb-2 text-center">
          Reports are stored locally on the device
        </div>
        
        {savedReports.map((report) => (
          <div
            key={report.id}
            onClick={() => handleReportClick(report)}
            className="bg-white border border-gray-300 p-4 cursor-pointer hover:border-[#005EB8] transition-colors"
          >
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#005EB8]">{report.elevatorId}</span>
                  <span className="text-xs text-gray-500">{formatDate(report.date)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
                  <div>
                    <span className="text-gray-500">Floors: </span>
                    {report.floorsVisited.length}
                  </div>
                  <div>
                    <span className="text-gray-500">Duration: </span>
                    {formatDuration(report.duration)}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Issues resolved: </span>
                    <span className="text-green-700">{report.issuesResolved}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
