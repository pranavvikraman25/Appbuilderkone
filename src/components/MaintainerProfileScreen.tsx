import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';
import { Screen } from '../App';

export function MaintainerProfileScreen({ 
  onNavigate,
  userEmail,
  userName 
}: { 
  onNavigate: (screen: Screen) => void;
  userEmail: string;
  userName: string;
}) {
  // Mock maintainer data - in real app this would come from backend
  const maintainerData = {
    name: userName || 'John Technician',
    email: userEmail,
    phone: '+358 40 123 4567',
    employeeId: 'KNE-MT-2024-001',
    department: 'Field Maintenance',
    location: 'Helsinki Region',
    joinDate: 'Jan 15, 2023',
    certifications: [
      'Elevator Safety Inspector Level 2',
      'KONE Technical Certification',
      'Electrical Systems Specialist'
    ],
    completedMaintenance: 147,
    activeAssignments: 3
  };

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate({ name: 'dashboard' })}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <div className="text-sm text-gray-600">Profile</div>
            <div className="text-[#005EB8]">Maintainer Details</div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Profile Header */}
        <div className="bg-white border border-gray-300 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#005EB8] flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="text-lg text-gray-900 mb-1">{maintainerData.name}</div>
            <div className="text-sm text-gray-600 mb-2">{maintainerData.department}</div>
            <div className="text-xs text-gray-500 px-3 py-1 bg-gray-100 border border-gray-200">
              {maintainerData.employeeId}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-gray-300 p-4">
          <div className="text-sm text-gray-600 mb-3">Contact Information</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">Email</div>
                <div className="text-sm text-gray-900">{maintainerData.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">Phone</div>
                <div className="text-sm text-gray-900">{maintainerData.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">Location</div>
                <div className="text-sm text-gray-900">{maintainerData.location}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">Join Date</div>
                <div className="text-sm text-gray-900">{maintainerData.joinDate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Work Statistics */}
        <div className="bg-white border border-gray-300 p-4">
          <div className="text-sm text-gray-600 mb-3">Work Statistics</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 border border-blue-200">
              <div className="text-2xl text-[#005EB8] mb-1">{maintainerData.completedMaintenance}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200">
              <div className="text-2xl text-green-700 mb-1">{maintainerData.activeAssignments}</div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white border border-gray-300 p-4">
          <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certifications
          </div>
          <div className="space-y-2">
            {maintainerData.certifications.map((cert, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200">
                <div className="w-1.5 h-1.5 rounded-full bg-[#005EB8] mt-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-700">{cert}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-xs text-gray-500 text-center pb-4">
          Profile data synced with KONE HR system
        </div>
      </div>
    </div>
  );
}
