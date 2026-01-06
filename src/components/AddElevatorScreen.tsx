import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Screen } from '../App';

export function AddElevatorScreen({ 
  onAddElevator,
  onNavigate,
  onGoBack 
}: { 
  onAddElevator: (elevator: any) => void;
  onNavigate: (screen: Screen) => void;
  onGoBack?: () => void;
}) {
  const [equipmentId, setEquipmentId] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [location, setLocation] = useState('');
  const [numFloors, setNumFloors] = useState('');
  const [useDefaultIssues, setUseDefaultIssues] = useState(true);
  const [error, setError] = useState('');

  const handleCreate = () => {
    setError('');
    
    if (!equipmentId || !buildingName || !location || !numFloors) {
      setError('Please fill in all required fields');
      return;
    }
    
    const floors = parseInt(numFloors);
    if (isNaN(floors) || floors < 1 || floors > 50) {
      setError('Number of floors must be between 1 and 50');
      return;
    }
    
    const newElevator = {
      id: equipmentId,
      building: buildingName,
      location: location,
      status: 'active',
      numFloors: floors,
      useDefaultIssues
    };
    
    onAddElevator(newElevator);
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
            <div className="text-sm text-gray-600">Add Elevator</div>
            <div className="text-xs text-gray-500">Navigation flow demonstration</div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          
          {/* Form */}
          <div className="bg-white border border-gray-300 p-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Equipment ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                placeholder="e.g., ELV-006"
                className="w-full px-3 py-2 border border-gray-300 bg-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Building Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                placeholder="e.g., Tower B"
                className="w-full px-3 py-2 border border-gray-300 bg-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Location <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Helsinki Central"
                className="w-full px-3 py-2 border border-gray-300 bg-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Number of Floors <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={numFloors}
                onChange={(e) => setNumFloors(e.target.value)}
                placeholder="e.g., 15"
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 bg-white text-sm"
              />
              <div className="text-xs text-gray-500 mt-1">
                Floor list will be auto-generated
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="defaultIssues"
                checked={useDefaultIssues}
                onChange={(e) => setUseDefaultIssues(e.target.checked)}
                className="w-4 h-4 accent-[#005EB8]"
              />
              <label htmlFor="defaultIssues" className="text-sm text-gray-700">
                Use default issue set
              </label>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Elevator data stored locally for prototype
          </div>
        </div>
      </div>
      
      {/* Bottom Actions */}
      <div className="bg-white border-t border-gray-300 p-4">
        <button
          onClick={handleCreate}
          className="w-full bg-[#005EB8] text-white px-4 py-3 hover:bg-[#004a94] transition-colors"
        >
          Create Elevator
        </button>
      </div>
    </div>
  );
}
